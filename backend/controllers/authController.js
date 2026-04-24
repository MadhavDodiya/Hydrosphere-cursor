import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import { sendEmail, sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } from "../services/emailService.js";

/**
 * Sign short-lived Access JWT
 */
function signAccessToken(user) {
  // In production: short-lived 15m access token + refresh token rotation
  // In dev: 24h so local sessions don't expire mid-development
  const expiresIn = process.env.NODE_ENV === "production" ? "15m" : "24h";
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn }
  );
}

/**
 * Sign long-lived Refresh JWT
 */
function signRefreshToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

function setRefreshTokenCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function appBaseUrl() {
  const base = process.env.FRONTEND_URL?.split(",")?.[0]?.trim();
  return (base || "http://localhost:5173").replace(/\/$/, "");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Common public user object mapping (Task #5: use _id consistently)
 */
function publicUser(user) {
  return {
    _id: user._id, 
    name: user.name,
    email: user.email,
    role: user.role,
    companyName: user.companyName || "",
    phone: user.phone || "",
    isVerified: Boolean(user.isVerified),
    isApproved: Boolean(user.isApproved), // Bug fix: was missing, caused approval banner not to show after login
    emailVerified: Boolean(user.emailVerified),
    plan: user.plan || "free",
    subscriptionStatus: user.subscriptionStatus || "inactive",
  };
}

/**
 * Register a new buyer or seller.
 */
export async function register(req, res) {
  try {
    const { name, email, password, role, businessRegistrationNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const trimmedName = String(name).trim();
    const normalizedRole = role === "supplier" ? "seller" : role;
    if (!["buyer", "seller"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = hashToken(verificationToken);
    const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    const user = await User.create({
      name: trimmedName,
      email: email.toLowerCase(),
      password: hashed,
      role: normalizedRole,
      businessRegistrationNumber: normalizedRole === "seller" ? String(businessRegistrationNumber || "").trim() : "",
      emailVerified: false,
      emailVerificationToken: verificationTokenHash,
      emailVerificationExpires: verificationExpires,
    });

    console.log("[REGISTER] New User:", user._id);

    // Email verification (non-blocking)
    sendVerificationEmail(user.email, verificationToken, appBaseUrl())
      .catch(err => console.error("[REGISTER] Verification email failed:", err.message));

    // Bug fix: don't log them in immediately if we require verification to login.
    // This maintains consistency with the login() blocking logic.
    return res.status(201).json({
      message: "Registration successful! Please check your email to verify your account.",
      user: publicUser(user),
    });
  } catch (err) {
    console.error("[REGISTER Error]:", err);
    return res.status(500).json({ message: "Registration failed" });
  }
}

/**
 * Login with email and password.
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.emailVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended" });
    }

    console.log("[LOGIN] User:", user._id);

    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshTokenCookie(res, refreshToken);

    return res.json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error("[LOGIN Error]:", err);
    return res.status(500).json({ message: "Login failed" });
  }
}

/**
 * GET /api/auth/verify-email?token=...&email=...
 */
export async function verifyEmail(req, res) {
  try {
    const { token, email } = req.query;
    if (!token || !email) {
      return res.status(400).json({ message: "token and email are required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid verification link" });

    const tokenHash = hashToken(String(token));
    if (!user.emailVerificationToken || user.emailVerificationToken !== tokenHash) {
      return res.status(400).json({ message: "Invalid verification link" });
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ message: "Verification link expired" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = "";
    user.emailVerificationExpires = null;
    await user.save();

    // Trigger welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name).catch((err) =>
      console.error("[VERIFY] Welcome email failed:", err.message)
    );

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("[VERIFY EMAIL Error]:", err);
    return res.status(500).json({ message: "Email verification failed" });
  }
}

/**
 * POST /api/auth/resend-verification { email }
 */
export async function resendVerification(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.json({ message: "If the email exists, a verification email was sent." });
    if (user.emailVerified) return res.json({ message: "Email already verified" });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = hashToken(verificationToken);
    user.emailVerificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await user.save();

    sendVerificationEmail(user.email, verificationToken, appBaseUrl())
      .catch(err => console.error("[RESEND] Email failed:", err.message));

    return res.json({ message: "Verification email sent" });
  } catch (err) {
    console.error("[RESEND VERIFY Error]:", err);
    return res.status(500).json({ message: "Failed to resend verification email" });
  }
}

/**
 * POST /api/auth/forgot-password { email }
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.json({ message: "If the email exists, a reset link was sent." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 30); // 30m
    await user.save();

    sendPasswordResetEmail(user.email, resetToken, appBaseUrl())
      .catch(err => console.error("[FORGOT] Email failed:", err.message));

    return res.json({ message: "If the email exists, a reset link was sent." });
  } catch (err) {
    console.error("[FORGOT PASSWORD Error]:", err);
    return res.status(500).json({ message: "Failed to start password reset" });
  }
}

/**
 * POST /api/auth/reset-password { email, token, password }
 */
export async function resetPassword(req, res) {
  try {
    const { email, token, password } = req.body;
    if (!email || !token || !password) {
      return res.status(400).json({ message: "email, token, and password are required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid reset link" });

    const tokenHash = hashToken(String(token));
    if (!user.passwordResetToken || user.passwordResetToken !== tokenHash) {
      return res.status(400).json({ message: "Invalid reset link" });
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      return res.status(400).json({ message: "Reset link expired" });
    }

    user.password = await bcrypt.hash(String(password), 10);
    user.passwordResetToken = "";
    user.passwordResetExpires = null;
    await user.save();

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("[RESET PASSWORD Error]:", err);
    return res.status(500).json({ message: "Password reset failed" });
  }
}

/**
 * POST /api/auth/refresh
 * Refreshes the access token using the HttpOnly refresh token cookie.
 */
export async function refreshToken(req, res) {
  try {
    const rToken = req.cookies?.refreshToken;
    if (!rToken) return res.status(401).json({ message: "No refresh token provided" });

    const decoded = jwt.verify(rToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) return res.status(401).json({ message: "Invalid refresh token" });
    if (user.isSuspended) return res.status(403).json({ message: "Account suspended" });

    const newToken = signAccessToken(user);
    return res.json({ token: newToken, user: publicUser(user) });
  } catch (err) {
    console.error("[REFRESH TOKEN Error]:", err.message);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
}

/**
 * POST /api/auth/logout
 * Clears the refresh token cookie.
 */
export async function logout(req, res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.json({ message: "Logged out successfully" });
}


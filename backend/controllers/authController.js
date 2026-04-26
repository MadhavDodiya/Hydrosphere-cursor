import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import { sendEmail, sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } from "../services/emailService.js";
import { trackEvent, ANALYTICS_EVENTS } from "../services/analyticsService.js";

/**
 * Sign short-lived Access JWT
 */
function signAccessToken(user) {
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
 * Common public user object mapping
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
    isApproved: Boolean(user.isApproved),
    emailVerified: Boolean(user.emailVerified),
    plan: user.plan || "free",
    subscriptionStatus: user.subscriptionStatus || "inactive",
    trialActive: Boolean(user.trialActive),
    trialExpiresAt: user.trialExpiresAt || null,
  };
}

/**
 * Register a new buyer or supplier.
 */
export async function register(req, res) {
  try {
    const { name, email, password, role, companyName, location, businessRegistrationNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (role === "supplier" && (!companyName || !location || !businessRegistrationNumber)) {
      return res.status(400).json({ success: false, message: "Company name, location, and registration number are required for suppliers" });
    }

    const trimmedName = String(name).trim();
    if (!["buyer", "supplier"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = hashToken(verificationToken);
    const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    const user = await User.create({
      name: trimmedName,
      email: email.toLowerCase(),
      password: hashed,
      role: role,
      companyName: companyName || "",
      location: location || "",
      businessRegistrationNumber: String(businessRegistrationNumber || "").trim(),
      emailVerified: false,
      emailVerificationToken: verificationTokenHash,
      emailVerificationExpires: verificationExpires,
      plan: "free",
      trialActive: true,
      trialExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      subscriptionStatus: "active",
    });

    // Send emails in background
    sendVerificationEmail(user.email, verificationToken, appBaseUrl()).catch(() => {});
    sendWelcomeEmail(user.email, user.name).catch(() => {});
    
    // Track Events
    trackEvent(user._id, ANALYTICS_EVENTS.SIGNUP, { role: user.role });
    if (user.trialActive) trackEvent(user._id, ANALYTICS_EVENTS.TRIAL_STARTED);

    // Login automatically
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      message: "Registration successful! Welcome to your free trial.",
      data: {
        token: accessToken,
        user: publicUser(user)
      }
    });
  } catch (err) {
    console.error("[REGISTER Error]:", err);
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
}

/**
 * Login handler
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: "Your account has been suspended" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshTokenCookie(res, refreshToken);

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        token: accessToken,
        user: publicUser(user),
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Login failed" });
  }
}

/**
 * Verify Email Token
 */
export async function verifyEmail(req, res) {
  try {
    const { token, email } = req.query;
    if (!token || !email) return res.status(400).json({ success: false, message: "Missing token or email" });

    const hashed = hashToken(token);
    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: "Invalid or expired verification link" });

    user.emailVerified = true;
    user.emailVerificationToken = "";
    user.emailVerificationExpires = null;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully! You can now log in." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Verification failed" });
  }
}

/**
 * Resend Verification
 */
export async function resendVerification(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), emailVerified: false });
    if (!user) return res.status(404).json({ success: false, message: "Unverified user not found with this email" });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = hashToken(verificationToken);
    user.emailVerificationToken = verificationTokenHash;
    user.emailVerificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await user.save();

    await sendVerificationEmail(user.email, verificationToken, appBaseUrl());
    return res.json({ success: true, message: "Verification email resent!" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to resend email" });
  }
}

/**
 * Forgot Password
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken, appBaseUrl());
    return res.json({ success: true, message: "Password reset link sent to your email." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to send reset email" });
  }
}

/**
 * Reset Password
 */
export async function resetPassword(req, res) {
  try {
    const { token, email, password } = req.body;
    const hashed = hashToken(token);
    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: "Invalid or expired reset link" });

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = "";
    user.passwordResetExpires = null;
    await user.save();

    return res.json({ success: true, message: "Password reset successful! You can now log in." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to reset password" });
  }
}

/**
 * Refresh Access Token
 */
export async function refreshToken(req, res) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: "No refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.isSuspended) return res.status(403).json({ success: false, message: "Unauthorized" });

    const newAccessToken = signAccessToken(user);
    return res.json({ 
      success: true, 
      message: "Token refreshed",
      data: { token: newAccessToken, user: publicUser(user) } 
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
}

/**
 * Logout
 */
export async function logout(_req, res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.json({ success: true, message: "Logged out" });
}


/**
 * Get current user (me)
 */
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({
      success: true,
      message: "User session active",
      data: { user: publicUser(user) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

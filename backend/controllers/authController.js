import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Sign JWT for user
 */
function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
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
    plan: user.plan || "free",
    subscriptionStatus: user.subscriptionStatus || "inactive",
  };
}

/**
 * Register a new buyer or seller.
 */
export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const trimmedName = String(name).trim();
    if (!["buyer", "seller"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: trimmedName,
      email: email.toLowerCase(),
      password: hashed,
      role,
    });

    console.log("[REGISTER] New User:", user._id);

    const token = signToken(user);
    return res.status(201).json({
      token,
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

    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended" });
    }

    console.log("[LOGIN] User:", user._id);

    const token = signToken(user);
    return res.json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error("[LOGIN Error]:", err);
    return res.status(500).json({ message: "Login failed" });
  }
}

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyName: user.companyName || "",
    isVerified: Boolean(user.isVerified),
  };
}

/**
 * Register a new buyer or seller.
 */
export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "name, email, password, and role are required" });
    }

    const trimmedName = String(name).trim();
    if (trimmedName.length < 1) {
      return res.status(400).json({ message: "name is required" });
    }

    if (!["buyer", "seller"].includes(role)) {
      return res.status(400).json({ message: "role must be buyer or seller" });
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

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error during registration" });
  }
}

/**
 * Login with email and password.
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during login" });
  }
}

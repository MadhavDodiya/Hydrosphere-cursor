import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Verifies JWT from Authorization: Bearer <token>, checks the user is not
 * suspended in the DB, then attaches req.userId and req.userRole.
 */
export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  try {
    const user = await User.findById(decoded.userId).select("isSuspended role");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.isSuspended) {
      return res.status(403).json({ message: "Your account has been suspended. Please contact support." });
    }
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    console.error("[auth] DB error during suspension check:", err);
    return res.status(500).json({ message: "Server error during authentication" });
  }
}

/**
 * Ensures the authenticated user is a seller.
 */
export function requireSeller(req, res, next) {
  if (req.userRole !== "seller") {
    return res.status(403).json({ message: "Seller role required" });
  }
  next();
}

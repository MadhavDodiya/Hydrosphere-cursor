import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authorizeRoles } from "./role.js";

/**
 * Verifies JWT from Authorization: Bearer <token>.
 * Attaches req.userId and req.role for downstream use.
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
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  try {
    const user = await User.findById(decoded.userId).select(
      "role isSuspended plan subscriptionStatus listingLimit leadLimit isVerified emailVerified isApproved"
    );
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    if (user.isSuspended) {
      return res.status(403).json({ message: "Your account has been suspended." });
    }

    req.userId = decoded.userId;
    req.role = user.role; // Extract role from DB to be safe
    req.plan = user.plan || "free";
    req.subscriptionStatus = user.subscriptionStatus || "inactive";
    req.listingLimit = typeof user.listingLimit === "number" ? user.listingLimit : null;
    req.leadLimit = typeof user.leadLimit === "number" ? user.leadLimit : null;
    req.isSupplierVerified = Boolean(user.isVerified);
    req.emailVerified = Boolean(user.emailVerified);
    req.isApproved = Boolean(user.isApproved);
    
    console.log(
      `[AUTH] Authenticated User: ${req.userId} (Role: ${req.role}, Plan: ${req.plan}, Sub: ${req.subscriptionStatus})`
    );
    next();
  } catch (err) {
    console.error("[auth] error during authentication:", err);
    return res.status(500).json({ message: "Server error during authentication" });
  }
}

/**
 * Ensures the authenticated user is a supplier.
 */
export function requireSupplier(req, res, next) {
  return authorizeRoles("supplier")(req, res, next);
}

/**
 * Ensures the authenticated user has verified their email.
 */
export function requireEmailVerified(req, res, next) {
  if (!req.emailVerified) {
    return res.status(403).json({ message: "Email verification required. Please check your inbox." });
  }
  next();
}

import jwt from "jsonwebtoken";

/**
 * Verifies JWT from Authorization: Bearer <token> and attaches req.user.
 */
export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
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

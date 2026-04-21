/**
 * Middleware ensuring current user has the 'admin' role.
 * Requires authenticate middleware to be run before this.
 */
export const requireAdmin = (req, res, next) => {
  if (req.role !== "admin") {
    return res.status(403).json({ 
      message: "Forbidden: Admin access required" 
    });
  }
  next();
};

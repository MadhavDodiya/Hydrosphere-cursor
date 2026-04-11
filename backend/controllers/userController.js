import User from "../models/User.js";

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
 * GET /api/users/me
 */
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(publicUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
}

/**
 * PUT /api/users/me
 * Minimal profile update: sellers can set companyName.
 */
export async function updateMe(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { companyName } = req.body || {};

    if (companyName != null) {
      if (user.role !== "seller") {
        return res.status(403).json({ message: "Seller role required" });
      }
      user.companyName = String(companyName).trim();
    }

    await user.save();
    return res.json(publicUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
}


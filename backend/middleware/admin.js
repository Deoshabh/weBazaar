module.exports = (req, res, next) => {
  // ✅ CORS Fix: Bypass OPTIONS preflight requests
  // Traefik handles preflight at proxy level, auth not needed
  if (req.method === "OPTIONS") {
    return next();
  }

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

const jwt = require("jsonwebtoken");

// Verify JWT on protected routes
exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token, access denied" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { ...decoded, _id: decoded._id || decoded.id }; // ✅ normalize id → _id
    next();
  } catch {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

// Only allow admins
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Admin access required" });
  next();
};

// Allow both authenticated and unauthenticated users
exports.optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { ...decoded, _id: decoded._id || decoded.id }; // ✅ normalize here too
    } catch (_) {
      // Invalid token — continue as unauthenticated
    }
  }
  next();
};
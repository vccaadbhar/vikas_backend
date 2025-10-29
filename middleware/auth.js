const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ msg: 'No token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id).select('-password');
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Invalid token' });
  }
}
function permit(...allowedRoles) {
  return (req, res, next) => {
    if (req.user && allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: "Forbidden" });
    }
  };
}

module.exports = { auth, isTeacherOrAdmin, permit };

function isTeacherOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // backend uses 'superadmin' not 'admin'
  if (req.user.role === "superadmin" || req.user.role === "teacher") {
    return next();
  }
  return res.status(403).json({
    error: "Forbidden: Only teachers or superadmin can manage classes",
  });
}

module.exports = { auth, isTeacherOrAdmin, permit };

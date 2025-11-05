const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Akses ditolak, token tidak ditemukan" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    res.status(401).json({ message: "Token tidak valid" });
  }
};

function validateRole(allowedRoles) {
  return function (req, res, next) {
    try {
      if (!req.user || !req.user.roles || !Array.isArray(req.user.roles)) {
        throw new Error("User roles are not properly defined");
      }

      const hasRole = req.user.roles.some((role) =>
        allowedRoles.includes(role)
      );

      if (hasRole) {
        return next();
      } else {
        return res.status(403).json({
          message: "Akses ditolak. Anda tidak memiliki izin yang cukup.",
        });
      }
    } catch (error) {
      console.error("Error in validateRole middleware:", error.message);
      return res.status(500).json({
        message: "Terjadi kesalahan dalam server.",
      });
    }
  };
}

module.exports = { verifyToken, validateRole };

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'careerpilot_secret_key_2026_xyz123');

      // Specifically lookup the Admin schema
      req.admin = await Admin.findById(decoded.id);

      if (!req.admin) {
        return res.status(401).json({ success: false, message: 'Not authorized as admin' });
      }

      // Keep req.user populated with admin for compatibility with some routes if needed, 
      // but ideally use req.admin for strict admin routes.
      req.user = req.admin; 

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protectAdmin };

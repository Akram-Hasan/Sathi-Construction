const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      logger.warn("Authentication failed - no token provided", {
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.debug("JWT token verified", { userId: decoded.id });
      
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        logger.warn("Authentication failed - user not found", {
          userId: decoded.id,
          path: req.path
        });
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      logger.debug("Authentication successful", {
        userId: req.user._id,
        email: req.user.email,
        role: req.user.role,
        path: req.path
      });
      
      next();
    } catch (err) {
      logger.warn("Authentication failed - invalid token", {
        error: err.message,
        path: req.path,
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    logger.error("Authentication middleware error", error, {
      path: req.path,
      method: req.method
    });
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.warn("Authorization failed - insufficient permissions", {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
        method: req.method
      });
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    
    logger.debug("Authorization successful", {
      userId: req.user._id,
      role: req.user.role,
      path: req.path
    });
    
    next();
  };
};



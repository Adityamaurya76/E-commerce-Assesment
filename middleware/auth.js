import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {

      return res.status(401).json({success: false, message: 'Invalid token.'});
    }
    
    if (error.name === 'TokenExpiredError') {

      return res.status(401).json({success: false, message: 'Token expired.'});
    }
    
    return res.status(500).json({success: false, message: 'Server error during authentication.'});
  }
};

// Authorization middleware for admin only
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {

    return res.status(403).json({success: false, message: 'Access denied. Admin privileges required.'});
  }
  next();
};

// Authorization middleware for user only
const authorizeUser = (req, res, next) => {
  if (req.user.role !== 'USER') {
    return res.status(403).json({success: false, message: 'Access denied. User privileges required.'});
  }
  next();
};

export {
  generateToken,
  authenticate,
  authorizeAdmin,
  authorizeUser
};


const NodeCache = require('node-cache');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Initialize cache for decoded tokens
const tokenCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Middleware to authenticate JWT tokens
 * Verifies the token from Authorization header or cookies
 */
const auth = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  // Check for token in Authorization header
  let token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } 
  // Check for token in cookies as fallback
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token found, return unauthorized
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    // Check cache for decoded token
    let decoded = tokenCache.get(token);

    if (!decoded) {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      tokenCache.set(token, decoded); // Cache the decoded token
    }

    // Add user from payload to request object
    req.user = decoded;

    // Implement sliding expiration
    const remainingTime = decoded.exp * 1000 - Date.now();
    if (remainingTime < 5 * 60 * 1000) { // Less than 5 minutes remaining
      const newToken = jwt.sign(decoded, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '1h' });
      res.set('x-new-token', newToken);
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired', 
        expired: true 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

/**
 * Middleware to check if user has admin role
 * Must be used after auth middleware
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.user_type === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

/**
 * Middleware to check if user has rider role
 * Must be used after auth middleware
 */
const riderOnly = (req, res, next) => {
  if (req.user && req.user.user_type === 'rider') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Rider privileges required.' 
    });
  }
};

module.exports = { auth, adminOnly, riderOnly };
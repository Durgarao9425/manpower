const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
require('dotenv').config();

const router = express.Router();

/**
 * @route   POST /api/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/', async (req, res) => {
  console.log('Login attempt:', req.body);
  const { username, password } = req.body;
  
  if (!username || !password) {
    console.log('Login failed: Missing username or password');
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required' 
    });
  }
  
  try {
    // Find user by username
    console.log('Querying database for user:', username);
    const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (results.length === 0) {
      console.log('Login failed: User not found');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    const user = results[0];
    console.log('User found:', user.id, user.username, user.user_type);
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }
    
    console.log('Password verified successfully');

    // Prepare user data (exclude sensitive information)
    const userData = {
      id: user.id,
      company_id: user.company_id,
      username: user.username,
      email: user.email,
      user_type: user.user_type,
      full_name: user.full_name,
      phone: user.phone,
      address: user.address,
      profile_image: user.profile_image,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    // Create payload for JWT
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      user_type: user.user_type,
      company_id: user.company_id
    };

    // Generate access token
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );

    // Generate refresh token (longer expiration)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    // Set refresh token in HttpOnly cookie if enabled
    if (process.env.USE_COOKIE === 'true') {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
      });
    }

    // Send response
    res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken: process.env.USE_COOKIE === 'true' ? undefined : refreshToken,
      user: userData,
      expiresIn: parseInt(process.env.JWT_EXPIRE_SECONDS || '3600')
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route   POST /api/login/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', async (req, res) => {
  // Get refresh token from request body or cookie
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ 
      success: false, 
      message: 'Refresh token is required' 
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
    
    // Get user from database
    const [results] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    
    if (results.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      });
    }

    const user = results[0];

    // Create payload for new access token
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      user_type: user.user_type,
      company_id: user.company_id
    };

    // Generate new access token
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );

    // Send response
    res.json({
      success: true,
      accessToken,
      expiresIn: parseInt(process.env.JWT_EXPIRE_SECONDS || '3600')
    });

  } catch (err) {
    console.error('Token refresh error:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token expired' 
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Invalid refresh token' 
    });
  }
});

/**
 * @route   POST /api/login/logout
 * @desc    Logout user by clearing cookies
 * @access  Public
 */
router.post('/logout', (req, res) => {
  // Clear refresh token cookie if it exists
  if (req.cookies?.refreshToken) {
    res.clearCookie('refreshToken');
  }
  
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

module.exports = router;

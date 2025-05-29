// Option 1: Using Express Session (Recommended)
// First install: npm install express-session

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const app = express();

// Configure session middleware
app.use(session({
  secret: 'your-secret-key', // Change this to a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

const router = express.Router();

// Modified Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
     
  if (!username || !password) {
    return res.status(400).json({
       error: 'Username and password are required'
     });
  }
     
  try {
    const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
         
    if (results.length === 0) {
      console.log('Login attempt failed: User not found -', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = results[0];
         
    const isPasswordValid = await bcrypt.compare(password, user.password);
         
    if (!isPasswordValid) {
      console.log('Login attempt failed: Invalid password for user -', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

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

    // Store user data in session
    req.session.user = userData;
    req.session.isAuthenticated = true;
         
    res.json({
      success: true,
      message: 'Login successful',
      user: userData
    });
       
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Current User Details API
router.get('/me', (req, res) => {
  // Check if user is authenticated
  if (!req.session.isAuthenticated || !req.session.user) {
    return res.status(401).json({ 
      error: 'Not authenticated. Please login first.' 
    });
  }

  res.json({
    success: true,
    user: req.session.user
  });
});

// Get User Profile API (alternative endpoint)
router.get('/profile', (req, res) => {
  if (!req.session.isAuthenticated || !req.session.user) {
    return res.status(401).json({ 
      error: 'Not authenticated. Please login first.' 
    });
  }

  res.json({
    success: true,
    message: 'User profile retrieved successfully',
    user: req.session.user
  });
});

// Update User Profile API
router.put('/profile', async (req, res) => {
  if (!req.session.isAuthenticated || !req.session.user) {
    return res.status(401).json({ 
      error: 'Not authenticated. Please login first.' 
    });
  }

  const userId = req.session.user.id;
  const { full_name, email, phone, address } = req.body;

  try {
    // Update user in database
    await db.query(
      'UPDATE users SET full_name = ?, email = ?, phone = ?, address = ?, updated_at = NOW() WHERE id = ?',
      [full_name, email, phone, address, userId]
    );

    // Fetch updated user data
    const [results] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const updatedUser = results[0];

    const userData = {
      id: updatedUser.id,
      company_id: updatedUser.company_id,
      username: updatedUser.username,
      email: updatedUser.email,
      user_type: updatedUser.user_type,
      full_name: updatedUser.full_name,
      phone: updatedUser.phone,
      address: updatedUser.address,
      profile_image: updatedUser.profile_image,
      status: updatedUser.status,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at
    };

    // Update session data
    req.session.user = userData;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userData
    });

  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout API
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Could not log out' });
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// Middleware to protect routes
const requireAuth = (req, res, next) => {
  if (!req.session.isAuthenticated || !req.session.user) {
    return res.status(401).json({ 
      error: 'Authentication required. Please login first.' 
    });
  }
  next();
};

// Example of protected route
router.get('/dashboard', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to dashboard',
    user: req.session.user
  });
});

module.exports = router;

// =================================================================

// Option 2: Using JWT Tokens (Alternative Approach)
// First install: npm install jsonwebtoken

const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-jwt-secret-key'; // Change this to a strong secret

// Modified Login Route with JWT
router.post('/login-jwt', async (req, res) => {
  const { username, password } = req.body;
     
  if (!username || !password) {
    return res.status(400).json({
       error: 'Username and password are required'
     });
  }
     
  try {
    const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
         
    if (results.length === 0) {
      console.log('Login attempt failed: User not found -', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = results[0];
         
    const isPasswordValid = await bcrypt.compare(password, user.password);
         
    if (!isPasswordValid) {
      console.log('Login attempt failed: Invalid password for user -', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

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

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
         
    res.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token: token
    });
       
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch current user data from database
    const [results] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = results[0];
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Get Current User Details API (JWT Version)
router.get('/me-jwt', authenticateToken, (req, res) => {
  const userData = {
    id: req.user.id,
    company_id: req.user.company_id,
    username: req.user.username,
    email: req.user.email,
    user_type: req.user.user_type,
    full_name: req.user.full_name,
    phone: req.user.phone,
    address: req.user.address,
    profile_image: req.user.profile_image,
    status: req.user.status,
    created_at: req.user.created_at,
    updated_at: req.user.updated_at
  };

  res.json({
    success: true,
    user: userData
  });
});

// =================================================================

// Usage Examples:

/*
1. Using Sessions:
   - Login: POST /api/auth/login
   - Get user: GET /api/auth/me
   - Update profile: PUT /api/auth/profile
   - Logout: POST /api/auth/logout

2. Using JWT:
   - Login: POST /api/auth/login-jwt
   - Get user: GET /api/auth/me-jwt (with Authorization: Bearer <token> header)
   
3. Frontend Examples:

   // Session-based (cookies handled automatically)
   const loginResponse = await fetch('/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ username: 'user', password: 'pass' }),
     credentials: 'include' // Important for sessions
   });

   const userResponse = await fetch('/api/auth/me', {
     credentials: 'include'
   });

   // JWT-based
   const loginResponse = await fetch('/api/auth/login-jwt', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ username: 'user', password: 'pass' })
   });
   
   const { token } = await loginResponse.json();
   localStorage.setItem('token', token);

   const userResponse = await fetch('/api/auth/me-jwt', {
     headers: { 'Authorization': `Bearer ${token}` }
   });
*/
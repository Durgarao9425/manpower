const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
require('dotenv').config();

const router = express.Router();

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Prepare user data
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

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token, // send the JWT token
      user: userData
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

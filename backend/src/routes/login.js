// Add this login route to your existing router

const express = require('express');
const bcrypt = require('bcryptjs');

module.exports = (db) => {
  const router = express.Router();

// Login user
router.post('/', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Username and password are required' 
    });
  }
  
  try {
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        console.log('Login attempt failed: User not found -', username);
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      const user = results[0];
      console.log('Login attempt for user:', {
        id: user.id,
        username: user.username,
        email: user.email,
        user_type: user.user_type,
        full_name: user.full_name,
        status: user.status
      });
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        console.log('Login attempt failed: Invalid password for user -', username);
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      console.log('Login successful for user:', {
        id: user.id,
        username: user.username,
        email: user.email,
        user_type: user.user_type,
        full_name: user.full_name,
        status: user.status
      });
      
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
      
      res.json({
        success: true,
        message: 'Login successful',
        user: userData
      });
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
return router;
}
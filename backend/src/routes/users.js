const express = require('express');
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  const {
    company_id, username, password, email, user_type, full_name, phone, address, profile_image, status
  } = req.body;
  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : '';
    const sql = `INSERT INTO users (company_id, username, password, email, user_type, full_name, phone, address, profile_image, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const result = await db.query(sql, [company_id || null, username, hashedPassword, email, user_type, full_name, phone, address, profile_image, status]);
    res.json({ id: result.insertId, ...req.body, password: undefined });
  } catch (err) {
    res.status(500).json({ error: 'Error hashing password' });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    company_id, username, password, email, user_type, full_name, phone, address, profile_image, status
  } = req.body;
  let sql, params;
  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      sql = `UPDATE users SET company_id=?, username=?, password=?, email=?, user_type=?, full_name=?, phone=?, address=?, profile_image=?, status=?, updated_at=NOW() WHERE id=?`;
      params = [company_id || null, username, hashedPassword, email, user_type, full_name, phone, address, profile_image, status, id];
    } else {
      sql = `UPDATE users SET company_id=?, username=?, email=?, user_type=?, full_name=?, phone=?, address=?, profile_image=?, status=?, updated_at=NOW() WHERE id=?`;
      params = [company_id || null, username, email, user_type, full_name, phone, address, profile_image, status, id];
    }
    const result = await db.query(sql, params);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

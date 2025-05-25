const express = require('express');
const bcrypt = require('bcryptjs');

module.exports = (db) => {
  const router = express.Router();

  // Get all users
  router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });

  // Create a new user
  router.post('/', async (req, res) => {
    const {
      company_id, username, password, email, user_type, full_name, phone, address, profile_image, status
    } = req.body;
    try {
      const hashedPassword = password ? await bcrypt.hash(password, 10) : '';
      const sql = `INSERT INTO users (company_id, username, password, email, user_type, full_name, phone, address, profile_image, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
      db.query(sql, [company_id || null, username, hashedPassword, email, user_type, full_name, phone, address, profile_image, status], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body, password: undefined });
      });
    } catch (err) {
      res.status(500).json({ error: 'Error hashing password' });
    }
  });

  // Delete a user
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true });
    });
  });

  // Update a user
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const {
      company_id, username, password, email, user_type, full_name, phone, address, profile_image, status
    } = req.body;
    let sql, params;
    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      sql = `UPDATE users SET company_id=?, username=?, password=?, email=?, user_type=?, full_name=?, phone=?, address=?, profile_image=?, status=?, updated_at=NOW() WHERE id=?`;
      params = [company_id || null, username, hashedPassword, email, user_type, full_name, phone, address, profile_image, status, id];
    } else {
      sql = `UPDATE users SET company_id=?, username=?, email=?, user_type=?, full_name=?, phone=?, address=?, profile_image=?, status=?, updated_at=NOW() WHERE id=?`;
      params = [company_id || null, username, email, user_type, full_name, phone, address, profile_image, status, id];
    }
    db.query(sql, params, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true });
    });
  });

  return router;
};

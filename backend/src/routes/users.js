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

// Get single user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Create a new user
router.post('/', async (req, res) => {
  const {
    company_id, username, password, email, user_type, full_name, phone, address, profile_image, status,
    // Rider fields
    rider_id, rider_code, created_by,
    // Company fields
    company_name, company_email, company_phone, logo
  } = req.body;
  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : '';
    const sql = `INSERT INTO users (company_id, username, password, email, user_type, full_name, phone, address, profile_image, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const [result] = await db.query(sql, [company_id || null, username, hashedPassword, email, user_type, full_name, phone, address, profile_image, status]);
    const user_id = result.insertId;
    let extra = {};
    // Only insert into riders table if NOT already handled by frontend
    // (e.g., if this endpoint is used for admin bulk creation, not Riderform)
    // Remove or comment out the following block to prevent duplicate insert:
    // if (user_type === 'rider') {
    //   // Insert only minimal fields into riders
    //   const riderSql = `INSERT INTO riders (rider_id, user_id, rider_code, created_by, status) VALUES (?, ?, ?, ?, ?)`;
    //   try {
    //     const [riderResult] = await db.query(riderSql, [
    //       rider_id || full_name, user_id, rider_code || username, created_by, status || 'Active'
    //     ]);
    //     extra.rider_id = riderResult.insertId;
    //   } catch (riderErr) {
    //     console.error('Rider insert error:', riderErr);
    //     return res.status(500).json({ error: 'Rider insert error', details: riderErr.message });
    //   }
    // }
    if (user_type === 'company') {
      // Insert only minimal fields into companies
      const companySql = `INSERT INTO companies (user_id, company_name, company_email, company_phone, logo, created_by) VALUES (?, ?, ?, ?, ?, ?)`;
      try {
        const [companyResult] = await db.query(companySql, [
          user_id, company_name || full_name, company_email || email, company_phone || phone, logo, created_by
        ]);
        extra.company_id = companyResult.insertId;
      } catch (companyErr) {
        console.error('Company insert error:', companyErr);
        return res.status(500).json({ error: 'Company insert error', details: companyErr.message });
      }
    }
    res.json({ id: user_id, ...req.body, ...extra, password: undefined });
  } catch (err) {
    console.error('User insert error:', err);
    res.status(500).json({ error: 'User insert error', details: err.message });
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

// Get attendance records for a rider (optionally by month/year)
router.get('/attendance', async (req, res) => {
  const { rider_id, month, year } = req.query;
  if (!rider_id) return res.status(400).json({ error: 'Missing rider_id' });
  let sql = `SELECT * FROM rider_attendance WHERE rider_id = ?`;
  const params = [rider_id];
  if (month && year) {
    sql += ' AND MONTH(attendance_date) = ? AND YEAR(attendance_date) = ?';
    params.push(month, year);
  } else if (year) {
    sql += ' AND YEAR(attendance_date) = ?';
    params.push(year);
  }
  sql += ' ORDER BY attendance_date DESC';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

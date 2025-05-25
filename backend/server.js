require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Get all users
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create a new user
app.post('/api/users', async (req, res) => {
  const {
    company_id,
    username,
    password,
    email,
    user_type,
    full_name,
    phone,
    address,
    profile_image,
    status
  } = req.body;

  try {
    // Hash the password before saving
    const hashedPassword = password ? await bcrypt.hash(password, 10) : '';
    const sql = `INSERT INTO users (company_id, username, password, email, user_type, full_name, phone, address, profile_image, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    db.query(
      sql,
      [company_id || null, username, hashedPassword, email, user_type, full_name, phone, address, profile_image, status],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body, password: undefined });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Error hashing password' });
  }
});

// Delete a user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  });
});

// Update a user
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const {
    company_id,
    username,
    password,
    email,
    user_type,
    full_name,
    phone,
    address,
    profile_image,
    status
  } = req.body;

  let sql, params;
  if (password) {
    // If password is provided, update it
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync(password, 10);
    sql = `UPDATE users SET company_id=?, username=?, password=?, email=?, user_type=?, full_name=?, phone=?, address=?, profile_image=?, status=?, updated_at=NOW() WHERE id=?`;
    params = [company_id || null, username, hashedPassword, email, user_type, full_name, phone, address, profile_image, status, id];
  } else {
    // If password is not provided, don't update it
    sql = `UPDATE users SET company_id=?, username=?, email=?, user_type=?, full_name=?, phone=?, address=?, profile_image=?, status=?, updated_at=NOW() WHERE id=?`;
    params = [company_id || null, username, email, user_type, full_name, phone, address, profile_image, status, id];
  }

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  });
});

// Get all companies
app.get('/api/companies', (req, res) => {
  db.query('SELECT id, user_id, company_name, company_email, company_phone, company_gst, company_address, industry, logo, created_by, payment_terms FROM companies', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create a new company
app.post('/api/companies', async (req, res) => {
  const {
    company_name,
    company_email,
    company_phone,
    company_gst,
    company_address,
    industry,
    logo,
    created_by,
    payment_terms
  } = req.body;

  // 1. Create a user of type 'company' in users table
  const username = company_email || company_name.replace(/\s+/g, '').toLowerCase();
  const password = await bcrypt.hash('defaultPassword123', 10); // You may want to generate/send a real password
  const user_type = 'company';
  const full_name = company_name;
  const status = 'active';

  const userSql = `INSERT INTO users (username, password, email, user_type, full_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
  db.query(userSql, [username, password, company_email, user_type, full_name, status], function(err, userResult) {
    if (err) {
      console.error('User creation failed:', err);
      return res.status(500).json({ error: 'User creation failed', details: err });
    }
    const user_id = userResult.insertId;
    // 2. Create the company with the new user_id
    const companySql = `INSERT INTO companies (user_id, company_name, company_email, company_phone, company_gst, company_address, industry, logo, created_by, payment_terms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(companySql, [user_id, company_name, company_email, company_phone, company_gst, company_address, industry, logo, created_by, payment_terms], function(err, companyResult) {
      if (err) {
        console.error('Company creation failed:', err);
        return res.status(500).json({ error: 'Company creation failed', details: err });
      }
      res.json({ id: companyResult.insertId, user_id, ...req.body });
    });
  });
});

// Update a company
app.put('/api/companies/:id', (req, res) => {
  const { id } = req.params;
  const {
    user_id,
    company_name,
    company_email,
    company_phone,
    company_gst,
    company_address,
    industry,
    logo,
    created_by,
    payment_terms
  } = req.body;
  const sql = `UPDATE companies SET user_id=?, company_name=?, company_email=?, company_phone=?, company_gst=?, company_address=?, industry=?, logo=?, created_by=?, payment_terms=? WHERE id=?`;
  db.query(sql, [user_id, company_name, company_email, company_phone, company_gst, company_address, industry, logo, created_by, payment_terms, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Company not found' });
    res.json({ success: true });
  });
});

// Delete a company
app.delete('/api/companies/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM companies WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Company not found' });
    res.json({ success: true });
  });
});

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

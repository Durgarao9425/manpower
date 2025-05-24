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

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

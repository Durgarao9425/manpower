const express = require('express');
const bcrypt = require('bcryptjs');

module.exports = (db) => {
  const router = express.Router();

  // Get all companies
  router.get('/', (req, res) => {
    db.query('SELECT id, user_id, company_name, company_email, company_phone, company_gst, company_address, industry, logo, created_by, payment_terms FROM companies', (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });

  // Create a new company (and user)
  router.post('/', async (req, res) => {
    const {
      company_name, company_email, company_phone, company_gst, company_address, industry, logo, created_by, payment_terms
    } = req.body;
    const username = company_email || company_name.replace(/\s+/g, '').toLowerCase();
    const password = await bcrypt.hash('defaultPassword123', 10);
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
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const {
      user_id, company_name, company_email, company_phone, company_gst, company_address, industry, logo, created_by, payment_terms
    } = req.body;
    const sql = `UPDATE companies SET user_id=?, company_name=?, company_email=?, company_phone=?, company_gst=?, company_address=?, industry=?, logo=?, created_by=?, payment_terms=? WHERE id=?`;
    db.query(sql, [user_id, company_name, company_email, company_phone, company_gst, company_address, industry, logo, created_by, payment_terms, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Company not found' });
      res.json({ success: true });
    });
  });

  // Delete a company
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM companies WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Company not found' });
      res.json({ success: true });
    });
  });

  return router;
};

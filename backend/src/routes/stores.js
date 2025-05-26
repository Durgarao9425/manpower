const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Get all stores (optionally filter by company_id)
router.get('/', async (req, res) => {
  try {
    const { company_id } = req.query;
    let sql = 'SELECT id, company_id, store_name, location, address, contact_person, contact_phone, status, created_at, updated_at FROM company_stores';
    let params = [];
    if (company_id) {
      sql += ' WHERE company_id = ?';
      params.push(company_id);
    }
    const [results] = await db.query(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new store under a company
router.post('/', async (req, res) => {
  try {
    const { company_id, store_name, location, address, contact_person, contact_phone, status } = req.body;
    const sql = `INSERT INTO company_stores (company_id, store_name, location, address, contact_person, contact_phone, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const [result] = await db.query(sql, [company_id, store_name, location, address, contact_person, contact_phone, status || 'active']);
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a store
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id, store_name, location, address, contact_person, contact_phone, status } = req.body;
    const sql = `UPDATE company_stores SET company_id=?, store_name=?, location=?, address=?, contact_person=?, contact_phone=?, status=?, updated_at=NOW() WHERE id=?`;
    const [result] = await db.query(sql, [company_id, store_name, location, address, contact_person, contact_phone, status, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Store not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a store
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM company_stores WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Store not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

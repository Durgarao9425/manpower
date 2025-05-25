const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Get all stores (optionally filter by company_id)
  router.get('/', (req, res) => {
    const { company_id } = req.query;
    let sql = 'SELECT id, company_id, store_name, location, address, contact_person, contact_phone, status, created_at, updated_at FROM company_stores';
    let params = [];
    if (company_id) {
      sql += ' WHERE company_id = ?';
      params.push(company_id);
    }
    db.query(sql, params, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });

  // Create a new store under a company
  router.post('/', (req, res) => {
    const { company_id, store_name, location, address, contact_person, contact_phone, status } = req.body;
    const sql = `INSERT INTO company_stores (company_id, store_name, location, address, contact_person, contact_phone, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    db.query(sql, [company_id, store_name, location, address, contact_person, contact_phone, status || 'active'], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, ...req.body });
    });
  });

  // Update a store
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { company_id, store_name, location, address, contact_person, contact_phone, status } = req.body;
    const sql = `UPDATE company_stores SET company_id=?, store_name=?, location=?, address=?, contact_person=?, contact_phone=?, status=?, updated_at=NOW() WHERE id=?`;
    db.query(sql, [company_id, store_name, location, address, contact_person, contact_phone, status, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Store not found' });
      res.json({ success: true });
    });
  });

  // Delete a store
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM company_stores WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Store not found' });
      res.json({ success: true });
    });
  });

  return router;
};

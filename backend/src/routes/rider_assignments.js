const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Debug log to confirm route is loaded
console.log('rider_assignments route loaded');

// Assign a rider to a company and store
router.post('/', async (req, res) => {
  const { rider_id, company_id, store_id, company_rider_id } = req.body;
  if (!rider_id || !company_id || !store_id || !company_rider_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const assigned_by = 1;
  try {
    // Check if assignment exists for this rider_id
    const [existing] = await db.query('SELECT id FROM rider_assignments WHERE rider_id = ?', [rider_id]);
    if (existing.length > 0) {
      // Update the existing assignment
      const sql = `UPDATE rider_assignments SET company_id=?, store_id=?, company_rider_id=?, assigned_by=?, assigned_date=CURDATE(), start_date=CURDATE(), status='active' WHERE rider_id=?`;
      await db.query(sql, [company_id, store_id, company_rider_id, assigned_by, rider_id]);
      return res.json({ message: 'Assignment updated', rider_id, company_id, store_id, company_rider_id, assigned_by, assigned_date: new Date().toISOString().slice(0,10), start_date: new Date().toISOString().slice(0,10), status: 'active' });
    } else {
      // Insert new assignment
      const sql = `INSERT INTO rider_assignments (rider_id, company_id, store_id, company_rider_id, assigned_by, assigned_date, start_date, status) VALUES (?, ?, ?, ?, ?, CURDATE(), CURDATE(), 'active')`;
      const [result] = await db.query(sql, [rider_id, company_id, store_id, company_rider_id, assigned_by]);
      return res.json({ id: result.insertId, rider_id, company_id, store_id, company_rider_id, assigned_by, assigned_date: new Date().toISOString().slice(0,10), start_date: new Date().toISOString().slice(0,10), status: 'active' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Optionally: get all assignments
router.get('/', async (req, res) => {
  const sql = 'SELECT id, rider_id, company_id, store_id, company_rider_id, assigned_by, assigned_date, start_date, notes, status FROM rider_assignments';
  try {
    const results = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assignment by rider id
router.get('/by-rider/:riderId', async (req, res) => {
  const { riderId } = req.params;
  // Only return the latest assignment where both company_id and store_id are NOT NULL
  const sql = `SELECT * FROM rider_assignments WHERE rider_id = ? AND company_id IS NOT NULL AND store_id IS NOT NULL ORDER BY assigned_date DESC, id DESC LIMIT 1`;
  try {
    const results = await db.query(sql, [riderId]);
    if (results.length === 0) return res.status(404).json({ error: 'No valid assignment found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Helper to set new token in response header for sliding expiration
function setSlidingToken(req, res) {
    if (req.user) {
        const jwt = require('jsonwebtoken');
        const sanitizedUser = { ...req.user };
        delete sanitizedUser.exp; // Remove 'exp' property if it exists
        const token = jwt.sign(sanitizedUser, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '5m' });
        res.set('x-new-token', token);
    }
}

// Add sliding token to all GET/POST/PUT/DELETE responses
router.use((req, res, next) => {
    // Save original res.json
    const originalJson = res.json;
    res.json = function (body) {
        setSlidingToken(req, res);
        return originalJson.call(this, body);
    };
    next();
});

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, user_id, company_name, business_license, tax_id, description, commission_rate FROM suppliers');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get a single supplier by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT id, user_id, company_name, business_license, tax_id, description, commission_rate FROM suppliers WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching supplier:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new supplier
router.post('/', async (req, res) => {
  const {
    user_id, company_name, business_license, tax_id, description, commission_rate
  } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO suppliers (user_id, company_name, business_license, tax_id, description, commission_rate) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, company_name, business_license, tax_id, description, commission_rate]
    );
    
    res.status(201).json({
      id: result.insertId,
      ...req.body
    });
  } catch (err) {
    console.error('Error creating supplier:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a supplier
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    user_id, company_name, business_license, tax_id, description, commission_rate
  } = req.body;
  
  try {
    const [result] = await db.query(
      `UPDATE suppliers SET 
        user_id = ?, 
        company_name = ?, 
        business_license = ?, 
        tax_id = ?, 
        description = ?, 
        commission_rate = ?
      WHERE id = ?`,
      [user_id, company_name, business_license, tax_id, description, commission_rate, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating supplier:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a supplier
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.query('DELETE FROM suppliers WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting supplier:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
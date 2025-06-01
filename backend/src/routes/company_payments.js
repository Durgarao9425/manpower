const express = require('express');
const router = express.Router();
const db = require('../config/database');

const getWeekNumber = (date) => {
  const day = date.getDate();
  if (day >= 1 && day <= 7) return 1;
  if (day >= 8 && day <= 14) return 2;
  if (day >= 15 && day <= 22) return 3;
  return 4;
};

// Add validation for required fields
const validateRequestBody = (body) => {
  const requiredFields = [
    'company_id', 'year', 'total_amount', 'commission_amount', 'net_amount', 'status',
    'file_path', 'mapping_status', 'published_at', 'published_by',
    'payment_date','remarks','amount'
  ];

  for (const field of requiredFields) {
    if (!body[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
};

// POST API to insert data into company_payments table
router.post('/company_payments', async (req, res) => {
  try {
    const validationError = validateRequestBody(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const {
      company_id,
      year,
      total_amount,
      commission_amount,
      net_amount,
      status,
      file_path,
      mapping_status,
      published_at,
      published_by,
      payment_date,
      amount,
      remarks,
    } = req.body;

    const week_number = getWeekNumber(new Date(payment_date));

    const query = `INSERT INTO company_payments (
      company_id, week_number, year, total_amount, commission_amount, net_amount, status, file_path, mapping_status, published_at, published_by, payment_date, amount,remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      company_id,
      week_number,
      year,
      total_amount,
      commission_amount,
      net_amount,
      status,
      file_path,
      mapping_status,
      published_at,
      published_by,
      payment_date,
      amount,
      remarks
    ];

    const [result] = await db.execute(query, values);

    res.status(201).json({
      message: 'Payment record created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error inserting payment record:', error);
    res.status(500).json({ error: 'Failed to create payment record', details: error.message });
  }
});

// GET API to fetch payment records
router.get('/company_payments', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM company_payments');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching payment records:', error);
    res.status(500).json({ error: 'Failed to fetch payment records' });
  }
});

// PUT API to update payment records
router.put('/company_payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_id,
      week_number,
      year,
      total_amount,
      commission_amount,
      net_amount,
      status,
      file_path,
      mapping_status,
      published_at,
      published_by,
      payment_date,
      amount,
      remarks,
    } = req.body;

    const query = `UPDATE company_payments SET 
      company_id = ?,
      week_number = ?,
      year = ?,
      total_amount = ?,
      commission_amount = ?,
      net_amount = ?,
      status = ?,
      file_path = ?,
      mapping_status = ?,
      published_at = ?,
      published_by = ?,
      payment_date = ?,
      amount = ?,
      remarks = ?
    WHERE id = ?`;

    const values = [
      company_id,
      week_number,
      year,
      total_amount,
      commission_amount,
      net_amount,
      status,
      file_path,
      notes,
      mapping_status,
      published_at,
      published_by,
      payment_date,
      start_date,
      end_date,
      amount,
      payment_reference,
      remarks,
      id
    ];

    const [result] = await db.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    res.json({ message: 'Payment record updated successfully' });
  } catch (error) {
    console.error('Error updating payment record:', error);
    res.status(500).json({ error: 'Failed to update payment record' });
  }
});

module.exports = router;

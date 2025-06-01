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

// POST API to insert data into company_payments table
router.post('/company_payments', async (req, res) => {
  try {
    const {
      company_id,
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
    } = req.body;

    const week_number = getWeekNumber(new Date(payment_date));

    const query = `INSERT INTO company_payments (
      company_id, week_number, year, total_amount, commission_amount, net_amount, status, file_path, notes, mapping_status, published_at, published_by, payment_date, start_date, end_date, amount, payment_reference, remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
      remarks
    ];

    const [result] = await db.execute(query, values);

    res.status(201).json({
      message: 'Payment record created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error inserting payment record:', error);
    res.status(500).json({ error: 'Failed to create payment record' });
  }
});

module.exports = router;

const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Get all riders
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number FROM riders');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new rider
router.post('/', async (req, res) => {
  const {
    rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number
  } = req.body;
  const sql = `INSERT INTO riders (rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  try {
    const [result] = await db.query(sql, [rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number]);
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a rider
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number
  } = req.body;
  const sql = `UPDATE riders SET rider_id=?, user_id=?, rider_code=?, id_proof=?, emergency_contact=?, date_of_birth=?, blood_group=?, joining_date=?, bank_name=?, account_number=?, ifsc_code=?, account_holder_name=?, upi_id=?, id_card_path=?, performance_tier=?, last_certificate_date=?, created_by=?, id_card_number=?, id_card_issue_date=?, id_card_expiry_date=?, documents=?, status=?, vehicle_type=?, vehicle_number=? WHERE id=?`;
  try {
    const [result] = await db.query(sql, [rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Rider not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a rider
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM riders WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Rider not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

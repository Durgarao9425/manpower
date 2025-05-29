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


const getRiderByUserId = (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT 
      u.id as user_id, u.company_id, u.username, u.email, u.full_name, u.phone, u.address, u.profile_image, u.status as user_status,
      r.id as rider_id, r.rider_code, r.id_proof, r.emergency_contact, r.date_of_birth, r.blood_group, r.joining_date,
      r.bank_name, r.account_number, r.ifsc_code, r.account_holder_name, r.upi_id, r.id_card_path,
      r.performance_tier, r.last_certificate_date, r.created_by, r.id_card_number, r.id_card_issue_date, r.id_card_expiry_date,
      r.documents, r.status as rider_status, r.vehicle_type, r.vehicle_number
    FROM users u
    INNER JOIN riders r ON u.id = r.user_id
    WHERE u.id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    res.json(results[0]);
  });
};




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
module.exports = { getRiderByUserId };

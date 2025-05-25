const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Get all riders
  router.get('/', (req, res) => {
    db.query('SELECT id, rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number FROM riders', (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });

  // Create a new rider
  router.post('/', (req, res) => {
    const {
      rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number
    } = req.body;
    const sql = `INSERT INTO riders (rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, ...req.body });
    });
  });

  // Update a rider
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const {
      rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number
    } = req.body;
    const sql = `UPDATE riders SET rider_id=?, user_id=?, rider_code=?, id_proof=?, emergency_contact=?, date_of_birth=?, blood_group=?, joining_date=?, bank_name=?, account_number=?, ifsc_code=?, account_holder_name=?, upi_id=?, id_card_path=?, performance_tier=?, last_certificate_date=?, created_by=?, id_card_number=?, id_card_issue_date=?, id_card_expiry_date=?, documents=?, status=?, vehicle_type=?, vehicle_number=? WHERE id=?`;
    db.query(sql, [rider_id, user_id, rider_code, id_proof, emergency_contact, date_of_birth, blood_group, joining_date, bank_name, account_number, ifsc_code, account_holder_name, upi_id, id_card_path, performance_tier, last_certificate_date, created_by, id_card_number, id_card_issue_date, id_card_expiry_date, documents, status, vehicle_type, vehicle_number, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Rider not found' });
      res.json({ success: true });
    });
  });

  // Delete a rider
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM riders WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Rider not found' });
      res.json({ success: true });
    });
  });

  return router;
};

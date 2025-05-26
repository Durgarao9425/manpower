const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

const router = express.Router();

// Set up multer storage for rider documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/rider_documents'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    cb(null, 'riderdoc_' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/rider_documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Get all documents for a rider
router.get('/:rider_id', async (req, res) => {
  const { rider_id } = req.params;
  try {
    const [results] = await db.query(
      'SELECT id, rider_id, document_type, document_number, document_file, expiry_date, verification_status, remarks, created_at, updated_at, verified_by, verification_date FROM rider_documents WHERE rider_id = ?',
      [rider_id]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all documents (no filter)
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT id, rider_id, document_type, document_number, document_file, expiry_date, verification_status, remarks, created_at, updated_at, verified_by, verification_date FROM rider_documents'
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new document for a rider (with file upload support)
router.post('/', upload.single('document_file'), async (req, res) => {
  const { rider_id, document_type, document_number, expiry_date, verification_status, remarks, verified_by, verification_date } = req.body;
  let document_file = req.body.document_file || '';
  console.log('REQ BODY:', req.body);
  console.log('REQ FILE:', req.file);
  if (req.file) {
    document_file = 'uploads/rider_documents/' + req.file.filename;
  }
  const sql = `INSERT INTO rider_documents (rider_id, document_type, document_number, document_file, expiry_date, verification_status, remarks, created_at, updated_at, verified_by, verification_date) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)`;
  try {
    const [result] = await db.query(
      sql,
      [rider_id, document_type, document_number, document_file, expiry_date, verification_status || 'pending', remarks, verified_by, verification_date]
    );
    res.json({ id: result.insertId, ...req.body, document_file });
  } catch (err) {
    console.error('SQL ERROR:', err);
    res.status(500).json({ error: err.message, sql: err.sqlMessage, req_body: req.body, req_file: req.file });
  }
});

// Update a document
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { document_type, document_number, document_file, expiry_date, verification_status, remarks, verified_by, verification_date } = req.body;
  const sql = `UPDATE rider_documents SET document_type=?, document_number=?, document_file=?, expiry_date=?, verification_status=?, remarks=?, updated_at=NOW(), verified_by=?, verification_date=? WHERE id=?`;
  try {
    const [result] = await db.query(
      sql,
      [document_type, document_number, document_file, expiry_date, verification_status, remarks, verified_by, verification_date, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Document not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a document
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM rider_documents WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Document not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

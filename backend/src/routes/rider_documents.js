const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

module.exports = (db) => {
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
  router.get('/:rider_id', (req, res) => {
    const { rider_id } = req.params;
    db.query(
      'SELECT id, rider_id, document_type, document_number, document_file, expiry_date, verification_status, remarks, created_at, updated_at, verified_by, verification_date FROM rider_documents WHERE rider_id = ?',
      [rider_id],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
      }
    );
  });

  // Get all documents (no filter)
  router.get('/', (req, res) => {
    db.query(
      'SELECT id, rider_id, document_type, document_number, document_file, expiry_date, verification_status, remarks, created_at, updated_at, verified_by, verification_date FROM rider_documents',
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
      }
    );
  });

  // Add a new document for a rider (with file upload support)
  router.post('/', upload.single('document_file'), (req, res) => {
    const { rider_id, document_type, document_number, expiry_date, verification_status, remarks, verified_by, verification_date } = req.body;
    let document_file = req.body.document_file || '';
    console.log('REQ BODY:', req.body);
    console.log('REQ FILE:', req.file);
    if (req.file) {
      document_file = 'uploads/rider_documents/' + req.file.filename;
    }
    const sql = `INSERT INTO rider_documents (rider_id, document_type, document_number, document_file, expiry_date, verification_status, remarks, created_at, updated_at, verified_by, verification_date) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)`;
    db.query(
      sql,
      [rider_id, document_type, document_number, document_file, expiry_date, verification_status || 'pending', remarks, verified_by, verification_date],
      (err, result) => {
        if (err) {
          console.error('SQL ERROR:', err);
          res.status(500).json({ error: err.message, sql: err.sqlMessage, req_body: req.body, req_file: req.file });
          return;
        }
        res.json({ id: result.insertId, ...req.body, document_file });
      }
    );
  });

  // Update a document
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { document_type, document_number, document_file, expiry_date, verification_status, remarks, verified_by, verification_date } = req.body;
    const sql = `UPDATE rider_documents SET document_type=?, document_number=?, document_file=?, expiry_date=?, verification_status=?, remarks=?, updated_at=NOW(), verified_by=?, verification_date=? WHERE id=?`;
    db.query(
      sql,
      [document_type, document_number, document_file, expiry_date, verification_status, remarks, verified_by, verification_date, id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Document not found' });
        res.json({ success: true });
      }
    );
  });

  // Delete a document
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM rider_documents WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Document not found' });
      res.json({ success: true });
    });
  });

  return router;
};

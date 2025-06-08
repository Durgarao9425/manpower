const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

// Validation schemas
const importHistorySchema = {
    body: {
        type: 'object',
        required: ['table_name', 'filename', 'status', 'total_records'],
        properties: {
            table_name: { type: 'string' },
            filename: { type: 'string' },
            status: { type: 'string', enum: ['completed', 'completed_with_errors', 'failed'] },
            total_records: { type: 'number' },
            success_count: { type: 'number' },
            failed_count: { type: 'number' },
            skipped_count: { type: 'number' },
            error_details: { type: 'array' }
        }
    }
};

// Get all import history records
router.get('/', async (req, res) => {
    console.log('GET /import-history - Received request');
    try {
        console.log('Attempting database query...');
        const [rows] = await db.query('SELECT * FROM import_history ORDER BY created_at DESC');
        console.log('Query successful, found rows:', rows.length);
        
        // Return data in a consistent format
        res.json({
            success: true,
            data: rows,
            message: rows.length === 0 ? 'No import history records found' : `Found ${rows.length} import history records`
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

// Get import history by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM import_history WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Import history record not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new import history record
router.post('/', async (req, res) => {
    const {
        table_name,
        filename,
        status,
        total_records,
        success_count,
        failed_count,
        skipped_count,
        error_details
    } = req.body;

    try {
        const [result] = await db.query(
            `INSERT INTO import_history (
                table_name,
                filename,
                status,
                total_records,
                success_count,
                failed_count,
                skipped_count,
                error_details
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                table_name,
                filename,
                status,
                total_records,
                success_count || 0,
                failed_count || 0,
                skipped_count || 0,
                error_details ? JSON.stringify(error_details) : null
            ]
        );

        const [newRecord] = await db.query('SELECT * FROM import_history WHERE id = ?', [result.insertId]);
        res.json(newRecord[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get import history by table name
router.get('/table/:tableName', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM import_history WHERE table_name = ? ORDER BY created_at DESC',
            [req.params.tableName]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get import history statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) as total_imports,
                SUM(total_records) as total_records_processed,
                SUM(success_count) as total_success,
                SUM(failed_count) as total_failed,
                SUM(skipped_count) as total_skipped,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_imports,
                COUNT(CASE WHEN status = 'completed_with_errors' THEN 1 END) as imports_with_errors,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_imports
            FROM import_history
        `);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 
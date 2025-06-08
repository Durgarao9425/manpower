const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET all import history records
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [records] = await db.query(`
            SELECT * FROM import_history 
            ORDER BY created_at DESC
        `);
        res.json(records);
    } catch (error) {
        console.error('Error fetching import history:', error);
        res.status(500).json({ 
            error: 'Failed to fetch import history',
            details: error.message 
        });
    }
});

// GET import history by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [records] = await db.query(`
            SELECT * FROM import_history 
            WHERE id = ?
        `, [req.params.id]);

        if (records.length === 0) {
            return res.status(404).json({ error: 'Import history record not found' });
        }

        res.json(records[0]);
    } catch (error) {
        console.error('Error fetching import history record:', error);
        res.status(500).json({ 
            error: 'Failed to fetch import history record',
            details: error.message 
        });
    }
});

// POST new import history record
router.post('/', authenticateToken, async (req, res) => {
    try {
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

        // Validate required fields
        if (!table_name || !filename || !status || !total_records) {
            return res.status(400).json({ 
                error: 'Missing required fields' 
            });
        }

        // Insert new record
        const [result] = await db.query(`
            INSERT INTO import_history (
                table_name,
                filename,
                status,
                total_records,
                success_count,
                failed_count,
                skipped_count,
                error_details
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            table_name,
            filename,
            status,
            total_records,
            success_count || 0,
            failed_count || 0,
            skipped_count || 0,
            error_details ? JSON.stringify(error_details) : null
        ]);

        // Fetch the created record
        const [records] = await db.query(`
            SELECT * FROM import_history 
            WHERE id = ?
        `, [result.insertId]);

        res.status(201).json(records[0]);
    } catch (error) {
        console.error('Error creating import history record:', error);
        res.status(500).json({ 
            error: 'Failed to create import history record',
            details: error.message 
        });
    }
});

// GET import history by table name
router.get('/table/:tableName', authenticateToken, async (req, res) => {
    try {
        const [records] = await db.query(`
            SELECT * FROM import_history 
            WHERE table_name = ?
            ORDER BY created_at DESC
        `, [req.params.tableName]);

        res.json(records);
    } catch (error) {
        console.error('Error fetching import history by table:', error);
        res.status(500).json({ 
            error: 'Failed to fetch import history by table',
            details: error.message 
        });
    }
});

// GET import history statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
    try {
        const [stats] = await db.query(`
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

        res.json(stats[0]);
    } catch (error) {
        console.error('Error fetching import statistics:', error);
        res.status(500).json({ 
            error: 'Failed to fetch import statistics',
            details: error.message 
        });
    }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Middleware to get rider_id from session (placeholder, replace with real auth)
function getRiderId(req) {
    // Example: return req.session.rider_id;
    // For now, get from body for testing
    return req.body.rider_id;
}

// Helper: Get company_id and store_id from rider_assignments
async function getAssignment(rider_id) {
    const [rows] = await db.query(
        'SELECT company_id, store_id FROM rider_assignments WHERE rider_id = ? LIMIT 1',
        [rider_id]
    );
    return rows[0] || {};
}

// Punch In
router.post('/punch-in', async (req, res) => {
    try {
        const rider_id = getRiderId(req);
        if (!rider_id) return res.status(401).json({ error: 'Unauthorized' });
        const { company_id, store_id } = await getAssignment(rider_id);
        if (!company_id || !store_id) return res.status(400).json({ error: 'Assignment not found' });
        const today = new Date().toISOString().slice(0, 10);
        // Prevent duplicate check-in
        const [existing] = await db.query(
            'SELECT id FROM rider_attendance WHERE rider_id = ? AND attendance_date = ? AND status = ? LIMIT 1',
            [rider_id, today, 'present']
        );
        if (existing.length > 0) return res.status(409).json({ error: 'Already punched in today' });
        const now = new Date();
        const marked_by = req.body.marked_by || 'Rider';
        await db.query(
            `INSERT INTO rider_attendance (rider_id, company_id, store_id, attendance_date, status, marked_by, remarks, created_at, updated_at, check_in_time)
             VALUES (?, ?, ?, ?, 'present', ?, NULL, ?, ?, ?)` ,
            [rider_id, company_id, store_id, today, marked_by, now, now, now]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Punch Out
router.post('/punch-out', async (req, res) => {
    try {
        const rider_id = getRiderId(req);
        if (!rider_id) return res.status(401).json({ error: 'Unauthorized' });
        const today = new Date().toISOString().slice(0, 10);
        // Find today's present record
        const [rows] = await db.query(
            'SELECT id FROM rider_attendance WHERE rider_id = ? AND attendance_date = ? AND status = ? LIMIT 1',
            [rider_id, today, 'present']
        );
        if (rows.length === 0) return res.status(404).json({ error: 'No punch-in record for today' });
        const now = new Date();
        await db.query(
            'UPDATE rider_attendance SET check_out_time = ?, updated_at = ? WHERE id = ?',
            [now, now, rows[0].id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark Absent
router.post('/absent', async (req, res) => {
    try {
        const rider_id = getRiderId(req);
        if (!rider_id) return res.status(401).json({ error: 'Unauthorized' });
        const { company_id, store_id } = await getAssignment(rider_id);
        if (!company_id || !store_id) return res.status(400).json({ error: 'Assignment not found' });
        const today = new Date().toISOString().slice(0, 10);
        const reason = req.body.remarks || null;
        // Prevent duplicate absent
        const [existing] = await db.query(
            'SELECT id FROM rider_attendance WHERE rider_id = ? AND attendance_date = ? AND status = ? LIMIT 1',
            [rider_id, today, 'absent']
        );
        if (existing.length > 0) return res.status(409).json({ error: 'Already marked absent today' });
        const now = new Date();
        const marked_by = req.body.marked_by || 'Rider';
        await db.query(
            `INSERT INTO rider_attendance (rider_id, company_id, store_id, attendance_date, status, marked_by, remarks, created_at, updated_at)
             VALUES (?, ?, ?, ?, 'absent', ?, ?, ?, ?)` ,
            [rider_id, company_id, store_id, today, marked_by, reason, now, now]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

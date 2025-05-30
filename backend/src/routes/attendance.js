const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authService = require('../services/authService');

// Middleware to get rider_id from session (placeholder, replace with real auth)
function getRiderId(req) {
    // Example: return req.session.rider_id;
    // For now, get from body for testing
    return req.body.rider_id;
}

// Helper: Get company_id and store_id from rider_assignments
async function getAssignment(rider_id) {
    const [rows] = await db.query(
        'SELECT company_id, store_id FROM rider_assignments WHERE rider_id = ? AND status = "active" ORDER BY assigned_date DESC LIMIT 1',
        [rider_id]
    );
    console.log('getAssignment for rider_id', rider_id, 'result:', rows);
    return rows[0] || {};
}

// Middleware to validate token
function validateToken(req, res, next) {
    const token = req.headers['x-auth-token'];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = authService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid token.' });
    }
}

// Apply token validation middleware to all routes
router.use(validateToken);

// Punch In
router.post('/punch-in', async (req, res) => {
    try {
        const rider_id = getRiderId(req); // FIXED: get rider_id from request
        if (!rider_id) return res.status(401).json({ error: 'Unauthorized' });
        
        // Try to get assignment from database
        let { company_id, store_id } = await getAssignment(rider_id);
        
        // If assignment not found in database, use values from request
        if (!company_id) company_id = req.body.company_id;
        if (!store_id) store_id = req.body.store_id;
        
        // Final check if we have the required data
        if (!company_id || !store_id) {
            console.error(`Missing assignment data for rider ${rider_id}. company_id: ${company_id}, store_id: ${store_id}`);
            return res.status(400).json({ error: 'Assignment not found' });
        }
        
        const today = new Date().toISOString().slice(0, 10);
        // Prevent duplicate check-in
        const [existing] = await db.query(
            'SELECT id FROM rider_attendance WHERE rider_id = ? AND attendance_date = ? AND status = ? LIMIT 1',
            [rider_id, today, 'present']
        );
        if (existing.length > 0) return res.status(409).json({ error: 'Already punched in today' });
        
        const now = new Date();
        
        // Use a valid user ID for marked_by (admin user with ID 1)
        const marked_by = 1; // Using admin user ID
        
        // Insert attendance record
        await db.query(
            `INSERT INTO rider_attendance (rider_id, company_id, store_id, attendance_date, status, marked_by, remarks, created_at, updated_at, check_in_time)
             VALUES (?, ?, ?, ?, 'present', ?, NULL, ?, ?, ?)` ,
            [rider_id, company_id, store_id, today, marked_by, now, now, now]
        );
        
        // Generate token for response
        const token = authService.generateToken({ rider_id, company_id, store_id });
        
        // Return success with the data used
        res.json({ 
            success: true,
            rider_id,
            company_id,
            store_id,
            attendance_date: today,
            check_in_time: now,
            token
        });
    } catch (err) {
        console.error('Punch-in error:', err);
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
            'SELECT id, company_id, store_id FROM rider_attendance WHERE rider_id = ? AND attendance_date = ? AND status = ? LIMIT 1',
            [rider_id, today, 'present']
        );
        
        if (rows.length === 0) return res.status(404).json({ error: 'No punch-in record for today' });
        
        const now = new Date();
        
        // Update with check-out data
        await db.query(
            'UPDATE rider_attendance SET check_out_time = ?, check_out_latitude = ?, check_out_longitude = ?, check_out_accuracy = ?, updated_at = ? WHERE id = ?',
            [
                now, 
                req.body.check_out_latitude || null, 
                req.body.check_out_longitude || null, 
                req.body.check_out_accuracy || null, 
                now, 
                rows[0].id
            ]
        );
        
        // Generate token for response
        const token = authService.generateToken({ rider_id, company_id: rows[0].company_id, store_id: rows[0].store_id });
        
        // Return success with the data used
        res.json({ 
            success: true,
            rider_id,
            company_id: rows[0].company_id,
            store_id: rows[0].store_id,
            attendance_date: today,
            check_out_time: now,
            token
        });
    } catch (err) {
        console.error('Punch-out error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Mark Absent
router.post('/absent', async (req, res) => {
    try {
        const rider_id = getRiderId(req);
        if (!rider_id) return res.status(401).json({ error: 'Unauthorized' });
        
        // Try to get assignment from database
        let { company_id, store_id } = await getAssignment(rider_id);
        
        // If assignment not found in database, use values from request
        if (!company_id) company_id = req.body.company_id;
        if (!store_id) store_id = req.body.store_id;
        
        // Final check if we have the required data
        if (!company_id || !store_id) {
            console.error(`Missing assignment data for rider ${rider_id}. company_id: ${company_id}, store_id: ${store_id}`);
            return res.status(400).json({ error: 'Assignment not found' });
        }
        
        const today = new Date().toISOString().slice(0, 10);
        const reason = req.body.remarks || null;
        
        // Prevent duplicate absent
        const [existing] = await db.query(
            'SELECT id FROM rider_attendance WHERE rider_id = ? AND attendance_date = ? AND status = ? LIMIT 1',
            [rider_id, today, 'absent']
        );
        if (existing.length > 0) return res.status(409).json({ error: 'Already marked absent today' });
        
        const now = new Date();
        
        // Use a valid user ID for marked_by (admin user with ID 1)
        const marked_by = 1; // Using admin user ID
        
        await db.query(
            `INSERT INTO rider_attendance (rider_id, company_id, store_id, attendance_date, status, marked_by, remarks, created_at, updated_at)
             VALUES (?, ?, ?, ?, 'absent', ?, ?, ?, ?)` ,
            [rider_id, company_id, store_id, today, marked_by, reason, now, now]
        );
        
        // Generate token for response
        const token = authService.generateToken({ rider_id, company_id, store_id });
        
        // Return success with the data used
        res.json({ 
            success: true,
            rider_id,
            company_id,
            store_id,
            attendance_date: today,
            status: 'absent',
            token
        });
    } catch (err) {
        console.error('Mark absent error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get attendance records for a rider (optionally by month/year)
router.get('/', async (req, res) => {
  const { rider_id, month, year } = req.query;
  if (!rider_id) return res.status(400).json({ error: 'Missing rider_id' });
  let sql = `SELECT * FROM rider_attendance WHERE rider_id = ?`;
  const params = [rider_id];
  if (month && year) {
    sql += ' AND MONTH(attendance_date) = ? AND YEAR(attendance_date) = ?';
    params.push(month, year);
  } else if (year) {
    sql += ' AND YEAR(attendance_date) = ?';
    params.push(year);
  }
  sql += ' ORDER BY attendance_date DESC';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all attendance records (for admin/overview)
router.get('/all', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        ra.*, 
        u.full_name AS rider_name
      FROM rider_attendance ra
      JOIN riders r ON ra.rider_id = r.id
      JOIN users u ON r.user_id = u.id
      ORDER BY ra.attendance_date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

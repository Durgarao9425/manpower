const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /field_mappings/get_by_company_and_headers
router.post('/get_by_company_and_headers', async (req, res) => {
    try {
        const { company_id, company_field_names } = req.body;
        if (!company_id || !Array.isArray(company_field_names)) {
            return res.status(400).json({ message: 'company_id and company_field_names[] are required' });
        }
        // Query field_mappings for this company and these headers
        const [rows] = await db.query(
            `SELECT * FROM field_mappings WHERE company_id = ? AND company_field_name IN (?)`,
            [company_id, company_field_names]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching field mappings:', err);
        res.status(500).json({ message: 'Failed to fetch field mappings', error: err.message });
    }
});

// POST /field_mappings/save_batch
router.post('/save_batch', async (req, res) => {
    try {
        const { company_id, order_id, mappings } = req.body;
        
        if (!company_id || !Array.isArray(mappings) || mappings.length === 0) {
            return res.status(400).json({ message: 'company_id and mappings[] are required' });
        }

        // Process each mapping
        const results = [];
        for (const mapping of mappings) {
            const { 
                id, 
                company_field_name, 
                supplier_field_name, 
                show_to_rider, 
                show_in_invoice 
            } = mapping;

            if (!company_field_name || !supplier_field_name) {
                continue; // Skip invalid mappings
            }

            if (id) {
                // Update existing mapping
                const [updateResult] = await db.query(
                    `UPDATE field_mappings 
                     SET supplier_field_name = ?, 
                         show_to_rider = ?, 
                         show_in_invoice = ?,
                         updated_at = NOW()
                     WHERE id = ? AND company_id = ?`,
                    [supplier_field_name, show_to_rider || 0, show_in_invoice || 0, id, company_id]
                );
                results.push({ id, action: 'updated', affected: updateResult.affectedRows });
            } else {
                // Insert new mapping
                const [insertResult] = await db.query(
                    `INSERT INTO field_mappings 
                     (company_id, company_field_name, supplier_field_name, show_to_rider, show_in_invoice, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                    [company_id, company_field_name, supplier_field_name, show_to_rider || 0, show_in_invoice || 0]
                );
                results.push({ id: insertResult.insertId, action: 'inserted' });
            }
        }

        res.json({ 
            success: true, 
            message: `Processed ${results.length} mappings`, 
            results 
        });
    } catch (err) {
        console.error('Error saving field mappings:', err);
        res.status(500).json({ message: 'Failed to save field mappings', error: err.message });
    }
});

module.exports = router;

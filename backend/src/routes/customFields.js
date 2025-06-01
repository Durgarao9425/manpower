const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Add new custom field
router.post('/add-field', async (req, res) => {
    const {
        field_key,
        field_label,
        field_type,
        is_transaction_field,
        transaction_field_type,
        transaction_value
    } = req.body;

    if (!field_key || !field_label || !field_type) {
        return res.status(400).json({
            status: 'error',
            message: 'Field key, label, and type are required.'
        });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO custom_fields (field_key, field_label, field_type, is_transaction_field, transaction_field_type, transaction_value, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                field_key,
                field_label,
                field_type,
                is_transaction_field || false,
                transaction_field_type || null,
                transaction_value || null
            ]
        );

        res.status(201).json({
            status: 'success',
            message: 'Custom field added successfully.',
            fieldId: result.insertId
        });
    } catch (error) {
        console.error('Error adding custom field:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to add custom field. Please try again.'
        });
    }
});

// Fetch all custom fields
router.get('/', async (req, res) => {
    try {
        const [fields] = await db.query(
            'SELECT id, field_key, field_label, field_type, is_transaction_field, transaction_field_type, transaction_value, created_at, updated_at FROM custom_fields'
        );
        res.status(200).json(fields);
    } catch (error) {
        console.error('Error fetching custom fields:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch custom fields. Please try again.'
        });
    }
});

// Update a custom field
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
        field_key,
        field_label,
        field_type,
        is_transaction_field,
        transaction_field_type,
        transaction_value
    } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE custom_fields SET field_key = ?, field_label = ?, field_type = ?, is_transaction_field = ?, transaction_field_type = ?, transaction_value = ?, updated_at = NOW()
             WHERE id = ?`,
            [
                field_key,
                field_label,
                field_type,
                is_transaction_field || false,
                transaction_field_type || null,
                transaction_value || null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Custom field not found.'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Custom field updated successfully.'
        });
    } catch (error) {
        console.error('Error updating custom field:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update custom field. Please try again.'
        });
    }
});

// Delete a custom field
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query(
            `DELETE FROM custom_fields WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Custom field not found.'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Custom field deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting custom field:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete custom field. Please try again.'
        });
    }
});

module.exports = router;

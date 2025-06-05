const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parse');
const { auth } = require('../middleware/auth');
const db = require('../config/database');

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    console.log('Multer file filter:', file);
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Helper function to validate data against table structure
const validateData = (data, tableConfig) => {
  console.log('Validating data:', data);
  const errors = [];
  const warnings = [];

  // Check required fields
  tableConfig.fields.forEach(field => {
    if (field.required && !data[field.name]) {
      errors.push(`Missing required field: ${field.label}`);
    }
  });

  // Validate field types
  tableConfig.fields.forEach(field => {
    if (data[field.name]) {
      switch (field.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(data[field.name])) {
            errors.push(`Invalid email format for ${field.label}: ${data[field.name]}`);
          }
          break;
        case 'number':
          if (isNaN(Number(data[field.name]))) {
            errors.push(`Invalid number format for ${field.label}: ${data[field.name]}`);
          }
          break;
        case 'date':
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(data[field.name])) {
            errors.push(`Invalid date format for ${field.label}. Use YYYY-MM-DD`);
          }
          break;
        case 'select':
          if (field.options && !field.options.includes(data[field.name])) {
            errors.push(`Invalid option for ${field.label}: ${data[field.name]}`);
          }
          break;
      }
    }
  });

  return { errors, warnings };
};

// Bulk import endpoint
router.post('/:table', upload.single('file'), async (req, res) => {
  console.log('Bulk import request received:', {
    table: req.params.table,
    file: req.file,
    headers: req.headers
  });

  const { table } = req.params;
  const file = req.file;

  if (!file) {
    console.log('No file uploaded');
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  try {
    // Parse CSV file
    const records = [];
    const parser = csv.parse({
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    parser.on('readable', function() {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });

    parser.on('error', function(err) {
      console.error('CSV parsing error:', err);
      throw new Error(`Error parsing CSV: ${err.message}`);
    });

    parser.write(file.buffer);
    parser.end();

    console.log('CSV parsed successfully, records:', records.length);

    // Get table configuration
    let tableConfig;
    switch (table) {
      case 'users':
        tableConfig = {
          name: 'users',
          fields: [
            { name: 'username', label: 'Username', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'password', label: 'Password', type: 'text', required: true },
            { name: 'user_type', label: 'User Type', type: 'select', required: true, 
              options: ['admin', 'company', 'rider', 'store_manager'] },
            { name: 'full_name', label: 'Full Name', type: 'text', required: true },
            { name: 'phone', label: 'Phone', type: 'text', required: false },
            { name: 'status', label: 'Status', type: 'select', required: false,
              options: ['active', 'inactive', 'suspended'] }
          ]
        };
        break;
      case 'riders':
        tableConfig = {
          name: 'riders',
          fields: [
            { name: 'user_id', label: 'User ID', type: 'number', required: true },
            { name: 'rider_code', label: 'Rider Code', type: 'text', required: false },
            { name: 'emergency_contact', label: 'Emergency Contact', type: 'text', required: false },
            { name: 'date_of_birth', label: 'Date of Birth', type: 'date', required: false },
            { name: 'blood_group', label: 'Blood Group', type: 'text', required: false },
            { name: 'joining_date', label: 'Joining Date', type: 'date', required: false },
            { name: 'vehicle_type', label: 'Vehicle Type', type: 'select', required: false,
              options: ['2_wheeler', '3_wheeler', '4_wheeler'] },
            { name: 'vehicle_number', label: 'Vehicle Number', type: 'text', required: false }
          ]
        };
        break;
      case 'companies':
        tableConfig = {
          name: 'companies',
          fields: [
            { name: 'name', label: 'Company Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'phone', label: 'Phone', type: 'text', required: false },
            { name: 'address', label: 'Address', type: 'text', required: false },
            { name: 'status', label: 'Status', type: 'select', required: false,
              options: ['active', 'inactive'] }
          ]
        };
        break;
      default:
        console.log('Invalid table specified:', table);
        return res.status(400).json({
          success: false,
          message: 'Invalid table specified'
        });
    }

    console.log('Table config:', tableConfig);

    // Validate and process records
    const results = {
      total: records.length,
      success: 0,
      failed: 0,
      errors: []
    };

    for (const record of records) {
      const { errors, warnings } = validateData(record, tableConfig);
      
      if (errors.length > 0) {
        results.failed++;
        results.errors.push({
          row: results.total - records.length + 1,
          errors
        });
        continue;
      }

      try {
        // Insert record into database
        const columns = Object.keys(record).join(', ');
        const values = Object.values(record).map(() => '?').join(', ');
        const query = `INSERT INTO ${table} (${columns}) VALUES (${values})`;
        
        console.log('Executing query:', query);
        await db.query(query, Object.values(record));
        results.success++;
      } catch (error) {
        console.error('Database error:', error);
        results.failed++;
        results.errors.push({
          row: results.total - records.length + 1,
          errors: [error.message]
        });
      }
    }

    console.log('Import results:', results);

    // Return results
    res.json({
      success: true,
      message: `Import completed. ${results.success} records imported successfully, ${results.failed} failed.`,
      results
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing import'
    });
  }
});

module.exports = router; 
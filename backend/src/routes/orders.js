const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const upload = multer({ dest: 'uploads/daily_orders/' });
const ordersController = require('../ordersController');

// Company and store dropdowns
router.get('/companies', ordersController.getCompanies);
router.get('/company-stores', ordersController.getCompanyStores);

// Settings
router.get('/settings/per-order-amount', ordersController.getPerOrderAmount);
router.post('/settings/per-order-amount', ordersController.setPerOrderAmount);

// Upload daily orders
router.post('/upload-daily', upload.single('file'), ordersController.uploadDailyOrders);

// Recent uploads
router.get('/orders/daily-uploads', ordersController.getRecentDailyUploads);

// Fetch companies
router.get('/companies', async (req, res) => {
  try {
    const [companies] = await db.query('SELECT id, company_name FROM companies');
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Fetch stores based on company
router.get('/stores', async (req, res) => {
  const { company_id } = req.query;
  try {
    const [stores] = await db.query(
      'SELECT id, company_id, store_name FROM company_stores WHERE company_id = ?',
      [company_id]
    );
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Upload and process orders
router.post('/upload', upload.single('file'), async (req, res) => {
  const { company_id, store_id, order_date } = req.body;
  const filePath = req.file.path;

  if (!company_id || !order_date) {
    return res.status(400).json({ error: 'Company and order date are required' });
  }

  try {
    const riders = [];
    const fileStream = fs.createReadStream(filePath);

    fileStream
      .pipe(csv())
      .on('data', (row) => {
        riders.push(row);
      })
      .on('end', async () => {
        // Validate and process riders
        const validRiders = [];
        let totalOrders = 0;

        for (const rider of riders) {
          const { company_rider_id, order_count, rider_name } = rider;

          if (!company_rider_id || !order_count) {
            continue;
          }

          const [assignment] = await db.query(
            'SELECT * FROM rider_assignments WHERE company_rider_id = ? AND company_id = ? AND store_id = ?',
            [company_rider_id, company_id, store_id]
          );

          if (assignment.length > 0) {
            validRiders.push({
              company_rider_id,
              order_count: parseInt(order_count, 10),
              rider_name,
              rider_id: assignment[0].rider_id,
            });
            totalOrders += parseInt(order_count, 10);
          }
        }

        if (validRiders.length === 0) {
          return res.status(400).json({ error: 'No valid riders found in the uploaded file' });
        }

        // Insert into daily_order_uploads
        const [uploadResult] = await db.query(
          `INSERT INTO daily_order_uploads 
          (file_name, upload_date, order_date, company_id, store_id, total_riders, total_orders, status) 
          VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)`,
          [
            req.file.originalname,
            order_date,
            company_id,
            store_id || null,
            validRiders.length,
            totalOrders,
            'Processed',
          ]
        );

        const uploadId = uploadResult.insertId;

        // Insert into daily_rider_orders
        for (const rider of validRiders) {
          const perOrderAmount = await db.query(
            "SELECT setting_value FROM system_settings WHERE setting_key = 'per_order_amount'"
          );

          const totalEarning = parseInt(rider.order_count, 10) * parseFloat(perOrderAmount[0]?.setting_value || 0);

          await db.query(
            `INSERT INTO daily_rider_orders 
            (upload_id, company_id, store_id, rider_id, rider_name, company_rider_id, order_count, per_order_amount, total_earning, order_date, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              uploadId,
              company_id,
              store_id || null,
              rider.rider_id,
              rider.rider_name || null,
              rider.company_rider_id,
              rider.order_count,
              perOrderAmount[0]?.setting_value || 0,
              totalEarning,
              order_date,
            ]
          );
        }

        fs.unlinkSync(filePath); // Clean up uploaded file
        res.json({ message: 'File processed successfully', uploadId });
      });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

module.exports = router;
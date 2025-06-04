const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Configure multer storage
const dailyOrdersStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = 'uploads/daily_orders/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const weeklyOrdersStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = 'uploads/weekly_orders/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const dailyOrdersUpload = multer({ storage: dailyOrdersStorage });
const weeklyOrdersUpload = multer({ storage: weeklyOrdersStorage });

const ordersController = require('../ordersController');

// Company and store dropdowns
router.get('/companies', ordersController.getCompanies);
router.get('/company-stores', ordersController.getCompanyStores);

// Settings
router.get('/settings/per-order-amount', ordersController.getPerOrderAmount);
router.post('/settings/per-order-amount', ordersController.setPerOrderAmount);

// Upload daily orders
router.post('/upload-daily', dailyOrdersUpload.single('file'), ordersController.uploadDailyOrders);

// Daily order uploads endpoints
router.get('/daily-uploads', ordersController.getRecentDailyUploads);
router.get('/daily-uploads/:uploadId', ordersController.getDailyOrderUploadDetails);
router.delete('/daily-uploads/:uploadId', ordersController.deleteDailyOrderUpload);
router.get('/daily-stats', ordersController.getDailyOrderStats);

// Weekly order statement endpoints
router.post('/upload-order-statement', weeklyOrdersUpload.single('file'), ordersController.uploadOrderStatement);
router.get('/order-statement-preview', ordersController.getOrderStatementPreview);
router.post('/map-order-statement', ordersController.mapOrderStatement);
router.get('/weekly-settlement/:id', ordersController.getWeeklySettlement);
router.get('/weekly-summary/:id', ordersController.getWeeklySummary);
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

// System fields for mapping order statements
router.get('/system_fields', ordersController.getSystemFields);

module.exports = router;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/daily_orders/' });
const ordersController = require('../ordersController');

// Company and store dropdowns
router.get('/companies', ordersController.getCompanies);
router.get('/company-stores', ordersController.getCompanyStores);

// Settings
router.get('/settings/per-order-amount', ordersController.getPerOrderAmount);
router.post('/settings/per-order-amount', ordersController.setPerOrderAmount);

// Upload daily orders
router.post('/orders/upload-daily', upload.single('file'), ordersController.uploadDailyOrders);

// Recent uploads
router.get('/orders/daily-uploads', ordersController.getRecentDailyUploads);

module.exports = router;

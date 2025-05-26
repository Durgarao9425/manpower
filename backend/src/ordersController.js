const db = require('./config/database');
const csv = require('csv-parser');
const fs = require('fs');

// Get all companies
exports.getCompanies = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM companies');
    res.json({ status: 'success', companies: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Get stores for a company
exports.getCompanyStores = async (req, res) => {
  const companyId = req.query.company_id;
  if (!companyId) return res.status(400).json({ status: 'error', message: 'company_id required' });
  try {
    const [rows] = await db.query('SELECT * FROM company_stores WHERE company_id = ?', [companyId]);
    res.json({ status: 'success', stores: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Get per order amount
exports.getPerOrderAmount = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT setting_value FROM system_settings WHERE setting_key = 'per_order_amount' LIMIT 1");
    res.json({ status: 'success', value: rows[0]?.setting_value || 0 });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Set per order amount
exports.setPerOrderAmount = async (req, res) => {
  const { value } = req.body;
  if (!value || isNaN(value)) return res.status(400).json({ status: 'error', message: 'Invalid value' });
  try {
    await db.query("UPDATE system_settings SET setting_value = ? WHERE setting_key = 'per_order_amount'", [value]);
    res.json({ status: 'success', value });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Upload daily orders (CSV)
exports.uploadDailyOrders = async (req, res) => {
  const { company_id, store_id, order_date } = req.body;
  if (!company_id || !order_date || !req.file) {
    return res.status(400).json({ status: 'error', message: 'company_id, order_date, and file required' });
  }
  try {
    // Get per order amount
    const [settingRows] = await db.query("SELECT setting_value FROM system_settings WHERE setting_key = 'per_order_amount' LIMIT 1");
    const perOrderAmount = parseFloat(settingRows[0]?.setting_value || 0);
    // Read CSV
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        let totalRiders = 0;
        let totalOrders = 0;
        // Insert upload record
        const [uploadResult] = await db.query(
          'INSERT INTO daily_order_uploads (file_name, order_date, upload_date, company_id, store_id, status) VALUES (?, ?, NOW(), ?, ?, ?)',
          [req.file.filename, order_date, company_id, store_id || null, 'processed']
        );
        const uploadId = uploadResult.insertId;
        for (const row of results) {
          const companyRiderId = row.company_rider_id || row["company_rider_id"];
          const orderCount = parseInt(row.order_count || row["order_count"]);
          const riderName = row.rider_name || row["rider_name"] || '';
          if (!companyRiderId || !orderCount || orderCount <= 0) continue;
          // Validate assignment
          const [assignRows] = await db.query(
            'SELECT rider_id FROM rider_assignments WHERE company_rider_id = ? AND company_id = ?',
            [companyRiderId, company_id]
          );
          if (!assignRows.length) continue;
          const riderId = assignRows[0].rider_id;
          const totalEarning = orderCount * perOrderAmount;
          await db.query(
            'INSERT INTO daily_rider_orders (upload_id, company_id, store_id, rider_id, rider_name, company_rider_id, order_count, per_order_amount, total_earning, order_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [uploadId, company_id, store_id || null, riderId, riderName, companyRiderId, orderCount, perOrderAmount, totalEarning, order_date]
          );
          totalRiders++;
          totalOrders += orderCount;
        }
        await db.query('UPDATE daily_order_uploads SET total_riders = ?, total_orders = ? WHERE id = ?', [totalRiders, totalOrders, uploadId]);
        res.json({ status: 'success', message: `Processed ${totalRiders} riders, ${totalOrders} orders.` });
      });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Get recent daily uploads
exports.getRecentDailyUploads = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  try {
    const [rows] = await db.query('SELECT * FROM daily_order_uploads ORDER BY upload_date DESC LIMIT ?', [limit]);
    res.json({ status: 'success', uploads: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

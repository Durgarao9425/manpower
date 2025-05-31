const db = require('./config/database');
const csv = require('csv-parser');
const fs = require('fs');

// Update to handle new fields `totalOrders` and `totalRiders`
exports.uploadDailyOrders = async (req, res) => {
    const { company_id, store_id, order_date, totalOrders, totalRiders } = req.body;
    if (!company_id || !order_date || !req.file) {
        return res.status(400).json({ status: 'error', message: 'company_id, order_date, and file required' });
    }
    try {
        // Add debugging to verify `total_orders` and `total_riders`
        console.log('Received total_orders:', totalOrders);
        console.log('Received total_riders:', totalRiders);

        // Validate new fields
        const validatedTotalOrders = parseInt(totalOrders, 10) || 0;
        const validatedTotalRiders = parseInt(totalRiders, 10) || 0;

        // Insert upload record with new fields
        console.log('Inserting upload record into daily_order_uploads with total_orders and total_riders...');
        const [uploadResult] = await db.query(
            'INSERT INTO daily_order_uploads (file_name, order_date, upload_date, company_id, store_id, total_orders, total_riders, status) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)',
            [req.file.filename, order_date, company_id, store_id, validatedTotalOrders, validatedTotalRiders, 'Processed']
        );
        const uploadId = uploadResult.insertId;
        console.log(`Upload record inserted with ID: ${uploadId}, total_orders: ${validatedTotalOrders}, total_riders: ${validatedTotalRiders}`);

        // Process CSV data
        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                let totalRiders = 0;
                let totalOrders = 0;

                for (const row of results) {
                    const companyRiderId = row.company_rider_id || row["company_rider_id"];
                    const orderCount = parseInt(row.order_count || row["order_count"]);
                    const riderName = row.rider_name || row["rider_name"] || '';

                    if (!companyRiderId || !orderCount || orderCount <= 0) {
                        console.log(`Skipping row due to invalid data: ${JSON.stringify(row)}`);
                        continue;
                    }

                    // Validate assignment
                    try {
                        const [assignRows] = await db.query(
                            'SELECT rider_id FROM rider_assignments WHERE company_rider_id = ? AND company_id = ?',
                            [companyRiderId, company_id]
                        );

                        if (!assignRows.length) {
                            console.log(`Validation failed: No matching assignment for company_rider_id: ${companyRiderId}, company_id: ${company_id}`);
                            continue;
                        }

                        const riderId = assignRows[0].rider_id;
                        const totalEarning = orderCount * (parseFloat(settingRows[0]?.setting_value || 0));

                        await db.query(
                            'INSERT INTO daily_rider_orders (upload_id, company_id, store_id, rider_id, rider_name, company_rider_id, order_count, per_order_amount, total_earning, order_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [uploadId, company_id, store_id || null, riderId, riderName, companyRiderId, orderCount, parseFloat(settingRows[0]?.setting_value || 0), totalEarning, order_date]
                        );
                    } catch (error) {
                        console.error(`Error during database operation for company_rider_id: ${companyRiderId}, error: ${error.message}`);
                        continue;
                    }

                    totalRiders++;
                    totalOrders += orderCount;
                }

                // Update upload record with totals
                await db.query('UPDATE daily_order_uploads SET total_riders = ?, total_orders = ? WHERE id = ?', [totalRiders, totalOrders, uploadId]);

                console.log(`Processed ${totalRiders} riders and ${totalOrders} orders.`);
                res.json({ status: 'success', message: `Processed ${totalRiders} riders, ${totalOrders} orders.` });
            });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: 'Order ID and Status are required.' });
        }

        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
        res.json({ success: true, message: 'Order status updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while updating order status.' });
    }
};

exports.getOrdersWithFilters = async (req, res) => {
    try {
        const { dateFrom, dateTo, status, companyId, storeId, riderId } = req.query;

        const filters = [];
        const params = [];

        if (dateFrom && dateTo) {
            filters.push('order_date BETWEEN ? AND ?');
            params.push(dateFrom, dateTo);
        }
        if (status) {
            filters.push('status = ?');
            params.push(status);
        }
        if (companyId) {
            filters.push('company_id = ?');
            params.push(companyId);
        }
        if (storeId) {
            filters.push('store_id = ?');
            params.push(storeId);
        }
        if (riderId) {
            filters.push('rider_id = ?');
            params.push(riderId);
        }

        const query = `SELECT * FROM orders ${filters.length ? 'WHERE ' + filters.join(' AND ') : ''}`;
        const orders = await db.query(query, params);

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching orders.' });
    }
};

// Fetch companies
exports.getCompanies = async (req, res) => {
  try {
    const [companies] = await db.query('SELECT id, company_name FROM companies');
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

// Fetch company stores
exports.getCompanyStores = async (req, res) => {
  const { company_id } = req.query;
  try {
    const [stores] = await db.query('SELECT id, store_name FROM company_stores WHERE company_id = ?', [company_id]);
    res.json(stores);
  } catch (error) {
    console.error('Error fetching company stores:', error);
    res.status(500).json({ error: 'Failed to fetch company stores' });
  }
};

// Get per-order amount
exports.getPerOrderAmount = async (req, res) => {
  try {
    const [settings] = await db.query("SELECT setting_value FROM system_settings WHERE setting_key = 'per_order_amount'");
    res.json({ per_order_amount: settings[0]?.setting_value || 0 });
  } catch (error) {
    console.error('Error fetching per-order amount:', error);
    res.status(500).json({ error: 'Failed to fetch per-order amount' });
  }
};

// Set per-order amount
exports.setPerOrderAmount = async (req, res) => {
  const { per_order_amount } = req.body;
  try {
    await db.query("UPDATE system_settings SET setting_value = ? WHERE setting_key = 'per_order_amount'", [per_order_amount]);
    res.json({ message: 'Per-order amount updated successfully' });
  } catch (error) {
    console.error('Error updating per-order amount:', error);
    res.status(500).json({ error: 'Failed to update per-order amount' });
  }
};

// Get recent daily uploads
exports.getRecentDailyUploads = async (req, res) => {
  try {
    const [uploads] = await db.query('SELECT * FROM daily_order_uploads ORDER BY upload_date DESC LIMIT 10');
    res.json(uploads);
  } catch (error) {
    console.error('Error fetching recent daily uploads:', error);
    res.status(500).json({ error: 'Failed to fetch recent daily uploads' });
  }
};

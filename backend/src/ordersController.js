const db = require('./config/database');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

/**
 * Upload and process daily orders
 * This function replicates the PHP implementation from upload_daily_orders.php
 */
exports.uploadDailyOrders = async (req, res) => {
    try {
        // Validate required fields
        const { company_id, store_id, order_date } = req.body;
        if (!company_id || !order_date || !req.file) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Company ID, order date, and file are required' 
            });
        }

        // Get per-order amount from settings
        const [settingsRows] = await db.query(
            "SELECT setting_value FROM system_settings WHERE setting_key = 'per_order_amount'"
        );
        const perOrderAmount = parseFloat(settingsRows[0]?.setting_value || 50);

        // Get file extension
        const fileExt = path.extname(req.file.originalname).toLowerCase().substring(1);
        
        // Validate file type
        if (!['csv', 'xlsx', 'xls'].includes(fileExt)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid file format. Please upload a CSV or Excel file.'
            });
        }

        // Start transaction
        await db.query('START TRANSACTION');

        try {
            // Create upload record
            const [uploadResult] = await db.query(
                'INSERT INTO daily_order_uploads (file_name, order_date, upload_date, company_id, store_id, status) VALUES (?, ?, NOW(), ?, ?, ?)',
                [req.file.originalname, order_date, company_id, store_id || null, 'Processing']
            );
            const uploadId = uploadResult.insertId;
            console.log(`Created upload record with ID: ${uploadId}`);

            // Process the file
            let rows = [];
            
            if (fileExt === 'csv') {
                // Read CSV file
                const fileContent = fs.readFileSync(req.file.path, 'utf8');
                const workbook = XLSX.read(fileContent, { type: 'string' });
                const sheetName = workbook.SheetNames[0];
                rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
            } else {
                // Read Excel file
                const workbook = XLSX.readFile(req.file.path);
                const sheetName = workbook.SheetNames[0];
                rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
            }

            // Validate file structure
            if (rows.length < 2) {
                await db.query('UPDATE daily_order_uploads SET status = ? WHERE id = ?', ['Failed', uploadId]);
                await db.query('COMMIT');
                return res.status(400).json({
                    status: 'error',
                    message: 'File does not contain enough data. Please check the file format.'
                });
            }

            // Get column headers
            const headers = rows[0].map(header => String(header).toLowerCase().trim());
            
            // Find column indexes
            const companyRiderIdCol = headers.findIndex(h => 
                h.includes('company_rider_id') || h.includes('company rider id') || h.includes('rider id')
            );
            
            const riderNameCol = headers.findIndex(h => 
                (h.includes('rider') && h.includes('name')) || h === 'name'
            );
            
            const orderCountCol = headers.findIndex(h => 
                h.includes('order') || h.includes('count') || h === 'orders'
            );

            // Validate required columns
            if (companyRiderIdCol === -1 || orderCountCol === -1) {
                await db.query('UPDATE daily_order_uploads SET status = ? WHERE id = ?', ['Failed', uploadId]);
                await db.query('COMMIT');
                return res.status(400).json({
                    status: 'error',
                    message: 'Could not identify company_rider_id or order count columns. Please check the file format.'
                });
            }

            // Process each row
            let totalRiders = 0;
            let totalOrders = 0;
            
            // Skip header row
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                
                // Skip empty rows
                if (!row[companyRiderIdCol] || !row[orderCountCol]) {
                    continue;
                }
                
                const companyRiderId = String(row[companyRiderIdCol]).trim();
                const orderCount = parseInt(row[orderCountCol], 10);
                const riderName = riderNameCol !== -1 && row[riderNameCol] ? String(row[riderNameCol]).trim() : '';
                
                // Skip rows with zero or negative order counts
                if (orderCount <= 0) {
                    continue;
                }
                
                // Find rider by company_rider_id
                const [assignmentRows] = await db.query(
                    'SELECT rider_id FROM rider_assignments WHERE TRIM(company_rider_id) = ? AND company_id = ?',
                    [companyRiderId, company_id]
                );
                
                // Only process if rider is found
                if (assignmentRows.length > 0) {
                    const riderId = assignmentRows[0].rider_id;
                    
                    // Calculate total earning
                    const totalEarning = orderCount * perOrderAmount;
                    
                    // Insert daily rider order record
                    await db.query(
                        `INSERT INTO daily_rider_orders 
                        (upload_id, company_id, store_id, rider_id, rider_name, company_rider_id, order_count, per_order_amount, total_earning, order_date) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            uploadId, 
                            company_id, 
                            store_id || null, 
                            riderId, 
                            riderName, 
                            companyRiderId, 
                            orderCount, 
                            perOrderAmount, 
                            totalEarning, 
                            order_date
                        ]
                    );
                    
                    totalRiders++;
                    totalOrders += orderCount;
                } else {
                    console.log(`No rider assignment found for company_rider_id: ${companyRiderId} in company: ${company_id}`);
                }
            }
            
            // Update upload record with totals
            await db.query(
                'UPDATE daily_order_uploads SET total_riders = ?, total_orders = ?, status = ? WHERE id = ?',
                [totalRiders, totalOrders, 'Processed', uploadId]
            );
            
            // Commit transaction
            await db.query('COMMIT');
            
            // Return success response
            return res.status(200).json({
                status: 'success',
                message: `Daily orders processed successfully. Found ${totalRiders} riders with a total of ${totalOrders} orders.`,
                data: {
                    uploadId,
                    totalRiders,
                    totalOrders,
                    orderDate: order_date
                }
            });
            
        } catch (error) {
            // Rollback transaction on error
            await db.query('ROLLBACK');
            console.error('Error processing file:', error);
            return res.status(500).json({
                status: 'error',
                message: `Error processing file: ${error.message}`
            });
        }
    } catch (error) {
        console.error('Error in upload process:', error);
        return res.status(500).json({
            status: 'error',
            message: `Server error: ${error.message}`
        });
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

/**
 * Get recent daily order uploads
 * Replicates the PHP implementation from Order.php getDailyOrderUploads
 */
exports.getRecentDailyUploads = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    
    const [uploads] = await db.query(`
      SELECT dou.*, 
             c.company_name,
             cs.store_name,
             (SELECT COUNT(*) FROM daily_rider_orders WHERE upload_id = dou.id) as rider_count,
             (SELECT SUM(order_count) FROM daily_rider_orders WHERE upload_id = dou.id) as order_count
      FROM daily_order_uploads dou
      LEFT JOIN companies c ON dou.company_id = c.id
      LEFT JOIN company_stores cs ON dou.store_id = cs.id
      ORDER BY dou.upload_date DESC
      LIMIT ?
    `, [parseInt(limit, 10)]);
    
    res.json({
      status: 'success',
      data: uploads
    });
  } catch (error) {
    console.error('Error fetching recent daily uploads:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch recent daily uploads' 
    });
  }
};

/**
 * Get daily order upload details
 * Returns details of a specific upload including rider orders
 */
exports.getDailyOrderUploadDetails = async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    if (!uploadId) {
      return res.status(400).json({
        status: 'error',
        message: 'Upload ID is required'
      });
    }
    
    // Get upload details
    const [uploadRows] = await db.query(`
      SELECT dou.*, 
             c.company_name,
             cs.store_name
      FROM daily_order_uploads dou
      LEFT JOIN companies c ON dou.company_id = c.id
      LEFT JOIN company_stores cs ON dou.store_id = cs.id
      WHERE dou.id = ?
    `, [uploadId]);
    
    if (uploadRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Upload not found'
      });
    }
    
    // Get rider orders for this upload
    const [riderOrders] = await db.query(`
      SELECT dro.*, 
             r.full_name as rider_full_name
      FROM daily_rider_orders dro
      LEFT JOIN riders r ON dro.rider_id = r.id
      WHERE dro.upload_id = ?
      ORDER BY dro.order_count DESC
    `, [uploadId]);
    
    res.json({
      status: 'success',
      data: {
        upload: uploadRows[0],
        riderOrders
      }
    });
  } catch (error) {
    console.error('Error fetching upload details:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch upload details' 
    });
  }
};

/**
 * Delete daily order upload
 * Deletes an upload and its associated rider orders
 */
exports.deleteDailyOrderUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    if (!uploadId) {
      return res.status(400).json({
        status: 'error',
        message: 'Upload ID is required'
      });
    }
    
    // Start transaction
    await db.query('START TRANSACTION');
    
    // Delete rider orders first (foreign key constraint)
    await db.query('DELETE FROM daily_rider_orders WHERE upload_id = ?', [uploadId]);
    
    // Delete upload record
    const [result] = await db.query('DELETE FROM daily_order_uploads WHERE id = ?', [uploadId]);
    
    if (result.affectedRows === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({
        status: 'error',
        message: 'Upload not found'
      });
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.json({
      status: 'success',
      message: 'Upload deleted successfully'
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error deleting upload:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to delete upload' 
    });
  }
};

/**
 * Get daily order statistics
 * Returns statistics about daily orders
 */
exports.getDailyOrderStats = async (req, res) => {
  try {
    // Get total uploads
    const [totalUploadsResult] = await db.query('SELECT COUNT(*) as count FROM daily_order_uploads');
    const totalUploads = totalUploadsResult[0].count;
    
    // Get total orders
    const [totalOrdersResult] = await db.query('SELECT SUM(total_orders) as count FROM daily_order_uploads');
    const totalOrders = totalOrdersResult[0].count || 0;
    
    // Get total riders
    const [totalRidersResult] = await db.query('SELECT COUNT(DISTINCT rider_id) as count FROM daily_rider_orders');
    const totalRiders = totalRidersResult[0].count;
    
    // Get recent uploads
    const [recentUploads] = await db.query(`
      SELECT dou.*, 
             c.company_name,
             cs.store_name
      FROM daily_order_uploads dou
      LEFT JOIN companies c ON dou.company_id = c.id
      LEFT JOIN company_stores cs ON dou.store_id = cs.id
      ORDER BY dou.upload_date DESC
      LIMIT 5
    `);
    
    res.json({
      status: 'success',
      data: {
        totalUploads,
        totalOrders,
        totalRiders,
        recentUploads
      }
    });
  } catch (error) {
    console.error('Error fetching daily order stats:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch daily order statistics' 
    });
  }
};

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

/**
 * Upload Order Statement
 * Handles the upload of weekly order statement Excel files
 * Based on upload_order_statement.php
 */
exports.uploadOrderStatement = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    const fileExt = path.extname(fileName).toLowerCase();

    // Validate file type
    if (!['.xlsx', '.xls', '.csv'].includes(fileExt)) {
      // Delete the invalid file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid file format. Please upload an Excel or CSV file.'
      });
    }

    // Process the file to extract headers and preview data
    const XLSX = require('xlsx');
    let workbook;
    
    try {
      workbook = XLSX.readFile(filePath);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      return res.status(400).json({
        status: 'error',
        message: 'Could not read the uploaded file. Please check the file format.'
      });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'The uploaded file does not contain enough data.'
      });
    }

    // Extract headers and a few rows for preview
    const headers = jsonData[0];
    const previewRows = jsonData.slice(1, Math.min(6, jsonData.length));
    
    // Store file info in session or database for later processing
    const uploadId = Date.now().toString();
    const uploadInfo = {
      id: uploadId,
      fileName,
      filePath,
      fileSize: `${(fileSize / 1024 / 1024).toFixed(2)} MB`,
      uploadDate: new Date().toISOString(),
      totalRows: jsonData.length - 1, // Excluding header row
      headers,
      previewRows
    };

    // Store in database for persistence
    await db.query(
      `INSERT INTO upload_order_statement 
      (company_id, payment_date, start_date, end_date, amount, status, file_path, mapping_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.company_id || 1, // Default to company ID 1 if not provided
        new Date().toISOString().split('T')[0], // Current date as payment date
        req.body.start_date || new Date().toISOString().split('T')[0], // Default to current date
        req.body.end_date || new Date().toISOString().split('T')[0], // Default to current date
        0, // Amount will be calculated after mapping
        'pending',
        filePath,
        'unmapped'
      ]
    );

    // Get the inserted ID
    const [result] = await db.query('SELECT LAST_INSERT_ID() as id');
    const dbUploadId = result[0].id;

    // Return success with file info and preview data
    return res.status(200).json({
      status: 'success',
      message: 'File uploaded successfully',
      data: {
        uploadId: dbUploadId,
        fileName,
        uploadDate: new Date().toISOString(),
        fileSize: `${(fileSize / 1024 / 1024).toFixed(2)} MB`,
        totalRows: jsonData.length - 1,
        headers,
        previewRows: previewRows
      }
    });
  } catch (error) {
    console.error('Error uploading order statement:', error);
    return res.status(500).json({
      status: 'error',
      message: `Server error: ${error.message}`
    });
  }
};

/**
 * Get Order Statement Preview
 * Returns the preview data for a previously uploaded order statement
 * Based on mapped_data_preview.php
 */
exports.getOrderStatementPreview = async (req, res) => {
  try {
    const { uploadId } = req.query;
    if (!uploadId) {
      return res.status(400).json({
        status: 'error',
        message: 'Upload ID is required'
      });
    }

    // Try daily_order_uploads first
    let upload = null;
    let filePath = null;
    let fileName = null;
    let uploadDate = null;
    let tableType = null;
    let totalRows = 0;
    // Try daily_order_uploads
    const [dailyRows] = await db.query(
      'SELECT * FROM daily_order_uploads WHERE id = ?',
      [uploadId]
    );
    if (dailyRows.length > 0) {
      upload = dailyRows[0];
      fileName = upload.file_name;
      filePath = path.join(__dirname, '../../uploads/daily_orders/', fileName);
      uploadDate = upload.upload_date;
      tableType = 'daily';
    } else {
      // Try company_payments
      const [paymentRows] = await db.query(
        'SELECT * FROM company_payments WHERE id = ?',
        [uploadId]
      );
      if (paymentRows.length > 0) {
        upload = paymentRows[0];
        fileName = upload.file_path;
        filePath = path.join(__dirname, '../../uploads/payments/', fileName);
        uploadDate = upload.payment_date || upload.created_at;
        tableType = 'payment';
      }
    }

    if (!upload) {
      return res.status(404).json({
        status: 'error',
        message: 'Upload not found'
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found'
      });
    }

    // Read the file
    const XLSX = require('xlsx');
    const ext = path.extname(filePath).toLowerCase();
    let jsonData = [];
    let headers = [];
    let previewRows = [];
    if (ext === '.csv') {
      // Read CSV file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const workbook = XLSX.read(fileContent, { type: 'string' });
      const sheetName = workbook.SheetNames[0];
      jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    } else {
      // Read Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    }
    headers = jsonData[0];
    previewRows = jsonData.slice(1, Math.min(6, jsonData.length));
    totalRows = jsonData.length - 1;

    // Get system fields for mapping
    const [systemFields] = await db.query('SELECT field_key, field_label, field_type FROM system_fields');

    return res.status(200).json({
      status: 'success',
      data: {
        uploadId,
        fileName,
        uploadDate,
        totalRows,
        headers,
        previewRows,
        systemFields
      }
    });
  } catch (error) {
    console.error('Error getting order statement preview:', error);
    return res.status(500).json({
      status: 'error',
      message: `Server error: ${error.message}`
    });
  }
};

/**
 * Map Order Statement
 * Maps the columns from the uploaded file to system fields and saves the mapping
 * Based on map_order_statement.php
 */
exports.mapOrderStatement = async (req, res) => {
  try {
    const { uploadId, mappings } = req.body;
    
    if (!uploadId || !mappings || !Array.isArray(mappings)) {
      return res.status(400).json({
        status: 'error',
        message: 'Upload ID and mappings are required'
      });
    }

    // Get upload details from database
    const [uploadRows] = await db.query(
      'SELECT * FROM upload_order_statement WHERE id = ?',
      [uploadId]
    );

    if (uploadRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Upload not found'
      });
    }

    const upload = uploadRows[0];
    const filePath = upload.file_path;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found'
      });
    }

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // Save mappings to database
      for (const mapping of mappings) {
        if (mapping.isSelected && mapping.systemField !== 'none') {
          await db.query(
            `INSERT INTO payment_field_mappings 
            (payment_id, company_column, system_field) 
            VALUES (?, ?, ?)`,
            [uploadId, mapping.companyColumn, mapping.systemField]
          );
        }
      }

      // Update upload status
      await db.query(
        'UPDATE upload_order_statement SET mapping_status = ? WHERE id = ?',
        ['mapped', uploadId]
      );

      // Process the file based on mappings
      const XLSX = require('xlsx');
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const headers = jsonData[0];
      const dataRows = jsonData.slice(1);

      // Process each row based on mappings
      let totalAmount = 0;
      let processedRows = 0;

      for (const row of dataRows) {
        const processedData = {};
        let hasRequiredFields = true;

        // Map each column based on the provided mappings
        for (const mapping of mappings) {
          if (mapping.isSelected && mapping.systemField !== 'none') {
            const columnIndex = headers.indexOf(mapping.companyColumn);
            if (columnIndex !== -1 && columnIndex < row.length) {
              processedData[mapping.systemField] = row[columnIndex];
            } else {
              hasRequiredFields = false;
              break;
            }
          }
        }

        // Skip rows with missing required fields
        if (!hasRequiredFields) {
          continue;
        }

        // Calculate total amount if earnings field is mapped
        if (processedData.total_earnings) {
          const earnings = parseFloat(processedData.total_earnings) || 0;
          totalAmount += earnings;
        }

        // TODO: Insert processed data into appropriate tables based on your schema
        // This would depend on how you want to store the mapped data

        processedRows++;
      }

      // Update total amount in upload record
      await db.query(
        'UPDATE upload_order_statement SET amount = ? WHERE id = ?',
        [totalAmount, uploadId]
      );

      // Commit transaction
      await db.query('COMMIT');

      return res.status(200).json({
        status: 'success',
        message: `Mapping completed successfully. Processed ${processedRows} rows.`,
        data: {
          uploadId,
          processedRows,
          totalAmount
        }
      });
    } catch (error) {
      // Rollback transaction on error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error mapping order statement:', error);
    return res.status(500).json({
      status: 'error',
      message: `Server error: ${error.message}`
    });
  }
};

/**
 * Get Weekly Settlement
 * Returns the weekly settlement data for a specific upload
 * Based on WeeklySettlement.php
 */
exports.getWeeklySettlement = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Settlement ID is required'
      });
    }

    // Get settlement details from database
    const [settlementRows] = await db.query(
      `SELECT ws.*, 
              r.full_name as rider_name, 
              r.phone as rider_phone,
              c.company_name
       FROM weekly_settlements ws
       JOIN riders r ON ws.rider_id = r.id
       JOIN companies c ON r.company_id = c.id
       WHERE ws.id = ?`,
      [id]
    );

    if (settlementRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Settlement not found'
      });
    }

    const settlement = settlementRows[0];

    // Get settlement details
    const [orderDetails] = await db.query(
      `SELECT * FROM daily_rider_orders 
       WHERE rider_id = ? 
       AND order_date BETWEEN ? AND ?
       ORDER BY order_date`,
      [settlement.rider_id, settlement.start_date, settlement.end_date]
    );

    return res.status(200).json({
      status: 'success',
      data: {
        settlement,
        orderDetails
      }
    });
  } catch (error) {
    console.error('Error getting weekly settlement:', error);
    return res.status(500).json({
      status: 'error',
      message: `Server error: ${error.message}`
    });
  }
};

/**
 * Get Weekly Summary
 * Returns the weekly summary report for a specific period
 * Based on WeeklySummary.php
 */
exports.getWeeklySummary = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Upload ID is required'
      });
    }

    // Get upload details from database
    const [uploadRows] = await db.query(
      'SELECT * FROM upload_order_statement WHERE id = ?',
      [id]
    );

    if (uploadRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Upload not found'
      });
    }

    const upload = uploadRows[0];

    // Get company details
    const [companyRows] = await db.query(
      'SELECT * FROM companies WHERE id = ?',
      [upload.company_id]
    );

    if (companyRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found'
      });
    }

    const company = companyRows[0];

    // Get all riders with orders in this period
    const [riderSummaries] = await db.query(
      `SELECT 
        r.id as rider_id,
        r.full_name as rider_name,
        r.phone as rider_phone,
        COUNT(dro.id) as total_days,
        SUM(dro.order_count) as total_orders,
        SUM(dro.total_earning) as total_earnings
       FROM riders r
       JOIN daily_rider_orders dro ON r.id = dro.rider_id
       WHERE dro.company_id = ?
       AND dro.order_date BETWEEN ? AND ?
       GROUP BY r.id
       ORDER BY r.full_name`,
      [upload.company_id, upload.start_date, upload.end_date]
    );

    // Calculate totals
    let totalRiders = riderSummaries.length;
    let totalOrders = 0;
    let totalEarnings = 0;

    riderSummaries.forEach(summary => {
      totalOrders += summary.total_orders;
      totalEarnings += parseFloat(summary.total_earnings);
    });

    return res.status(200).json({
      status: 'success',
      data: {
        upload,
        company,
        riderSummaries,
        totals: {
          totalRiders,
          totalOrders,
          totalEarnings
        }
      }
    });
  } catch (error) {
    console.error('Error getting weekly summary:', error);
    return res.status(500).json({
      status: 'error',
      message: `Server error: ${error.message}`
    });
  }
};

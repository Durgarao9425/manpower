<?php
/**
 * Admin Daily Orders Upload
 * Allows admin to upload daily order reports with rider names and order counts
 */

// Include initialization file
require_once '../includes/init.php';

// Check if user is logged in and is admin
if (!isLoggedIn() || !isAdmin()) {
    redirect('../login.php');
}

// Initialize database connection
$db = Database::getInstance();

// Initialize models
$rider_model = new Rider($db);
$order_model = new Order($db);
$payment_model = new Payment($db);
$setting_model = new Setting($db);
$company_model = new Company($db);

// Get all companies with their stores
$companies = $company_model->getAllCompanies(null, true);

// Get per-order amount from settings or use default
$per_order_amount = $setting_model->getSetting('per_order_amount', 50);

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['update_per_order_amount'])) {
        // Update per-order amount setting
        $new_amount = (float)$_POST['per_order_amount'];
        if ($new_amount > 0) {
            if ($setting_model->updateSetting('per_order_amount', $new_amount)) {
                setFlashMessage('success', 'Per-order amount updated successfully.');
                $per_order_amount = $new_amount;
            } else {
                setFlashMessage('error', 'Failed to update per-order amount.');
            }
        } else {
            setFlashMessage('error', 'Per-order amount must be greater than zero.');
        }
    } elseif (isset($_POST['upload_daily_orders'])) {
        // Handle file upload
        if (isset($_FILES['daily_orders_file']) && $_FILES['daily_orders_file']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['daily_orders_file'];
            $file_name = $file['name'];
            $file_tmp = $file['tmp_name'];
            $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
            
            // Get company and store IDs
            $company_id = isset($_POST['company_id']) ? (int)$_POST['company_id'] : 0;
            $store_id = isset($_POST['store_id']) ? (int)$_POST['store_id'] : 0;
            
            if ($company_id <= 0) {
                setFlashMessage('error', 'Please select a company.');
                redirect('admin/upload_daily_orders.php');
            }
            
            // Check if file is a valid format (CSV or Excel)
            if (in_array($file_ext, ['csv', 'xlsx', 'xls'])) {
                // Create upload directory if it doesn't exist
                $upload_dir = '../uploads/daily_orders/';
                if (!is_dir($upload_dir)) {
                    if (!mkdir($upload_dir, 0777, true)) {
                        setFlashMessage('error', 'Failed to create upload directory.');
                        redirect('admin/upload_daily_orders.php');
                    }
                }
                
                // Generate unique filename
                $new_file_name = 'daily_orders_' . date('Y-m-d_His') . '.' . $file_ext;
                $upload_path = $upload_dir . $new_file_name;
                
                if (move_uploaded_file($file_tmp, $upload_path)) {
                    // Process the uploaded file
                    $order_date = $_POST['order_date'];
                    $result = processDailyOrdersFile($upload_path, $file_ext, $order_date, $per_order_amount, $db, $company_id, $store_id);
                    
                    if ($result['success']) {
                        setFlashMessage('success', $result['message']);
                    } else {
                        setFlashMessage('error', $result['message']);
                    }
                } else {
                    setFlashMessage('error', 'Failed to upload file.');
                }
            } else {
                setFlashMessage('error', 'Invalid file format. Please upload a CSV or Excel file.');
            }
        } else {
            setFlashMessage('error', 'Please select a file to upload.');
        }
    }
    
    redirect('admin/upload_daily_orders.php');
}

// Get all riders for reference
$riders = $rider_model->getAllRiders();

// Get recent daily order uploads
$daily_orders = $order_model->getDailyOrderUploads(10);

// Page title
$page_title = 'Upload Daily Orders';

// Include header
include '../includes/admin_header.php';

/**
 * Process the uploaded daily orders file
 * @param string $file_path - Path to the uploaded file
 * @param string $file_ext - File extension
 * @param string $order_date - Order date
 * @param float $per_order_amount - Amount per order
 * @param Database $db - Database connection
 * @param int $company_id - Company ID
 * @param int $store_id - Store ID (optional)
 * @return array - Result with success status and message
 */
function processDailyOrdersFile($file_path, $file_ext, $order_date, $per_order_amount, $db, $company_id, $store_id = 0) {
    // Check if daily_order_uploads table exists, if not create it
    $db->query("CREATE TABLE IF NOT EXISTS `daily_order_uploads` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `file_name` varchar(255) NOT NULL,
        `upload_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `order_date` date NOT NULL,
        `company_id` int(11) NOT NULL,
        `store_id` int(11) DEFAULT NULL,
        `total_riders` int(11) NOT NULL DEFAULT 0,
        `total_orders` int(11) NOT NULL DEFAULT 0,
        `status` varchar(20) NOT NULL DEFAULT 'processed',
        PRIMARY KEY (`id`),
        KEY `company_id` (`company_id`),
        KEY `store_id` (`store_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $db->execute();
    
    // Check if daily_rider_orders table exists, if not create it
    $db->query("CREATE TABLE IF NOT EXISTS `daily_rider_orders` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `upload_id` int(11) NOT NULL,
        `company_id` int(11) NOT NULL,
        `store_id` int(11) DEFAULT NULL,
        `rider_id` int(11) NOT NULL,
        `rider_name` varchar(255) NOT NULL,
        `company_rider_id` varchar(50) DEFAULT NULL,
        `order_count` int(11) NOT NULL DEFAULT 0,
        `per_order_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
        `total_earning` decimal(10,2) NOT NULL DEFAULT 0.00,
        `order_date` date NOT NULL,
        `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        KEY `upload_id` (`upload_id`),
        KEY `company_id` (`company_id`),
        KEY `store_id` (`store_id`),
        KEY `rider_id` (`rider_id`),
        KEY `company_rider_id` (`company_rider_id`),
        KEY `order_date` (`order_date`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $db->execute();
    
    // Add company_rider_id column if it doesn't exist
    $db->query("SHOW COLUMNS FROM `daily_rider_orders` LIKE 'company_rider_id'");
    if ($db->single() === false) {
        $db->query("ALTER TABLE `daily_rider_orders` ADD COLUMN `company_rider_id` varchar(50) DEFAULT NULL AFTER `rider_name`, ADD INDEX `company_rider_id` (`company_rider_id`)");
        $db->execute();
    }
    
    try {
        // Load the file based on extension
        require_once '../vendor1/autoload.php';
        
        if ($file_ext === 'csv') {
            $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Csv');
        } else {
            $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
        }
        
        $spreadsheet = $reader->load($file_path);
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();
        
        // Validate file structure (should have at least rider name and order count columns)
        if (count($rows) < 2) {
            return [
                'success' => false,
                'message' => 'File does not contain enough data. Please check the file format.'
            ];
        }
        
        // Get column headers
        $headers = $rows[0];
        
        // Find company_rider_id, rider name, and order count columns
        $company_rider_id_col = -1;
        $rider_name_col = -1;
        $order_count_col = -1;
        foreach ($headers as $index => $header) {
            $header_lower = strtolower(trim($header));
            if (strpos($header_lower, 'company_rider_id') !== false || strpos($header_lower, 'company rider id') !== false) {
                $company_rider_id_col = $index;
            } elseif (strpos($header_lower, 'rider') !== false && strpos($header_lower, 'name') !== false) {
                $rider_name_col = $index;
            } elseif (strpos($header_lower, 'order') !== false || strpos($header_lower, 'count') !== false) {
                $order_count_col = $index;
            }
        }
        if ($company_rider_id_col === -1 || $order_count_col === -1) {
            return [
                'success' => false,
                'message' => 'Could not identify company_rider_id or order count columns. Please check the file format.'
            ];
        }
        
        // Start transaction
        $db->beginTransaction();
        
        // Create upload record
        $db->query("INSERT INTO daily_order_uploads (file_name, order_date, upload_date, company_id, store_id) 
                    VALUES (:file_name, :order_date, NOW(), :company_id, :store_id)");
        $db->bind(':file_name', basename($file_path));
        $db->bind(':order_date', $order_date);
        $db->bind(':company_id', $company_id);
        $db->bind(':store_id', $store_id > 0 ? $store_id : null);
        $db->execute();
        
        $upload_id = $db->lastInsertId();
        
        // Process each row
        $total_riders = 0;
        $total_orders = 0;
        $rider_model = new Rider($db);
        $all_riders = $rider_model->getAllRiders();
        
        // Create a map of rider names to IDs for easier matching
        $rider_map = [];
        foreach ($all_riders as $rider) {
            $normalized_full_name = strtolower(trim(preg_replace('/\s+/', ' ', $rider['full_name'])));
            $rider_map[$normalized_full_name] = $rider['id'];
            // Also map first name
            $name_parts = explode(' ', $rider['full_name']);
            if (!empty($name_parts[0])) {
                $normalized_first_name = strtolower(trim($name_parts[0]));
                $rider_map[$normalized_first_name] = $rider['id'];
            }
        }
        
        // Skip header row
        for ($i = 1; $i < count($rows); $i++) {
            $row = $rows[$i];
            
            // Skip empty rows
            if (empty($row[$company_rider_id_col]) || empty($row[$order_count_col])) {
                continue;
            }
            
            $company_rider_id = trim($row[$company_rider_id_col]);
            $order_count = (int)$row[$order_count_col];
            $rider_name = $rider_name_col !== -1 ? trim($row[$rider_name_col]) : '';
            
            if ($order_count <= 0) {
                continue; // Skip rows with zero or negative order counts
            }
            
            // Strict matching: Only assign a rider if company_rider_id matches exactly in rider_assignments for the company. No fallback to name or any other logic.
            $rider_id = 0;
            $company_rider_id_str = trim((string)$company_rider_id);
            if (!empty($company_rider_id_str)) {
                $db->query("SELECT ra.rider_id FROM rider_assignments ra WHERE TRIM(ra.company_rider_id) = :company_rider_id AND ra.company_id = :company_id");
                $db->bind(':company_rider_id', $company_rider_id_str);
                $db->bind(':company_id', $company_id);
                $assignment = $db->single();
                if ($assignment) {
                    $rider_id = $assignment['rider_id'];
                }
            }
            
            // Only insert matched rows (rider_id > 0)
            if ($rider_id > 0) {
                // Calculate total earning
                $total_earning = $order_count * $per_order_amount;
                // Insert daily rider order record
                $db->query("INSERT INTO daily_rider_orders 
                            (upload_id, company_id, store_id, rider_id, rider_name, company_rider_id, order_count, per_order_amount, total_earning, order_date) 
                            VALUES 
                            (:upload_id, :company_id, :store_id, :rider_id, :rider_name, :company_rider_id, :order_count, :per_order_amount, :total_earning, :order_date)");
                $db->bind(':upload_id', $upload_id);
                $db->bind(':company_id', $company_id);
                $db->bind(':store_id', $store_id > 0 ? $store_id : null);
                $db->bind(':rider_id', $rider_id);
                $db->bind(':rider_name', $rider_name);
                $db->bind(':company_rider_id', $company_rider_id);
                $db->bind(':order_count', $order_count);
                $db->bind(':per_order_amount', $per_order_amount);
                $db->bind(':total_earning', $total_earning);
                $db->bind(':order_date', $order_date);
                $db->execute();
                $total_riders++;
                $total_orders += $order_count;
            }
        }
        
        // Update upload record with totals
        $db->query("UPDATE daily_order_uploads SET total_riders = :total_riders, total_orders = :total_orders WHERE id = :id");
        $db->bind(':total_riders', $total_riders);
        $db->bind(':total_orders', $total_orders);
        $db->bind(':id', $upload_id);
        $db->execute();
        
        // Commit transaction
        $db->commit();
        
        return [
            'success' => true,
            'message' => "Daily orders processed successfully. Found $total_riders riders with a total of $total_orders orders."
        ];
    } catch (Exception $e) {
        // Rollback transaction on error
        if ($db->inTransaction()) {
            $db->rollback();
        }
        
        error_log("Error processing daily orders file: " . $e->getMessage());
        
        return [
            'success' => false,
            'message' => "Error processing file: " . $e->getMessage()
        ];
    }
}
?>

<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Upload Daily Orders</h1>
    </div>

    <!-- Flash Messages -->
    <?php displayFlashMessages(); ?>

    <!-- Per-Order Amount Setting -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Per-Order Amount Setting</h6>
        </div>
        <div class="card-body">
            <form method="POST" class="form-inline">
                <div class="form-group mb-2 mr-2">
                    <label for="per_order_amount" class="sr-only">Per-Order Amount (₹)</label>
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text">₹</span>
                        </div>
                        <input type="number" class="form-control" id="per_order_amount" name="per_order_amount" value="<?= $per_order_amount ?>" min="1" step="0.01" required>
                    </div>
                </div>
                <button type="submit" name="update_per_order_amount" class="btn btn-primary mb-2">Update Amount</button>
            </form>
            <small class="form-text text-muted">
                This amount will be multiplied by the order count for each rider to calculate their daily earnings.
            </small>
        </div>
    </div>

    <!-- Upload Daily Orders Form -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Upload Daily Orders Report</h6>
        </div>
        <div class="card-body">
            <form method="POST" enctype="multipart/form-data">
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="order_date">Order Date</label>
                            <input type="date" class="form-control" id="order_date" name="order_date" value="<?= date('Y-m-d') ?>" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="company_id">Company</label>
                            <select class="form-control" id="company_id" name="company_id" required>
                                <option value="">Select Company</option>
                                <?php foreach ($companies as $company): ?>
                                    <option value="<?= $company['id'] ?>"><?= htmlspecialchars($company['company_name']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="store_id">Store (Optional)</label>
                            <div class="input-group">
                                <select class="form-control" id="store_id" name="store_id">
                                    <option value="">All Stores</option>
                                    <!-- Store options will be populated via JavaScript -->
                                </select>
                                <div class="input-group-append">
                                    <button type="button" class="btn btn-outline-secondary" id="refreshStores">
                                        <i class="fas fa-sync-alt"></i>
                                    </button>
                                </div>
                            </div>
                            <small class="form-text text-muted">
                                If stores don't load, click the refresh button.
                            </small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="daily_orders_file">Daily Orders File (CSV/Excel)</label>
                            <input type="file" class="form-control" id="daily_orders_file" name="daily_orders_file" accept=".csv,.xlsx,.xls" required>
                            <small class="form-text text-muted">
                                File should contain at least two columns: Rider Name and Order Count.
                            </small>
                        </div>
                    </div>
                </div>
                <button type="submit" name="upload_daily_orders" class="btn btn-success">
                    <i class="fas fa-upload"></i> Upload and Process
                </button>
            </form>
        </div>
    </div>

    <!-- Recent Uploads Table -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Recent Daily Order Uploads</h6>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>File Name</th>
                            <th>Order Date</th>
                            <th>Upload Date</th>
                            <th>Total Riders</th>
                            <th>Total Orders</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($daily_orders)): ?>
                            <tr>
                                <td colspan="8" class="text-center">No daily order uploads found</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($daily_orders as $upload): ?>
                                <tr>
                                    <td><?= $upload['id'] ?></td>
                                    <td><?= htmlspecialchars($upload['file_name']) ?></td>
                                    <td><?= date('Y-m-d', strtotime($upload['order_date'])) ?></td>
                                    <td><?= date('Y-m-d H:i', strtotime($upload['upload_date'])) ?></td>
                                    <td><?= $upload['total_riders'] ?></td>
                                    <td><?= $upload['total_orders'] ?></td>
                                    <td>
                                        <span class="badge badge-<?= $upload['status'] === 'processed' ? 'success' : 'warning' ?>">
                                            <?= ucfirst($upload['status']) ?>
                                        </span>
                                    </td>
                                    <td>
                                        <a href="view_daily_orders.php?id=<?= $upload['id'] ?>" class="btn btn-sm btn-primary">
                                            <i class="fas fa-eye"></i> View Details
                                        </a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script src="js/upload_daily_orders.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DataTable
    $('#dataTable').DataTable();
    
    // Store data for all companies and their stores
    const companiesData = <?= json_encode($companies) ?>;
    
    // Debug companies data
    console.log('Companies data:', companiesData);
    
    // Test API endpoint directly
    console.log('Testing API endpoint directly...');
    const testCompanyId = companiesData.length > 0 ? companiesData[0].id : null;
    
    if (testCompanyId) {
        console.log(`Testing with company ID: ${testCompanyId}`);
        $.ajax({
            url: `../api/get_company_stores.php?company_id=${testCompanyId}`,
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                console.log('Direct API test response:', data);
            },
            error: function(xhr, status, error) {
                console.error('Direct API test error:', error);
                console.error('Response:', xhr.responseText);
            }
        });
    }
    
    // Handle company selection change
    const companySelect = document.getElementById('company_id');
    const storeSelect = document.getElementById('store_id');
    const refreshButton = document.getElementById('refreshStores');
    
    // Function to load stores for a company
    function loadStoresForCompany(companyId) {
        // Clear store options
        storeSelect.innerHTML = '<option value="">All Stores</option>';
        
        const selectedCompanyId = parseInt(this.value);
        console.log('Selected company ID:', selectedCompanyId);
        
        if (!selectedCompanyId) {
            console.log('No company selected, returning');
            return;
        }
        
        // Show loading indicator
        const loadingOption = document.createElement('option');
        loadingOption.textContent = 'Loading stores...';
        loadingOption.disabled = true;
        loadingOption.selected = true;
        storeSelect.appendChild(loadingOption);
        
        // Fetch stores from API
        const apiUrl = `../api/get_company_stores.php?company_id=${selectedCompanyId}`;
        console.log('Fetching stores from:', apiUrl);
        
        fetch(apiUrl)
            .then(response => {
                console.log('API response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('API response data:', data);
                
                // Remove loading indicator
                storeSelect.removeChild(loadingOption);
                
                if (data.status === 'success' && data.stores && data.stores.length > 0) {
                    console.log(`Found ${data.stores.length} stores for company ${selectedCompanyId}`);
                    
                    // Add store options from API
                    data.stores.forEach(store => {
                        console.log('Adding store:', store);
                        const option = document.createElement('option');
                        option.value = store.id;
                        option.textContent = store.store_name;
                        storeSelect.appendChild(option);
                    });
                } else {
                    console.log('No stores returned from API for company:', selectedCompanyId);
                    
                    // Add a "No stores found" option
                    const noStoresOption = document.createElement('option');
                    noStoresOption.textContent = 'No stores found';
                    noStoresOption.disabled = true;
                    storeSelect.appendChild(noStoresOption);
                }
            })
            .catch(error => {
                console.error('Error fetching stores:', error);
                
                // Remove loading indicator
                if (storeSelect.contains(loadingOption)) {
                    storeSelect.removeChild(loadingOption);
                }
                
                // Add an error option
                const errorOption = document.createElement('option');
                errorOption.textContent = 'Error loading stores';
                errorOption.disabled = true;
                storeSelect.appendChild(errorOption);
            });
    });
});
</script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Get the company and store select elements
    const companySelect = document.getElementById('company_id');
    const storeSelect = document.getElementById('store_id');
    const refreshButton = document.getElementById('refreshStores');
    
    // Function to load stores for a company
    function loadStoresForCompany(companyId) {
        // Clear store options
        storeSelect.innerHTML = '<option value="">All Stores</option>';
        
        if (!companyId) {
            return;
        }
        
        // Show loading indicator
        const loadingOption = document.createElement('option');
        loadingOption.textContent = 'Loading stores...';
        loadingOption.disabled = true;
        loadingOption.selected = true;
        storeSelect.appendChild(loadingOption);
        
        // Fetch stores from API
        fetch(`../api/get_company_stores.php?company_id=${companyId}`)
            .then(response => response.json())
            .then(data => {
                // Remove loading indicator
                storeSelect.removeChild(loadingOption);
                
                if (data.status === 'success' && data.stores && data.stores.length > 0) {
                    // Add store options from API
                    data.stores.forEach(store => {
                        const option = document.createElement('option');
                        option.value = store.id;
                        option.textContent = store.store_name;
                        storeSelect.appendChild(option);
                    });
                } else {
                    // Add a "No stores found" option
                    const noStoresOption = document.createElement('option');
                    noStoresOption.textContent = 'No stores found';
                    noStoresOption.disabled = true;
                    storeSelect.appendChild(noStoresOption);
                }
            })
            .catch(error => {
                console.error('Error fetching stores:', error);
                
                // Remove loading indicator
                if (storeSelect.contains(loadingOption)) {
                    storeSelect.removeChild(loadingOption);
                }
                
                // Add an error option
                const errorOption = document.createElement('option');
                errorOption.textContent = 'Error loading stores';
                errorOption.disabled = true;
                storeSelect.appendChild(errorOption);
            });
    }
    
    // Event listener for company select change
    companySelect.addEventListener('change', function() {
        const selectedCompanyId = parseInt(this.value);
        loadStoresForCompany(selectedCompanyId);
    });
    
    // Event listener for refresh button
    refreshButton.addEventListener('click', function() {
        const selectedCompanyId = parseInt(companySelect.value);
        if (selectedCompanyId) {
            loadStoresForCompany(selectedCompanyId);
        } else {
            alert('Please select a company first');
        }
    });
});
</script>

<?php include '../includes/admin_footer.php'; ?>
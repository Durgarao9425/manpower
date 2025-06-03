<?php
/**
 * Admin  Payments Management
 */

// Include initialization file
require_once '../includes/init.php';

// Check if user is logged in and is a admin
if (!$auth->isLoggedIn() || $_SESSION['user_type'] !== USER_ADMIN) {
    redirect('../login.php');
}

// Get current user
$user = $auth->getCurrentUser();

// Check page-level permission for this admin
if (!has_permission($db, $user['id'], 'upload_order_statement.php', 'view')) {
    include_once '../includes/admin_header.php';
    echo '<div class="container mt-5"><div class="alert alert-danger text-center" style="max-width:600px;margin:auto;"><h4 class="mb-3"><i class="fas fa-exclamation-triangle"></i> Access Denied</h4><p>You do not have permission to view this page.</p></div></div>';
    include_once '../includes/admin_footer.php';
    exit;
}

// Initialize models
$company_model = new Company($db);
$payment_model = new Payment($db);
$order_model = new Order($db);

// Get all active companies for dropdown
$companies = $company_model->getActiveCompanies();

// Get filter parameters
$status = isset($_GET['status']) ? sanitize($_GET['status']) : '';
$start_date = isset($_GET['start_date']) ? sanitize($_GET['start_date']) : date('Y-m-d', strtotime('-30 days'));
$end_date = isset($_GET['end_date']) ? sanitize($_GET['end_date']) : date('Y-m-d');
$selected_company_id = isset($_GET['company_id']) ? (int)sanitize($_GET['company_id']) : (isset($companies[0]) ? $companies[0]['id'] : 0);

// Get payments for the selected company
$payments = $payment_model->getCompanyPayments($selected_company_id, $status, $start_date, $end_date);

// Process form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'upload_file':
                // Handle file upload
                if (isset($_FILES['payment_file']) && $_FILES['payment_file']['error'] === UPLOAD_ERR_OK) {
                    $file = $_FILES['payment_file'];
                    $file_name = $file['name'];
                    $file_tmp = $file['tmp_name'];
                    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
                    
                    // Debug file upload
                    error_log("File upload: " . json_encode($_FILES['payment_file']));
                    
                    // Check if file is an Excel file
                    if ($file_ext === 'xlsx' || $file_ext === 'xls' || $file_ext === 'csv') {
                        // Create upload directory if it doesn't exist
                        $upload_dir = '../uploads/payments/';
                        if (!is_dir($upload_dir)) {
                            if (!mkdir($upload_dir, 0777, true)) {
                                error_log("Failed to create directory: $upload_dir");
                                $_SESSION['error_message'] = 'Failed to create upload directory.';
                                header('Location: ' . APP_URL . '/admin/update_payments.php');
                                exit;
                            }
                        }
                        
                        // Check if directory is writable
                        if (!is_writable($upload_dir)) {
                            error_log("Directory not writable: $upload_dir");
                            $_SESSION['error_message'] = 'Upload directory is not writable.';
                            header('Location: ' . APP_URL . '/admin/update_payments.php');
                            exit;
                        }
                        
                        // Generate unique filename
                        $selected_company_id = sanitize($_POST['company_id']);
                        $new_file_name = 'payment_' . $selected_company_id . '_' . date('YmdHis') . '.' . $file_ext;
                        $upload_path = $upload_dir . $new_file_name;
                        
                        if (move_uploaded_file($file_tmp, $upload_path)) {
                            // Verify file was uploaded
                            if (!file_exists($upload_path)) {
                                error_log("File not found after upload: $upload_path");
                                $_SESSION['error_message'] = 'File upload verification failed.';
                                header('Location: ' . APP_URL . '/admin/update_payments.php');
                                exit;
                            }
                            
                            // Make sure the uploads/payments directory exists
                            $upload_dir = '../uploads/payments/';
                            if (!is_dir($upload_dir)) {
                                if (!mkdir($upload_dir, 0777, true)) {
                                    error_log("Failed to create uploads/payments directory");
                                    $_SESSION['error_message'] = 'Failed to create upload directory. Please contact support.';
                                    redirect('payments.php');
                                }
                            }
                            
                            // Create payment record with simplified approach
                            try {
                                // First, check if the company_payments table exists and has the required columns
                                try {
                                    $db->query("DESCRIBE company_payments");
                                    $columns = $db->resultSet();
                                    
                                    // Create a list of existing columns
                                    $existing_columns = [];
                                    foreach ($columns as $column) {
                                        $existing_columns[] = $column['Field'];
                                    }
                                    
                                    // Define the required columns
                                    $required_columns = ['company_id', 'payment_date', 'start_date', 'end_date', 
                                                        'amount', 'status', 'file_path', 'notes', 'mapping_status'];
                                    
                                    // Check if all required columns exist
                                    $missing_columns = array_diff($required_columns, $existing_columns);
                                    
                                    // If any required column is missing, fix it directly
                                    if (!empty($missing_columns)) {
                                        error_log("Missing columns in company_payments table: " . implode(', ', $missing_columns));
                                        
                                        // Add each missing column
                                        foreach ($missing_columns as $column) {
                                            try {
                                                switch ($column) {
                                                    case 'start_date':
                                                        $db->query("ALTER TABLE company_payments ADD COLUMN start_date date NOT NULL DEFAULT CURRENT_DATE AFTER payment_date");
                                                        break;
                                                    case 'end_date':
                                                        $db->query("ALTER TABLE company_payments ADD COLUMN end_date date NOT NULL DEFAULT CURRENT_DATE AFTER start_date");
                                                        break;
                                                    case 'amount':
                                                        $db->query("ALTER TABLE company_payments ADD COLUMN amount decimal(10,2) NOT NULL DEFAULT 0.00 AFTER end_date");
                                                        break;
                                                    case 'status':
                                                        $db->query("ALTER TABLE company_payments ADD COLUMN status varchar(20) NOT NULL DEFAULT 'pending' AFTER amount");
                                                        break;
                                                    case 'file_path':
                                                        $db->query("ALTER TABLE company_payments ADD COLUMN file_path varchar(255) NOT NULL DEFAULT '' AFTER status");
                                                        break;
                                                    case 'notes':
                                                        $db->query("ALTER TABLE company_payments ADD COLUMN notes text DEFAULT NULL AFTER file_path");
                                                        break;
                                                    case 'mapping_status':
                                                        $db->query("ALTER TABLE company_payments ADD COLUMN mapping_status varchar(20) DEFAULT 'unmapped' AFTER notes");
                                                        break;
                                                }
                                                
                                                $db->execute();
                                                error_log("Added missing column: " . $column);
                                            } catch (Exception $e) {
                                                error_log("Error adding column " . $column . ": " . $e->getMessage());
                                            }
                                        }
                                    }
                                } catch (Exception $e) {
                                    // Table doesn't exist or other error
                                    error_log("Error checking company_payments table: " . $e->getMessage());
                                    
                                    // Create the table
                                    try {
                                        $db->query("CREATE TABLE IF NOT EXISTS `company_payments` (
                                            `id` int(11) NOT NULL AUTO_INCREMENT,
                                            `company_id` int(11) NOT NULL,
                                            `payment_date` date NOT NULL,
                                            `start_date` date NOT NULL,
                                            `end_date` date NOT NULL,
                                            `amount` decimal(10,2) NOT NULL,
                                            `status` varchar(20) NOT NULL DEFAULT 'pending',
                                            `file_path` varchar(255) NOT NULL,
                                            `notes` text DEFAULT NULL,
                                            `mapping_status` varchar(20) DEFAULT 'unmapped',
                                            `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
                                            `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                                            PRIMARY KEY (`id`),
                                            KEY `company_id` (`company_id`)
                                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                                        
                                        $db->execute();
                                        error_log("Created company_payments table");
                                        
                                        // Also create the payment_file_headers table if it doesn't exist
                                        $db->query("CREATE TABLE IF NOT EXISTS `payment_file_headers` (
                                            `id` int(11) NOT NULL AUTO_INCREMENT,
                                            `payment_id` int(11) NOT NULL,
                                            `headers` text NOT NULL,
                                            `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
                                            PRIMARY KEY (`id`),
                                            KEY `payment_id` (`payment_id`)
                                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                                        $db->execute();
                                        
                                        // Also create the payment_field_mappings table if it doesn't exist
                                        $db->query("CREATE TABLE IF NOT EXISTS `payment_field_mappings` (
                                            `id` int(11) NOT NULL AUTO_INCREMENT,
                                            `payment_id` int(11) NOT NULL,
                                            `company_column` varchar(255) NOT NULL,
                                            `system_field` varchar(255) NOT NULL,
                                            `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
                                            PRIMARY KEY (`id`),
                                            KEY `payment_id` (`payment_id`)
                                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                                        $db->execute();
                                    } catch (Exception $e) {
                                        error_log("Error creating database tables: " . $e->getMessage());
                                        $_SESSION['error_message'] = 'Failed to create database structure. Please contact support.';
                                        redirect('dashboard.php');
                                    }
                                }
                                
                                // Direct database insertion to avoid model issues
                                $db->query("INSERT INTO company_payments 
                                    (company_id, payment_date, start_date, end_date, amount, status, file_path, notes, mapping_status) 
                                    VALUES (:company_id, :payment_date, :start_date, :end_date, :amount, :status, :file_path, :notes, :mapping_status)");
                                
                                $db->bind(':company_id', $selected_company_id);
                                $db->bind(':payment_date', date('Y-m-d'));
                                $db->bind(':start_date', sanitize($_POST['start_date']));
                                $db->bind(':end_date', sanitize($_POST['end_date']));
                                $db->bind(':amount', sanitize($_POST['amount']));
                                $db->bind(':status', 'pending');
                                $db->bind(':file_path', $new_file_name);
                                $db->bind(':notes', sanitize($_POST['notes']));
                                $db->bind(':mapping_status', 'unmapped');
                                
                                try {
                                    // Debug the query and parameters
                                    error_log("SQL Query: INSERT INTO company_payments (company_id, payment_date, start_date, end_date, amount, status, file_path, notes, mapping_status) VALUES (:company_id, :payment_date, :start_date, :end_date, :amount, :status, :file_path, :notes, :mapping_status)");
                                    error_log("Parameters: company_id=" . $selected_company_id . 
                                              ", payment_date=" . date('Y-m-d') . 
                                              ", start_date=" . sanitize($_POST['start_date']) . 
                                              ", end_date=" . sanitize($_POST['end_date']) . 
                                              ", amount=" . sanitize($_POST['amount']) . 
                                              ", status=pending" . 
                                              ", file_path=" . $new_file_name . 
                                              ", notes=" . sanitize($_POST['notes']) . 
                                              ", mapping_status=unmapped");
                                    
                                    if ($db->execute()) {
                                        $payment_id = $db->lastInsertId();
                                        error_log("Payment record created successfully with ID: " . $payment_id);
                                        $_SESSION['success_message'] = 'Payment file uploaded successfully. <a href="map_order_statement.php?id=' . $payment_id . '" class="alert-link">Click here to map the fields</a>.';
                                        
                                        // Try to extract column headers for admin reference
                                        try {
                                            $headers = [];
                                            if ($file_ext === 'csv') {
                                                // Read CSV headers
                                                if (($handle = fopen($upload_path, "r")) !== FALSE) {
                                                    if (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                                                        $headers = $data;
                                                        error_log("CSV Headers extracted: " . json_encode($headers));
                                                    }
                                                    fclose($handle);
                                                }
                                            } elseif ($file_ext === 'xlsx' || $file_ext === 'xls') {
                                                // Try to use PhpSpreadsheet if available
                                                if (file_exists('../vendor/autoload.php')) {
                                                    require_once '../vendor/autoload.php';
                                                    
                                                    try {
                                                        $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReaderForFile($upload_path);
                                                        $reader->setReadDataOnly(true);
                                                        $spreadsheet = $reader->load($upload_path);
                                                        $worksheet = $spreadsheet->getActiveSheet();
                                                        
                                                        // Get the first row (headers)
                                                        $highestColumn = $worksheet->getHighestColumn();
                                                        $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);
                                                        
                                                        $headers = [];
                                                        for ($col = 1; $col <= $highestColumnIndex; $col++) {
                                                            $cellCoord = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . '1';
                                            $value = $worksheet->getCell($cellCoord)->getValue();
                                                            if ($value !== null) {
                                                                $headers[] = (string)$value;
                                                            } else {
                                                                $headers[] = "Column " . $col;
                                                            }
                                                        }
                                                        error_log("Excel headers extracted: " . json_encode($headers));
                                                    } catch (Exception $e) {
                                                        error_log("Error reading Excel file: " . $e->getMessage());
                                                        $headers = ['Error reading Excel file - please check the file format'];
                                                    }
                                                } else {
                                                    // PhpSpreadsheet not available
                                                    $headers = ['Excel file - PhpSpreadsheet not installed'];
                                                    error_log("PhpSpreadsheet not installed, cannot extract Excel headers");
                                                }
                                            }
                                            
                                            // Store headers in a separate table for admin reference
                                            if (!empty($headers)) {
                                                // Check if the table exists
                                                $db->query("SHOW TABLES LIKE 'payment_file_headers'");
                                                $headers_table_exists = $db->resultSet();
                                                
                                                if (empty($headers_table_exists)) {
                                                    // Create the table
                                                    error_log("Creating payment_file_headers table");
                                                    $db->query("CREATE TABLE IF NOT EXISTS `payment_file_headers` (
                                                        `id` int(11) NOT NULL AUTO_INCREMENT,
                                                        `payment_id` int(11) NOT NULL,
                                                        `headers` text NOT NULL,
                                                        `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
                                                        PRIMARY KEY (`id`),
                                                        KEY `payment_id` (`payment_id`)
                                                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                                                    $db->execute();
                                                }
                                                
                                                // Insert headers
                                                $db->query("INSERT INTO payment_file_headers (payment_id, headers) VALUES (:payment_id, :headers)");
                                                $db->bind(':payment_id', $payment_id);
                                                $db->bind(':headers', json_encode($headers));
                                                
                                                if ($db->execute()) {
                                                    error_log("Headers stored successfully for payment ID: " . $payment_id);
                                                } else {
                                                    error_log("Failed to store headers for payment ID: " . $payment_id);
                                                }
                                            }
                                        } catch (Exception $e) {
                                            // Just log the error, don't stop the process
                                            error_log("Error extracting headers: " . $e->getMessage() . "\n" . $e->getTraceAsString());
                                        }
                                    } else {
                                        // Try to get more detailed error information
                                        $errorInfo = method_exists($db, 'errorInfo') ? print_r($db->errorInfo(), true) : 'No error info available';
                                        error_log("Failed to insert payment record. Error info: " . $errorInfo);
                                        $_SESSION['error_message'] = 'Failed to create payment record in database. Please check the error log for details.';
                                    }
                                } catch (Exception $e) {
                                    error_log("Exception during execute: " . $e->getMessage() . "\n" . $e->getTraceAsString());
                                    $_SESSION['error_message'] = 'Database error during execution: ' . $e->getMessage();
                                }
                            } catch (Exception $e) {
                                error_log("Exception in payment upload: " . $e->getMessage());
                                $_SESSION['error_message'] = 'Database error: ' . $e->getMessage();
                            }
                        } else {
                            $upload_error = error_get_last();
                            error_log("Failed to move uploaded file. Error: " . ($upload_error ? $upload_error['message'] : 'Unknown error'));
                            $_SESSION['error_message'] = 'Failed to move uploaded file to destination.';
                        }
                    } else {
                        $_SESSION['error_message'] = 'Invalid file format. Please upload an Excel or CSV file.';
                    }
                } else {
                    $error_message = 'Please select a file to upload.';
                    
                    // Provide more detailed error message based on the error code
                    if (isset($_FILES['payment_file'])) {
                        switch ($_FILES['payment_file']['error']) {
                            case UPLOAD_ERR_INI_SIZE:
                                $error_message = 'The uploaded file exceeds the upload_max_filesize directive in php.ini.';
                                break;
                            case UPLOAD_ERR_FORM_SIZE:
                                $error_message = 'The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form.';
                                break;
                            case UPLOAD_ERR_PARTIAL:
                                $error_message = 'The uploaded file was only partially uploaded.';
                                break;
                            case UPLOAD_ERR_NO_FILE:
                                $error_message = 'No file was uploaded.';
                                break;
                            case UPLOAD_ERR_NO_TMP_DIR:
                                $error_message = 'Missing a temporary folder.';
                                break;
                            case UPLOAD_ERR_CANT_WRITE:
                                $error_message = 'Failed to write file to disk.';
                                break;
                            case UPLOAD_ERR_EXTENSION:
                                $error_message = 'A PHP extension stopped the file upload.';
                                break;
                        }
                    }
                    
                    error_log("File upload error: " . $error_message);
                    $_SESSION['error_message'] = $error_message;
                }
                break;
                
            case 'update_status':
                $payment_id = sanitize($_POST['payment_id']);
                $status = sanitize($_POST['status']);
                
                $result = $payment_model->updatePaymentStatus($payment_id, $status);
                
                if ($result) {
                    $_SESSION['success_message'] = 'Payment status updated successfully.';
                } else {
                    $_SESSION['error_message'] = 'Failed to update payment status.';
                }
                break;
        }
        
        // Redirect to avoid form resubmission - use the correct path
        header('Location: ' . APP_URL . '/admin/upload_order_statement.php');
        exit;
    }
}

// Get weekly order summary for the payment form using month-based weeks
// Include the WeeklySummary model if not already included
if (!class_exists('WeeklySummary')) {
    require_once '../models/WeeklySummary.php';
}
$weekly_summary_model = new WeeklySummary($db);
$week_dates = $weekly_summary_model->getCurrentWeekDates(date('Y-m-d'));
$current_week_start = $week_dates['start_date'];
$current_week_end = $week_dates['end_date'];
$weekly_summary = $order_model->getWeeklySummary($selected_company_id, $current_week_start, $current_week_end);

$page_title = 'Upload Order Statement';

// Custom CSS for this page
$extra_css = '
<style>
    .payment-card {
        transition: transform 0.2s;
    }
    .payment-card:hover {
        transform: translateY(-5px);
    }
    .payment-status {
        position: absolute;
        top: 10px;
        right: 10px;
    }
    .status-pending {
        background-color: #ffc107;
    }
    .status-processing {
        background-color: #17a2b8;
    }
    .status-completed {
        background-color: #28a745;
    }
    .status-rejected {
        background-color: #dc3545;
    }
</style>
';

    include '../includes/admin_header.php';
?>
<div class="container-fluid">
    <div class="row mb-4">
        <div class="col">
            <h2>Upload Order Statement</h2>
        </div>
        <div class="col text-end">
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#uploadPaymentModal">
                <i class="fas fa-upload"></i> Upload Order Statement
            </button>
            <a href="fix_db.php" class="btn btn-secondary ms-2">
                <i class="fas fa-database"></i> Fix Database
            </a>
        </div>
    </div>
    
    <!-- Filter Form -->
    <div class="card mb-4">
        <div class="card-body">
            <form method="GET" class="row g-3">
                <div class="col-md-3">
                    <label for="company_id" class="form-label">Company</label>
                    <select class="form-select" id="company_id" name="company_id">
                        <?php foreach ($companies as $company): ?>
                            <option value="<?php echo $company['id']; ?>" <?php echo $selected_company_id == $company['id'] ? 'selected' : ''; ?>>
                                <?php echo htmlspecialchars($company['company_name']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-2">
                    <label for="start_date" class="form-label">Start Date</label>
                    <input type="date" class="form-control" id="start_date" name="start_date" value="<?php echo $start_date; ?>">
                </div>
                <div class="col-md-2">
                    <label for="end_date" class="form-label">End Date</label>
                    <input type="date" class="form-control" id="end_date" name="end_date" value="<?php echo $end_date; ?>">
                </div>
                <div class="col-md-2">
                    <label for="status" class="form-label">Status</label>
                    <select class="form-select" id="status" name="status">
                        <option value="">All Statuses</option>
                        <option value="pending" <?php echo $status === 'pending' ? 'selected' : ''; ?>>Pending</option>
                        <option value="processing" <?php echo $status === 'processing' ? 'selected' : ''; ?>>Processing</option>
                        <option value="completed" <?php echo $status === 'completed' ? 'selected' : ''; ?>>Completed</option>
                        <option value="rejected" <?php echo $status === 'rejected' ? 'selected' : ''; ?>>Rejected</option>
                    </select>
                </div>
                <div class="col-md-3 d-flex align-items-end">
                    <button type="submit" class="btn btn-primary">Filter</button>
                    <a href="upload_order_statement.php" class="btn btn-secondary ms-2">Reset</a>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Weekly Summary Card -->
    <div class="card mb-4">
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
                <?php 
                // Determine which week of the month we're in
                $day_of_month = date('j', strtotime(date('Y-m-d')));
                $week_number = 0;
                
                if ($day_of_month >= 1 && $day_of_month <= 7) {
                    $week_number = 1;
                } else if ($day_of_month >= 8 && $day_of_month <= 14) {
                    $week_number = 2;
                } else if ($day_of_month >= 15 && $day_of_month <= 21) {
                    $week_number = 3;
                } else {
                    $week_number = 4;
                }
                
                echo "Week {$week_number} Summary (" . date('M d', strtotime($current_week_start)) . " - " . date('M d', strtotime($current_week_end)) . ")";
                ?>
            </h5>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h6 class="card-title">Total Orders</h6>
                            <h3 class="mb-0"><?php echo $weekly_summary['total_orders'] ?? 0; ?></h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h6 class="card-title">Total Riders</h6>
                            <h3 class="mb-0"><?php echo $weekly_summary['total_riders'] ?? 0; ?></h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h6 class="card-title">Total KMs</h6>
                            <h3 class="mb-0"><?php echo number_format($weekly_summary['total_km'] ?? 0, 2); ?></h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h6 class="card-title">Total Amount</h6>
                            <h3 class="mb-0">₹<?php echo number_format($weekly_summary['total_amount'] ?? 0, 2); ?></h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Payments List -->
    <div class="card">
        <div class="card-header bg-dark text-white">
            <h5 class="mb-0">Payment History</h5>
        </div>
        <div class="card-body">
            <?php if (empty($payments)): ?>
                <div class="alert alert-info">No payment records found.</div>
            <?php else: ?>
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Period</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Submitted</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($payments as $payment): ?>
                                <tr>
                                    <td><?php echo $payment['id']; ?></td>
                                    <td><?php echo date('M d', strtotime($payment['start_date'])); ?> - <?php echo date('M d', strtotime($payment['end_date'])); ?></td>
                                    <td>₹<?php echo number_format($payment['amount'], 2); ?></td>
                                    <td>
                                        <span class="badge status-<?php echo $payment['status']; ?>">
                                            <?php echo ucfirst($payment['status']); ?>
                                        </span>
                                    </td>
                                    <td><?php echo date('M d, Y', strtotime($payment['payment_date'])); ?></td>
                                    <td><?php echo date('M d, Y', strtotime($payment['updated_at'])); ?></td>
                                    <td>
                                        <button type="button" class="btn btn-sm btn-info" data-bs-toggle="modal" data-bs-target="#viewPaymentModal<?php echo $payment['id']; ?>">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <a href="map_order_statement.php?id=<?php echo $payment['id']; ?>" class="btn btn-sm btn-primary" title="Map Fields">
                                            <i class="fas fa-map-signs"></i>
                                        </a>
                                        <a href="publish_order_statement.php?id=<?php echo $payment['id']; ?>" class="btn btn-sm btn-success" title="Publish to Riders">
                                            <i class="fas fa-paper-plane"></i>
                                        </a>
                                        <?php if ($payment['status'] === 'pending'): ?>
                                            <button type="button" class="btn btn-sm btn-warning" data-bs-toggle="modal" data-bs-target="#updateStatusModal<?php echo $payment['id']; ?>">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        <?php endif; ?>
                                        <a href="../uploads/payments/<?php echo $payment['file_path']; ?>" class="btn btn-sm btn-secondary" download>
                                            <i class="fas fa-download"></i>
                                        </a>
                                    </td>
                                </tr>
                                
                                <!-- View Payment Modal -->
                                <div class="modal fade" id="viewPaymentModal<?php echo $payment['id']; ?>" tabindex="-1" aria-hidden="true">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title">Payment Details</h5>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <div class="modal-body">
                                                <div class="mb-3">
                                                    <strong>Payment ID:</strong> <?php echo $payment['id']; ?>
                                                </div>
                                                <div class="mb-3">
                                                    <strong>Period:</strong> <?php echo date('M d, Y', strtotime($payment['start_date'])); ?> - <?php echo date('M d, Y', strtotime($payment['end_date'])); ?>
                                                </div>
                                                <div class="mb-3">
                                                    <strong>Amount:</strong> $<?php echo number_format($payment['amount'], 2); ?>
                                                </div>
                                                <div class="mb-3">
                                                    <strong>Status:</strong> 
                                                    <span class="badge status-<?php echo $payment['status']; ?>">
                                                        <?php echo ucfirst($payment['status']); ?>
                                                    </span>
                                                </div>
                                                <div class="mb-3">
                                                    <strong>Submitted:</strong> <?php echo date('M d, Y', strtotime($payment['payment_date'])); ?>
                                                </div>
                                                <div class="mb-3">
                                                    <strong>Last Updated:</strong> <?php echo date('M d, Y', strtotime($payment['updated_at'])); ?>
                                                </div>
                                                <?php if (!empty($payment['notes'])): ?>
                                                <div class="mb-3">
                                                    <strong>Notes:</strong> <?php echo nl2br(htmlspecialchars($payment['notes'])); ?>
                                                </div>
                                                <?php endif; ?>
                                                <div class="mb-3">
                                                    <strong>File:</strong> 
                                                    <a href="../uploads/payments/<?php echo $payment['file_path']; ?>" download>
                                                        <?php echo $payment['file_path']; ?>
                                                    </a>
                                                </div>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Update Status Modal -->
                                <?php if ($payment['status'] === 'pending'): ?>
                                <div class="modal fade" id="updateStatusModal<?php echo $payment['id']; ?>" tabindex="-1" aria-hidden="true">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title">Update Payment Status</h5>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <form method="POST">
                                                <input type="hidden" name="action" value="update_status">
                                                <input type="hidden" name="payment_id" value="<?php echo $payment['id']; ?>">
                                                <div class="modal-body">
                                                    <div class="mb-3">
                                                        <label for="status<?php echo $payment['id']; ?>" class="form-label">Status</label>
                                                        <select class="form-select" id="status<?php echo $payment['id']; ?>" name="status">
                                                            <option value="pending" <?php echo $payment['status'] === 'pending' ? 'selected' : ''; ?>>Pending</option>
                                                            <option value="processing">Processing</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="rejected">Rejected</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                                    <button type="submit" class="btn btn-primary">Update Status</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <?php endif; ?>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </div>
    
    <!-- Upload Payment Modal -->
    <div class="modal fade" id="uploadPaymentModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Upload Order Statement</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form method="POST" enctype="multipart/form-data" action="upload_order_statement.php">
                    <input type="hidden" name="action" value="upload_file">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="company_id" class="form-label">Company</label>
                            <select class="form-select" id="company_id" name="company_id" required>
                                <?php foreach ($companies as $company): ?>
                                    <option value="<?php echo $company['id']; ?>" <?php echo $selected_company_id == $company['id'] ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($company['company_name']); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <div class="form-text">Select the company this payment statement belongs to.</div>
                        </div>
                        <div class="mb-3">
                            <label for="upload_start_date" class="form-label">Start Date</label>
                            <input type="date" class="form-control" id="upload_start_date" name="start_date" value="<?php echo $current_week_start; ?>" required>
                        </div>
                        <div class="mb-3">
                            <label for="upload_end_date" class="form-label">End Date</label>
                            <input type="date" class="form-control" id="upload_end_date" name="end_date" value="<?php echo $current_week_end; ?>" required>
                        </div>
                        <div class="mb-3">
                            <label for="upload_amount" class="form-label">Total Amount</label>
                            <div class="input-group">
                                <span class="input-group-text">₹</span>
                                <input type="number" step="0.01" class="form-control" id="upload_amount" name="amount" value="<?php echo number_format($weekly_summary['total_amount'] ?? 0, 2, '.', ''); ?>" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="payment_file" class="form-label">Payment File (Excel/CSV)</label>
                            <input type="file" class="form-control" id="payment_file" name="payment_file" accept=".xlsx,.xls,.csv" required>
                            <div class="form-text">Upload your company's order details for the selected period.</div>
                        </div>
                        <div class="mb-3">
                            <label for="upload_notes" class="form-label">Notes</label>
                            <textarea class="form-control" id="upload_notes" name="notes" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-primary">Upload Payment</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php
// Custom JS for this page
$extra_js = '
<script>
    $(document).ready(function() {
        // Initialize datepickers for filter form
        $("#start_date, #end_date").on("change", function() {
            const startDate = new Date($("#start_date").val());
            const endDate = new Date($("#end_date").val());
            
            if (startDate > endDate) {
                alert("End date must be after start date");
                $(this).val("");
            }
        });
        
        // Initialize datepickers for upload form
        $("#upload_start_date, #upload_end_date").on("change", function() {
            const startDate = new Date($("#upload_start_date").val());
            const endDate = new Date($("#upload_end_date").val());
            
            if (startDate > endDate) {
                alert("End date must be after start date");
                $(this).val("");
            }
        });
        
        // Form validation before submit
        $("form[enctype=\'multipart/form-data\']").on("submit", function(e) {
            const fileInput = $("#payment_file");
            if (fileInput.length && fileInput[0].files.length === 0) {
                e.preventDefault();
                alert("Please select a file to upload");
                return false;
            }
            
            const amountInput = $("#upload_amount");
            if (amountInput.length && (isNaN(amountInput.val()) || parseFloat(amountInput.val()) <= 0)) {
                e.preventDefault();
                alert("Please enter a valid amount");
                return false;
            }
            
            return true;
        });
    });
</script>
';

include '../includes/admin_footer.php';
?>
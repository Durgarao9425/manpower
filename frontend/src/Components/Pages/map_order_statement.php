<?php
/**
 * Admin - Map Order Statement Fields
 * This page allows admins to map fields from uploaded order statements to system fields
 * and control their visibility (show to riders, include in invoice, use for commission)
 */

// Include initialization file
require_once '../includes/init.php';

// Check if user is logged in and is an admin
if (!$auth->isLoggedIn() || $_SESSION['user_type'] !== USER_ADMIN) {
    redirect('../login.php');
}

// Get current user
$user = $auth->getCurrentUser();

// Initialize models
$payment_model = new Payment($db);
$company_model = new Company($db);
$field_mapping_model = new FieldMapping($db);

// Get payment ID from URL
$payment_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$payment_id) {
    $_SESSION['error_message'] = 'Invalid payment ID.';
    redirect('admin/upload_order_statement.php');
}

// Get payment data
$payment = $payment_model->getPaymentById($payment_id);

if (!$payment) {
    $_SESSION['error_message'] = 'Payment not found.';
    redirect('admin/upload_order_statement.php');
}

// Get company data
$company = $company_model->getCompanyById($payment['company_id']);

if (!$company) {
    $_SESSION['error_message'] = 'Company not found.';
    redirect('admin/upload_order_statement.php');
}

// Get file headers from database first
$headers = [];
$db->query("SELECT * FROM payment_file_headers WHERE payment_id = :payment_id");
$db->bind(':payment_id', $payment_id);
$headers_record = $db->single();

if ($headers_record && !empty($headers_record['headers'])) {
    $headers = json_decode($headers_record['headers'], true);
}

    // If no headers found, try to extract them from the file
    if (empty($headers)) {
        $file_path = '../uploads/payments/' . $payment['file_path'];
        if (file_exists($file_path)) {
            $file_ext = strtolower(pathinfo($payment['file_path'], PATHINFO_EXTENSION));
            
            if ($file_ext === 'csv') {
                // Read CSV headers
                if (($handle = fopen($file_path, "r")) !== FALSE) {
                    if (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                        $headers = array_map('trim', $data); // Trim whitespace from headers
                        error_log("CSV Headers extracted: " . json_encode($headers));
                    }
                    fclose($handle);
                }
            } elseif ($file_ext === 'xlsx' || $file_ext === 'xls') {
                // Try to use PhpSpreadsheet if available
                if (file_exists('../vendor/autoload.php')) {
                    require_once '../vendor/autoload.php';
                    
                    try {
                        $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReaderForFile($file_path);
                        $reader->setReadDataOnly(true);
                        $spreadsheet = $reader->load($file_path);
                        $worksheet = $spreadsheet->getActiveSheet();
                        
                        // Get the first row (headers)
                        $highestColumn = $worksheet->getHighestColumn();
                        $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);
                        
                        $headers = [];
                        for ($col = 1; $col <= $highestColumnIndex; $col++) {
                            $cellCoord = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . '1';
                            $value = trim($worksheet->getCell($cellCoord)->getValue());
                            if ($value !== null && $value !== '') {
                                $headers[] = $value;
                            } else {
                                $headers[] = "Column " . $col;
                            }
                        }
                        error_log("Excel headers extracted: " . json_encode($headers));
                    } catch (Exception $e) {
                        error_log("Error reading Excel file: " . $e->getMessage());
                    }
                }
            }
            
            // Store headers in database if found
            if (!empty($headers)) {
                try {
                    $db->query("INSERT INTO payment_file_headers (payment_id, headers) VALUES (:payment_id, :headers)
                               ON DUPLICATE KEY UPDATE headers = :headers");
                    $db->bind(':payment_id', $payment_id);
                    $db->bind(':headers', json_encode($headers));
                    $db->execute();
                    error_log("Headers stored in database for payment ID: " . $payment_id);
                } catch (Exception $e) {
                    error_log("Error storing headers in database: " . $e->getMessage());
                }
            }
        }
    }


// Get existing field mappings
$existing_mappings = [];
$db->query("SELECT * FROM field_mappings WHERE company_id = :company_id");
$db->bind(':company_id', $payment['company_id']);
$mappings = $db->resultSet();

foreach ($mappings as $mapping) {
    $existing_mappings[$mapping['company_field_name']] = [
        'id' => $mapping['id'],
        'supplier_field_name' => $mapping['supplier_field_name'],
        'field_type' => $mapping['field_type'],
        'show_to_rider' => $mapping['show_to_rider'],
        'show_in_invoice' => $mapping['show_in_invoice'],
        'count_for_commission' => $mapping['count_for_commission']
    ];
}

// Define system fields that can be mapped
$system_fields = $field_mapping_model->getSystemFields();

// Process form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'add_system_field') {
            // Add a new system field
            if (isset($_POST['field_key']) && isset($_POST['field_label']) && isset($_POST['field_type'])) {
                try {
                    $field_key = sanitize($_POST['field_key']);
                    $field_label = sanitize($_POST['field_label']);
                    $field_type = sanitize($_POST['field_type']);
                    
                    // Validate field key (alphanumeric with underscores only)
                    if (!preg_match('/^[a-z0-9_]+$/', $field_key)) {
                        $_SESSION['error_message'] = 'Field key must contain only lowercase letters, numbers, and underscores.';
                        redirect('admin/map_order_statement.php?id=' . $payment_id);
                    }
                    
                    // Add the field
                    $result = $field_mapping_model->addSystemField($field_key, $field_label, $field_type);
                    
                    if ($result) {
                        $_SESSION['success_message'] = 'System field added successfully: ' . $field_label;
                    } else {
                        $_SESSION['error_message'] = 'Failed to add system field.';
                    }
                } catch (Exception $e) {
                    error_log("Error adding system field: " . $e->getMessage());
                    $_SESSION['error_message'] = 'Error adding system field: ' . $e->getMessage();
                }
                
                // Redirect back to the same page
                redirect('admin/map_order_statement.php?id=' . $payment_id);
            }
        } elseif ($_POST['action'] === 'save_mappings') {
            // Begin transaction
            $db->beginTransaction();
            
            try {
                $success = true;
                $message = 'Field mappings saved successfully.';
                
                // Debug data
                error_log("POST data: " . print_r($_POST, true));
                error_log("Payment data: " . print_r($payment, true));
                
                foreach ($_POST['mappings'] as $company_field => $mapping) {
                    // Skip if no system field is selected
                    if (empty($mapping['system_field'])) {
                        continue;
                    }
                    
                    // Sanitize company_field to handle special characters
                    $company_field_sanitized = $company_field;
                    error_log("Processing company field: " . $company_field);
                    
                    $data = [
                        'company_id' => $payment['company_id'],
                        'supplier_field_name' => $mapping['system_field'],
                        'company_field_name' => $company_field_sanitized,
                        'field_type' => $mapping['field_type'],
                        'show_to_rider' => isset($mapping['show_to_rider']) ? 1 : 0,
                        'show_in_invoice' => isset($mapping['show_in_invoice']) ? 1 : 0,
                        'count_for_commission' => isset($mapping['count_for_commission']) ? 1 : 0
                    ];
                    
                    // Debug mapping data
                    error_log("Mapping data for " . $company_field . ": " . print_r($data, true));
                    
                    // Check if mapping already exists
                    if (isset($existing_mappings[$company_field])) {
                        // Update existing mapping
                        $data['id'] = $existing_mappings[$company_field]['id'];
                        $data['updated_by'] = $user['id'];
                        
                        error_log("Updating existing mapping for " . $company_field);
                        $result = $field_mapping_model->updateMapping($data);
                        error_log("Update result: " . ($result ? 'success' : 'failure'));
                        
                        if (!$result) {
                            $success = false;
                            $message = 'Failed to update field mapping for ' . $company_field;
                            break;
                        }
                    } else {
                        // Create new mapping
                        error_log("Creating new mapping for " . $company_field);
                        $result = $field_mapping_model->createMapping($data);
                        error_log("Create result: " . ($result ? 'success' : 'failure'));
                        
                        if (!$result) {
                            $success = false;
                            $message = 'Failed to create field mapping for ' . $company_field;
                            break;
                        }
                    }
                }
                
                if ($success) {
                    // Update payment mapping status
                    $db->query("UPDATE company_payments SET mapping_status = 'mapped' WHERE id = :payment_id");
                    $db->bind(':payment_id', $payment_id);
                    $db->execute();
                    
                    // Commit transaction
                    $db->commit();
                    
                    $_SESSION['success_message'] = $message;
                    // Redirect to mapped data preview page
                    redirect('admin/mapped_data_preview.php?id=' . $payment_id);
                } else {
                    // Rollback transaction
                    $db->rollback();
                    $_SESSION['error_message'] = $message;
                }
            } catch (Exception $e) {
                // Rollback transaction
                $db->rollback();
                
                error_log("Error saving mappings: " . $e->getMessage());
                $_SESSION['error_message'] = 'Failed to save mappings: ' . $e->getMessage();
            }
        } elseif ($_POST['action'] === 'fix_headers') {
            // Fix file path and extract headers
            try {
                // Step 1: Check if the file path is valid
                $file_path = '../uploads/payments/' . $payment['file_path'];
                $file_exists = file_exists($file_path);
                
                if (!$file_exists || $payment['file_path'] === 'path_to_uploaded_file.xlsx') {
                    // File doesn't exist or has a placeholder path
                    // Look for files in the uploads/payments directory
                    $upload_dir = '../uploads/payments/';
                    if (is_dir($upload_dir)) {
                        $files = scandir($upload_dir);
                        $payment_files = [];
                        foreach ($files as $file) {
                            if ($file != '.' && $file != '..' && strpos($file, 'payment_' . $payment['company_id']) === 0) {
                                $payment_files[] = $file;
                            }
                        }
                        
                        if (!empty($payment_files)) {
                            // Use the first matching file
                            $new_file_name = $payment_files[0];
                            
                            // Update file path in database
                            $db->query("UPDATE company_payments SET file_path = :file_path WHERE id = :id");
                            $db->bind(':file_path', $new_file_name);
                            $db->bind(':id', $payment_id);
                            $db->execute();
                            
                            $file_path = $upload_dir . $new_file_name;
                            $file_exists = true;
                        }
                    }
                }
                
                if ($file_exists) {
                    // Step 2: Extract headers from the file
                    $file_ext = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));
                    $headers = [];
                    
                    if ($file_ext === 'csv') {
                        // Read CSV headers
                        if (($handle = fopen($file_path, "r")) !== FALSE) {
                            if (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                                $headers = $data;
                            }
                            fclose($handle);
                        }
                    } elseif ($file_ext === 'xlsx' || $file_ext === 'xls') {
                        // Try to use PhpSpreadsheet if available
                        if (file_exists('../vendor/autoload.php')) {
                            require_once '../vendor/autoload.php';
                            
                            try {
                                $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReaderForFile($file_path);
                                $reader->setReadDataOnly(true);
                                $spreadsheet = $reader->load($file_path);
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
                            } catch (Exception $e) {
                                error_log("Error reading Excel file: " . $e->getMessage());
                                throw $e;
                            }
                        } else {
                            throw new Exception("PhpSpreadsheet not installed. Please install it to read Excel files.");
                        }
                    }
                    
                    // Step 3: Save headers to database
                    if (!empty($headers)) {
                        // Delete existing headers
                        $db->query("DELETE FROM payment_file_headers WHERE payment_id = :payment_id");
                        $db->bind(':payment_id', $payment_id);
                        $db->execute();
                        
                        // Insert new headers
                        $db->query("INSERT INTO payment_file_headers (payment_id, headers) VALUES (:payment_id, :headers)");
                        $db->bind(':payment_id', $payment_id);
                        $db->bind(':headers', json_encode($headers));
                        $db->execute();
                        
                        // Update mapping status
                        $db->query("UPDATE company_payments SET mapping_status = 'unmapped' WHERE id = :payment_id");
                        $db->bind(':payment_id', $payment_id);
                        $db->execute();
                        
                        // Check if we can auto-map fields based on previous mappings
                        $db->query("SELECT * FROM field_mappings WHERE company_id = :company_id");
                        $db->bind(':company_id', $payment['company_id']);
                        $previous_mappings = $db->resultSet();
                        
                        $auto_mapped = false;
                        if (!empty($previous_mappings)) {
                            $company_field_mappings = [];
                            foreach ($previous_mappings as $mapping) {
                                $company_field_mappings[$mapping['company_field_name']] = $mapping;
                            }
                            
                            // Check if all headers match previous mappings
                            $all_match = true;
                            foreach ($headers as $header) {
                                if (!isset($company_field_mappings[$header])) {
                                    $all_match = false;
                                    break;
                                }
                            }
                            
                            if ($all_match) {
                                // Auto-map fields
                                $db->query("UPDATE company_payments SET mapping_status = 'mapped' WHERE id = :payment_id");
                                $db->bind(':payment_id', $payment_id);
                                $db->execute();
                                
                                $auto_mapped = true;
                                $_SESSION['success_message'] = 'Headers extracted and fields automatically mapped based on previous mappings.';
                            } else {
                                $_SESSION['success_message'] = 'Headers extracted successfully. You can now map the fields.';
                            }
                        } else {
                            $_SESSION['success_message'] = 'Headers extracted successfully. You can now map the fields.';
                        }
                        
                        redirect('admin/map_order_statement.php?id=' . $payment_id);
                    } else {
                        $_SESSION['error_message'] = 'No headers found in the file.';
                    }
                } else {
                    $_SESSION['error_message'] = 'File not found. Please upload a new file.';
                }
            } catch (Exception $e) {
                error_log("Error fixing headers: " . $e->getMessage());
                $_SESSION['error_message'] = 'Error fixing headers: ' . $e->getMessage();
            }
            
            // Redirect back to the same page
            redirect('admin/map_order_statement.php?id=' . $payment_id);
        } elseif ($_POST['action'] === 'filter_headers') {
            // Filter headers based on selected columns
            if (isset($_POST['selected_headers']) && is_array($_POST['selected_headers'])) {
                try {
                    // Get current headers
                    $db->query("SELECT * FROM payment_file_headers WHERE payment_id = :payment_id");
                    $db->bind(':payment_id', $payment_id);
                    $headers_record = $db->single();
                    
                    if ($headers_record && !empty($headers_record['headers'])) {
                        $all_headers = json_decode($headers_record['headers'], true);
                        
                        // Filter headers based on selection
                        $filtered_headers = [];
                        foreach ($_POST['selected_headers'] as $index) {
                            if (isset($all_headers[$index])) {
                                $filtered_headers[] = $all_headers[$index];
                            }
                        }
                        
                        // Save filtered headers
                        $db->query("UPDATE payment_file_headers SET headers = :headers WHERE payment_id = :payment_id");
                        $db->bind(':payment_id', $payment_id);
                        $db->bind(':headers', json_encode($filtered_headers));
                        $db->execute();
                        
                        $_SESSION['success_message'] = 'Headers filtered successfully. Only selected columns will be shown for mapping.';
                    } else {
                        $_SESSION['error_message'] = 'No headers found to filter.';
                    }
                } catch (Exception $e) {
                    error_log("Error filtering headers: " . $e->getMessage());
                    $_SESSION['error_message'] = 'Error filtering headers: ' . $e->getMessage();
                }
                
                // Redirect back to the same page
                redirect('admin/map_order_statement.php?id=' . $payment_id);
            }
        }
    }
}

// Get file preview
$file_preview = [];
$file_path = '../uploads/payments/' . $payment['file_path'];

if (file_exists($file_path)) {
    $file_ext = strtolower(pathinfo($payment['file_path'], PATHINFO_EXTENSION));
    
    if ($file_ext === 'csv') {
        // Read CSV file
        if (($handle = fopen($file_path, "r")) !== FALSE) {
            $row_count = 0;
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE && $row_count < 5) {
                $file_preview[] = $data;
                $row_count++;
            }
            fclose($handle);
        }
    } elseif ($file_ext === 'xlsx' || $file_ext === 'xls') {
        // Try to use PhpSpreadsheet if available
        if (file_exists('../vendor/autoload.php')) {
            require_once '../vendor/autoload.php';
            
            try {
                $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReaderForFile($file_path);
                $reader->setReadDataOnly(true);
                $spreadsheet = $reader->load($file_path);
                $worksheet = $spreadsheet->getActiveSheet();
                
                // Get the highest row and column
                $highestRow = $worksheet->getHighestRow();
                $highestColumn = $worksheet->getHighestColumn();
                $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);
                
                // Get the first 5 rows for preview
                for ($row = 1; $row <= min(5, $highestRow); $row++) {
                    $rowData = [];
                    for ($col = 1; $col <= $highestColumnIndex; $col++) {
                        $value = $worksheet->getCell(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $row)->getValue();
                        $rowData[] = $value;
                    }
                    $file_preview[] = $rowData;
                }
            } catch (Exception $e) {
                error_log("Error reading Excel file: " . $e->getMessage());
                $file_preview = [['Error reading Excel file: ' . $e->getMessage()]];
            }
        } else {
            // PhpSpreadsheet not available
            $file_preview = [['Excel file - preview not available. Please install PhpSpreadsheet to enable Excel preview.']];
        }
    }
}

$page_title = 'Map Order Statement Fields';

// Use the existing helper functions from functions.php

// Include header
include '../includes/admin_header.php';
?>

<div class="container-fluid py-4">
    <!-- Page Header -->
    <div class="row mb-4">
        <div class="col-md-6">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Map Order Statement Fields</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">Map fields from the uploaded order statement and control their visibility</p>
        </div>
        <div class="col-md-6 text-md-end">
            <a href="upload_order_statement.php" class="btn btn-secondary hover-lift">
                <i class="fas fa-arrow-left me-2"></i> Back to Order Statements
            </a>
            <a href="field_visibility.php?company_id=<?php echo $payment['company_id']; ?>" class="btn btn-primary hover-lift ms-2">
                <i class="fas fa-eye me-2"></i> Field Visibility
            </a>
            <a href="mapped_data_preview.php?id=<?php echo $payment_id; ?>" class="btn btn-success hover-lift ms-2">
                <i class="fas fa-table me-2"></i> View Mapped Data
            </a>
        </div>
    </div>

    <!-- Alerts -->
    <?php if (isset($_SESSION['error_message'])): ?>
        <div class="alert alert-danger">
            <?php 
            echo $_SESSION['error_message'];
            unset($_SESSION['error_message']);
            ?>
        </div>
    <?php endif; ?>

    <?php if (isset($_SESSION['success_message'])): ?>
        <div class="alert alert-success">
            <?php 
            echo $_SESSION['success_message'];
            unset($_SESSION['success_message']);
            ?>
        </div>
    <?php endif; ?>

    <!-- Payment Details Card -->
    <div class="card neumorphic bg-white light:bg-gray-800 mb-4">
        <div class="card-header bg-gray-50 light:bg-gray-700">
            <h5 class="card-title mb-0 text-gray-700 dark:text-gray-300">Order Statement Details</h5>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-4">
                    <p class="mb-1"><strong>Company:</strong> <?php echo htmlspecialchars($company['company_name']); ?></p>
                </div>
                <div class="col-md-4">
                    <p class="mb-1"><strong>Payment Date:</strong> <?php echo formatDate($payment['payment_date']); ?></p>
                </div>
                <div class="col-md-4">
                    <p class="mb-1"><strong>Amount:</strong> <?php echo formatCurrency($payment['amount']); ?></p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-4">
                    <p class="mb-1"><strong>Period:</strong> <?php echo formatDate($payment['start_date']); ?> - <?php echo formatDate($payment['end_date']); ?></p>
                </div>
                <div class="col-md-4">
                    <p class="mb-1"><strong>Status:</strong> <?php echo getStatusLabel($payment['status']); ?></p>
                </div>
                <div class="col-md-4">
                    <p class="mb-1"><strong>Mapping Status:</strong> <?php echo getStatusLabel($payment['mapping_status']); ?></p>
                </div>
            </div>
        </div>
    </div>

    <!-- Fix Headers Button -->
    <?php if (empty($headers) || in_array('Excel file - headers will be extracted by admin', $headers)): ?>
    <div class="card mb-4">
        <div class="card-header bg-warning text-white">
            <h5 class="mb-0">Fix Headers</h5>
        </div>
        <div class="card-body">
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i> 
                <?php if (empty($headers)): ?>
                    No headers found for this file.
                <?php else: ?>
                    Headers need to be extracted from the Excel file.
                <?php endif; ?>
            </div>
            <p>Click the button below to automatically fix the file path and extract headers from the Excel file:</p>
            <form method="POST" action="map_order_statement.php?id=<?php echo $payment_id; ?>">
                <input type="hidden" name="action" value="fix_headers">
                <button type="submit" class="btn btn-warning">
                    <i class="fas fa-magic me-2"></i> Fix Headers and Extract Columns
                </button>
            </form>
        </div>
    </div>
    <?php endif; ?>

    <!-- File Preview Card -->
    <div class="card mb-4">
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0">File Preview</h5>
        </div>
        <div class="card-body">
            <?php if (empty($file_preview)): ?>
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i> File preview not available. The file may be missing or in an unsupported format.
                </div>
            <?php else: ?>
                <div class="table-responsive">
                    <table class="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <?php foreach ($file_preview[0] as $index => $header): ?>
                                    <th><?php 
                                        if ($header === null) {
                                            echo 'Column ' . ($index + 1); // Use a default name for null headers
                                        } elseif (is_string($header) && substr($header, 0, 1) === '=') {
                                            echo htmlspecialchars('Formula Column ' . ($index + 1)); // Handle Excel formulas
                                        } else {
                                            echo htmlspecialchars((string)$header); // Cast to string before using htmlspecialchars
                                        }
                                    ?></th>
                                <?php endforeach; ?>
                            </tr>
                        </thead>
                        <tbody>
                            <?php for ($i = 1; $i < count($file_preview); $i++): ?>
                                <tr>
                                    <?php foreach ($file_preview[$i] as $cell): ?>
                                        <td><?php 
                                            if ($cell === null) {
                                                echo ''; // Handle null values
                                            } elseif (is_string($cell) && substr($cell, 0, 1) === '=') {
                                                echo htmlspecialchars('[Formula]'); // Handle Excel formulas
                                            } else {
                                                echo htmlspecialchars((string)$cell); // Cast to string before using htmlspecialchars
                                            }
                                        ?></td>
                                    <?php endforeach; ?>
                                </tr>
                            <?php endfor; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </div>
    
    <!-- Column Selection Card -->
    <?php if (!empty($headers) && !in_array('Excel file - headers will be extracted by admin', $headers) && count($headers) > 10): ?>
    <div class="card mb-4">
        <div class="card-header bg-info text-white">
            <h5 class="mb-0">Select Columns to Map</h5>
        </div>
        <div class="card-body">
            <p>This file has <?php echo count($headers); ?> columns. You can select only the columns you want to map:</p>
            <form method="POST" action="map_order_statement.php?id=<?php echo $payment_id; ?>">
                <input type="hidden" name="action" value="filter_headers">
                <div class="row">
                    <?php foreach ($headers as $index => $header): ?>
                        <div class="col-md-3 mb-2">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="selected_headers[]" value="<?php echo $index; ?>" id="header_<?php echo $index; ?>" checked>
                                <label class="form-check-label" for="header_<?php echo $index; ?>">
                                    <?php echo htmlspecialchars($header); ?>
                                </label>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                <div class="mt-3">
                    <button type="submit" class="btn btn-info">
                        <i class="fas fa-filter me-2"></i> Filter Columns
                    </button>
                    <button type="button" class="btn btn-outline-secondary ms-2" id="selectAllBtn">Select All</button>
                    <button type="button" class="btn btn-outline-secondary ms-2" id="deselectAllBtn">Deselect All</button>
                </div>
            </form>
        </div>
    </div>
    <?php endif; ?>

    <!-- Add System Field Card -->
    <div class="card mb-4">
        <div class="card-header bg-info text-white">
            <h5 class="mb-0">Add New System Field</h5>
        </div>
        <div class="card-body">
            <form method="POST" action="map_order_statement.php?id=<?php echo $payment_id; ?>" class="row g-3">
                <input type="hidden" name="action" value="add_system_field">
                
                <div class="col-md-4">
                    <label for="field_key" class="form-label">Field Key</label>
                    <input type="text" class="form-control" id="field_key" name="field_key" placeholder="e.g. customer_email" required pattern="[a-z0-9_]+" title="Only lowercase letters, numbers, and underscores allowed">
                    <small class="text-muted">Only lowercase letters, numbers, and underscores</small>
                </div>
                
                <div class="col-md-4">
                    <label for="field_label" class="form-label">Field Label</label>
                    <input type="text" class="form-control" id="field_label" name="field_label" placeholder="e.g. Customer Email" required>
                </div>
                
                <div class="col-md-4">
                    <label for="field_type" class="form-label">Field Type</label>
                    <select class="form-select" id="field_type" name="field_type" required>
                        <?php foreach ($field_mapping_model->getDataTypes() as $type_key => $type_label): ?>
                            <option value="<?php echo $type_key; ?>"><?php echo $type_label; ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <div class="col-12">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-plus-circle me-2"></i> Add System Field
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Field Mapping Form -->
    <div class="card mb-4">
        <div class="card-header bg-success text-white">
            <h5 class="mb-0">Map Fields and Set Visibility</h5>
        </div>
        <div class="card-body">
            <?php if (empty($headers)): ?>
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i> No headers found in the file. Please check the file format.
                </div>
            <?php else: ?>
                <form method="POST" action="map_order_statement.php?id=<?php echo $payment_id; ?>">
                    <input type="hidden" name="action" value="save_mappings">
                    
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Company Column</th>
                                    <th>System Field</th>
                                    <th>Field Type</th>
                                    <th>Visibility Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($headers as $header): ?>
                                    <?php 
                                    // Skip empty headers
                                    if (empty($header)) continue;
                                    
                                    // Get existing mapping if available
                                    $existing = isset($existing_mappings[$header]) ? $existing_mappings[$header] : null;
                                    ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($header); ?></td>
                                        <td>
                                            <select name="mappings[<?php echo htmlspecialchars($header); ?>][system_field]" class="form-select">
                                                <option value="">-- Select Field --</option>
                                                <?php foreach ($system_fields as $field_key => $field_label): ?>
                                                    <option value="<?php echo $field_key; ?>" <?php echo ($existing && $existing['supplier_field_name'] === $field_key) ? 'selected' : ''; ?>>
                                                        <?php echo $field_label; ?>
                                                    </option>
                                                <?php endforeach; ?>
                                            </select>
                                        </td>
                                        <td>
                                            <select name="mappings[<?php echo htmlspecialchars($header); ?>][field_type]" class="form-select">
                                                <?php foreach ($field_mapping_model->getDataTypes() as $type_key => $type_label): ?>
                                                    <option value="<?php echo $type_key; ?>" <?php echo ($existing && $existing['field_type'] === $type_key) ? 'selected' : ''; ?>>
                                                        <?php echo $type_label; ?>
                                                    </option>
                                                <?php endforeach; ?>
                                            </select>
                                        </td>
                                        <td>
                                            <div class="form-check form-switch mb-2">
                                                <input class="form-check-input" type="checkbox" 
                                                       name="mappings[<?php echo htmlspecialchars($header); ?>][show_to_rider]" 
                                                       id="show_to_rider_<?php echo htmlspecialchars($header); ?>"
                                                       <?php echo ($existing && $existing['show_to_rider']) ? 'checked' : ''; ?>>
                                                <label class="form-check-label" for="show_to_rider_<?php echo htmlspecialchars($header); ?>">
                                                    Show to Riders
                                                </label>
                                            </div>
                                            <div class="form-check form-switch mb-2">
                                                <input class="form-check-input" type="checkbox" 
                                                       name="mappings[<?php echo htmlspecialchars($header); ?>][show_in_invoice]" 
                                                       id="show_in_invoice_<?php echo htmlspecialchars($header); ?>"
                                                       <?php echo ($existing && $existing['show_in_invoice']) ? 'checked' : ''; ?>>
                                                <label class="form-check-label" for="show_in_invoice_<?php echo htmlspecialchars($header); ?>">
                                                    Show in Invoice
                                                </label>
                                            </div>
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" 
                                                       name="mappings[<?php echo htmlspecialchars($header); ?>][count_for_commission]" 
                                                       id="count_for_commission_<?php echo htmlspecialchars($header); ?>"
                                                       <?php echo ($existing && $existing['count_for_commission']) ? 'checked' : ''; ?>>
                                                <label class="form-check-label" for="count_for_commission_<?php echo htmlspecialchars($header); ?>">
                                                    Use for Commission
                                                </label>
                                            </div>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="mt-4 text-end">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i> Save Field Mappings
                        </button>
                    </div>
                </form>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Auto-detect field types based on system field selection
    const systemFieldSelects = document.querySelectorAll('select[name$="[system_field]"]');
    
    systemFieldSelects.forEach(select => {
        select.addEventListener('change', function() {
            const fieldName = this.value;
            const row = this.closest('tr');
            const fieldTypeSelect = row.querySelector('select[name$="[field_type]"]');
            
            // Set appropriate field type based on system field
            if (fieldName.includes('date')) {
                fieldTypeSelect.value = 'date';
            } else if (fieldName.includes('amount') || fieldName.includes('price') || fieldName.includes('rate') || fieldName.includes('commission')) {
                fieldTypeSelect.value = 'currency';
            } else if (fieldName.includes('count') || fieldName.includes('quantity') || fieldName.includes('number')) {
                fieldTypeSelect.value = 'number';
            } else if (fieldName.includes('email')) {
                fieldTypeSelect.value = 'email';
            } else if (fieldName.includes('phone')) {
                fieldTypeSelect.value = 'phone';
            }
            
            // Set visibility options based on system field
            const showToRider = row.querySelector('input[name$="[show_to_rider]"]');
            const showInInvoice = row.querySelector('input[name$="[show_in_invoice]"]');
            const countForCommission = row.querySelector('input[name$="[count_for_commission]"]');
            
            // Default all to checked for selected fields
            if (fieldName) {
                showToRider.checked = true;
                showInInvoice.checked = true;
                
                // Only check commission for relevant fields
                if (fieldName.includes('amount') || fieldName.includes('price') || 
                    fieldName.includes('rate') || fieldName.includes('commission') ||
                    fieldName.includes('count') || fieldName.includes('quantity')) {
                    countForCommission.checked = true;
                } else {
                    countForCommission.checked = false;
                }
            }
        });
    });
    
    // Select/Deselect All buttons for column selection
    document.getElementById('selectAllBtn')?.addEventListener('click', function() {
        const checkboxes = document.querySelectorAll('input[name="selected_headers[]"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
    });
    
    document.getElementById('deselectAllBtn')?.addEventListener('click', function() {
        const checkboxes = document.querySelectorAll('input[name="selected_headers[]"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    });
});
</script>

<?php include '../includes/admin_footer.php'; ?>
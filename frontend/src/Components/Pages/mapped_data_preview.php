<?php
/**
 * Mapped Data Preview
 * This page shows a preview of the mapped data with system field names
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
$field_mapping_model = new FieldMapping($db);
$payment_model = new Payment($db);

// Initialize variables
$payment_id = 0;
$company_id = 0;
$payment = null;
$company = null;
$errors = [];

// Check if we need to refresh the mappings
if (isset($_GET['refresh'])) {
    // Set a flag to force refresh of mappings
    $_SESSION['mappings_created'] = true;
}

// Check if we need to create direct mappings
if (isset($_GET['direct_create'])) {
    // Create direct mappings for the specific file format
    $_SESSION['direct_create'] = true;
}

// Check if we have a payment ID or company ID
if (isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    
    // Try to get payment first
    $payment = $payment_model->getPaymentById($id);
    
    if ($payment) {
        // We found a payment
        $payment_id = $id;
        $company_id = (int)$payment['company_id'];
        
        // Debug payment info
        error_log("Payment found: " . print_r($payment, true));
        error_log("Company ID from payment: " . $company_id);
        
        // Get company details
        $company_model = new Company($db);
        $company = $company_model->getCompanyById($company_id);
        
        if (!$company) {
            $errors[] = 'Company not found for payment ID ' . $payment_id;
        }
    } else {
        // Maybe it's a company ID
        $company_model = new Company($db);
        $company = $company_model->getCompanyById($id);
        
        if ($company) {
            // We found a company
            $company_id = $id;
            
            // Try to get the most recent payment for this company
            $payments = $payment_model->getCompanyPayments($company_id);
            if (!empty($payments)) {
                $payment = $payments[0];
                $payment_id = $payment['id'];
            }
        } else {
            $errors[] = 'Invalid ID. Neither payment nor company found with ID ' . $id;
            redirect('payments.php');
        }
    }
} else {
    $errors[] = 'No ID provided.';
    redirect('payments.php');
}

// Verify company_id is valid
if ($company_id <= 0) {
    error_log("Invalid company_id: $company_id");
    $errors[] = 'Invalid company ID. Please check the payment record.';
}

// Get field mappings for this company
$mappings = $field_mapping_model->getMappingsByCompany($company_id);

// Debug mappings
error_log("Mappings for company $company_id: " . print_r($mappings, true));

// If we need to create direct mappings
if (isset($_SESSION['direct_create']) && $_SESSION['direct_create'] === true) {
    // Clear the session flag
    unset($_SESSION['direct_create']);
    
    // Create direct mappings for the specific file format
    error_log("Creating direct mappings for company_id: $company_id");
    
    // First, delete any existing mappings
    $db->query("DELETE FROM field_mappings WHERE company_id = :company_id");
    $db->bind(':company_id', $company_id);
    $db->execute();
    
    // Create mappings for the key fields in the file
    $direct_mappings = [
        ['supplier_field_name' => 'Rider Name', 'company_field_name' => 'cee_name', 'field_type' => 'text'],
        ['supplier_field_name' => 'Order Count', 'company_field_name' => 'delivered_orders', 'field_type' => 'number'],
        ['supplier_field_name' => 'Total Earnings', 'company_field_name' => 'total_with_arrears', 'field_type' => 'currency'],
        ['supplier_field_name' => 'Order Date', 'company_field_name' => 'month', 'field_type' => 'date'],
        ['supplier_field_name' => 'Location', 'company_field_name' => 'city', 'field_type' => 'text']
    ];
    
    foreach ($direct_mappings as $mapping) {
        $db->query("INSERT INTO field_mappings (company_id, supplier_field_name, company_field_name, show_to_rider, show_in_invoice, count_for_commission, field_type) 
                    VALUES (:company_id, :supplier_field_name, :company_field_name, 1, 1, 0, :field_type)");
        $db->bind(':company_id', $company_id);
        $db->bind(':supplier_field_name', $mapping['supplier_field_name']);
        $db->bind(':company_field_name', $mapping['company_field_name']);
        $db->bind(':field_type', $mapping['field_type']);
        $result = $db->execute();
        error_log("Direct insert result for {$mapping['company_field_name']}: " . ($result ? 'success' : 'failure'));
    }
    
    // Refresh the mappings
    $mappings = $field_mapping_model->getMappingsByCompany($company_id, true);
    error_log("Refreshed mappings after direct creation: " . print_r($mappings, true));
    
    // Set success message
    $_SESSION['success_message'] = 'Direct mappings created successfully.';
    
    // Redirect to refresh the page
    redirect('admin/mapped_data_preview.php?id=' . $payment_id);
}

// If we just created mappings, force a refresh to ensure they're loaded
if (isset($_SESSION['mappings_created']) && $_SESSION['mappings_created'] === true) {
    // Clear the session flag
    unset($_SESSION['mappings_created']);
    
    // Force a refresh of the mappings
    $mappings = $field_mapping_model->getMappingsByCompany($company_id, true);
    error_log("Refreshed mappings after creation: " . print_r($mappings, true));
    
    // Add a direct query to the database to verify mappings
    $db->query("SELECT * FROM field_mappings WHERE company_id = :company_id");
    $db->bind(':company_id', $company_id);
    $direct_mappings = $db->resultSet();
    error_log("Direct query mappings: " . print_r($direct_mappings, true));
    
    // If no mappings found, create a test mapping directly
    if (empty($direct_mappings)) {
        error_log("No mappings found, creating a test mapping directly");
        $db->query("INSERT INTO field_mappings (company_id, supplier_field_name, company_field_name, show_to_rider, show_in_invoice, count_for_commission, field_type) 
                    VALUES (:company_id, 'Rider Name', 'cee_name', 1, 1, 0, 'text')");
        $db->bind(':company_id', $company_id);
        $result = $db->execute();
        error_log("Direct insert result: " . ($result ? 'success' : 'failure'));
        
        // Check if the mapping was created
        $db->query("SELECT * FROM field_mappings WHERE company_id = :company_id");
        $db->bind(':company_id', $company_id);
        $test_mappings = $db->resultSet();
        error_log("Test mappings after direct insert: " . print_r($test_mappings, true));
    }
}

// Check if we have any mappings
if (empty($mappings)) {
    // If auto-create parameter is set, create mappings
    if (isset($_GET['auto_create'])) {
        // Get current user
        $user = $auth->getCurrentUser();
        $user_id = $user['id'];
        
        // Double-check company_id
        if ($company_id <= 0 && $payment && isset($payment['company_id'])) {
            $company_id = (int)$payment['company_id'];
            error_log("Updated company_id from payment: " . $company_id);
        }
        
        // Check if we have headers from the file
        if (!empty($headers)) {
            // Create custom mappings based on file headers
            $result = $field_mapping_model->createCustomMappings($company_id, $headers, $user_id);
            
            // Verify mappings were created with a direct query
            $db->query("SELECT COUNT(*) as count FROM field_mappings WHERE company_id = :company_id");
            $db->bind(':company_id', $company_id);
            $count_result = $db->single();
            error_log("Direct count of mappings after creation: " . ($count_result ? $count_result['count'] : 0));
            
            if ($result) {
                $_SESSION['success_message'] = 'Custom field mappings created successfully based on file headers.';
                $_SESSION['mappings_created'] = true;
                // Refresh the page to show the new mappings
                redirect('admin/mapped_data_preview.php?id=' . $payment_id);
            } else {
                // Fall back to default mappings
                $result = $field_mapping_model->createDefaultMappings($company_id, $user_id);
                
                if ($result) {
                    $_SESSION['success_message'] = 'Default field mappings created successfully.';
                    $_SESSION['mappings_created'] = true;
                    // Refresh the page to show the new mappings
                    redirect('admin/mapped_data_preview.php?id=' . $payment_id);
                } else {
                    $errors[] = 'Failed to create field mappings.';
                }
            }
        } else {
            // Create default mappings
            $result = $field_mapping_model->createDefaultMappings($company_id, $user_id);
            
            if ($result) {
                $_SESSION['success_message'] = 'Default field mappings created successfully.';
                $_SESSION['mappings_created'] = true;
                // Refresh the page to show the new mappings
                redirect('admin/mapped_data_preview.php?id=' . $payment_id);
            } else {
                $errors[] = 'Failed to create default field mappings.';
            }
        }
    } else {
        // Show message and buttons
        $errors[] = 'No field mappings found for this company. Please create mappings first.';
        
        // Add buttons to go to the mapping page or auto-create mappings
        $buttons = '<div class="mt-3">';
        $buttons .= '<a href="map_order_statement.php?id=' . $payment_id . '" class="btn btn-primary me-2">Go to Manual Mapping Page</a>';
        $buttons .= '<a href="mapped_data_preview.php?id=' . $payment_id . '&auto_create=1" class="btn btn-success me-2">Auto-Create Mappings</a>';
        
        // Add a button to create direct mappings for this specific file format
        $buttons .= '<a href="mapped_data_preview.php?id=' . $payment_id . '&direct_create=1" class="btn btn-warning">Create Direct Mappings</a>';
        
        $buttons .= '</div>';
        $errors[] = $buttons;
    }
}

// Get the uploaded file data
$file_path = '';

// Only try to find a file if we have a payment
if ($payment) {
    $possible_paths = [
        '../uploads/payments/' . ($payment['file_path'] ?? ''),
        '../uploads/statements/' . ($payment['statement_file'] ?? ''),
        '../uploads/payments/' . ($payment['statement_file'] ?? ''),
        '../uploads/statements/' . ($payment['file_path'] ?? '')
    ];
    
    foreach ($possible_paths as $path) {
        if (!empty($path) && file_exists($path)) {
            $file_path = $path;
            break;
        }
    }
    
    // If no file found, check directories for any files matching the payment ID
    if (empty($file_path) && $payment_id > 0) {
        $directories = ['../uploads/payments/', '../uploads/statements/'];
        
        foreach ($directories as $dir) {
            if (is_dir($dir)) {
                $files = scandir($dir);
                
                foreach ($files as $file) {
                    if ($file != '.' && $file != '..' && strpos($file, 'payment_' . $payment_id) !== false) {
                        $file_path = $dir . $file;
                        break 2;
                    }
                }
            }
        }
    }
}

// If we still don't have a file, check for any files for this company
if (empty($file_path)) {
    $directories = ['../uploads/payments/', '../uploads/statements/'];
    
    foreach ($directories as $dir) {
        if (is_dir($dir)) {
            $files = scandir($dir);
            
            foreach ($files as $file) {
                if ($file != '.' && $file != '..' && strpos($file, 'company_' . $company_id) !== false) {
                    $file_path = $dir . $file;
                    break 2;
                }
            }
        }
    }
}

// If we still don't have a file, look for any sample files
if (empty($file_path)) {
    $directories = ['../uploads/payments/', '../uploads/statements/', '../uploads/samples/'];
    
    foreach ($directories as $dir) {
        if (is_dir($dir)) {
            $files = scandir($dir);
            
            foreach ($files as $file) {
                if ($file != '.' && $file != '..' && (
                    strpos($file, '.csv') !== false || 
                    strpos($file, '.xlsx') !== false || 
                    strpos($file, '.xls') !== false
                )) {
                    $file_path = $dir . $file;
                    break 2;
                }
            }
        }
    }
}

if (empty($file_path) || !file_exists($file_path)) {
    $errors[] = 'No statement file found. Please upload a file first or check <a href="check_payment_structure.php?id=' . $payment_id . '">file structure</a>.';
}

// Set page title
$page_title = 'Mapped Data Preview';

// Include header
include '../includes/admin_header.php';
?>

<div class="container-fluid py-4">
    <!-- Page Header -->
    <div class="row mb-4">
        <div class="col-md-6">
            <h1 class="text-2xl font-bold text-gray-800 light:text-white">Mapped Data Preview</h1>
            <p class="text-sm text-gray-500 light:text-gray-400">
                Preview of <?php echo htmlspecialchars($company['company_name']); ?>'s data with mapped system fields
            </p>
        </div>
        <div class="col-md-6 text-md-end">
            <?php if ($payment_id > 0): ?>
            <a href="map_order_statement.php?id=<?php echo $payment_id; ?>" class="btn btn-secondary hover-lift me-2">
                <i class="fas fa-map-marker-alt me-2"></i> Back to Mapping
            </a>
            <?php endif; ?>
            <a href="field_visibility.php?company_id=<?php echo $company_id; ?>" class="btn btn-primary hover-lift me-2">
                <i class="fas fa-eye me-2"></i> Field Visibility
            </a>
            <?php if (!isset($_GET['debug'])): ?>
            <a href="mapped_data_preview.php?id=<?php echo $payment_id; ?>&debug=1" class="btn btn-info hover-lift me-2">
                <i class="fas fa-bug me-2"></i> Debug Mode
            </a>
            <?php else: ?>
            <a href="mapped_data_preview.php?id=<?php echo $payment_id; ?>" class="btn btn-secondary hover-lift me-2">
                <i class="fas fa-times me-2"></i> Exit Debug
            </a>
            <?php endif; ?>
            <a href="mapped_data_preview.php?id=<?php echo $payment_id; ?>&refresh=1" class="btn btn-warning hover-lift me-2">
                <i class="fas fa-sync-alt me-2"></i> Refresh Mappings
            </a>
            <?php if (!empty($mapped_data)): ?>
            <button type="button" class="btn btn-success hover-lift" onclick="publishData(<?php echo $payment_id; ?>, <?php echo $company_id; ?>)">
                <i class="fas fa-paper-plane me-2"></i> Publish to Riders
            </button>
            <?php endif; ?>
        </div>
    </div>

    <!-- Alerts -->
    <?php if (!empty($errors)): ?>
        <div class="alert alert-danger">
            <ul class="mb-0">
                <?php foreach ($errors as $error): ?>
                    <li><?php echo $error; ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <?php if (!empty($success)): ?>
        <div class="alert alert-success">
            <ul class="mb-0">
                <?php foreach ($success as $message): ?>
                    <li><?php echo $message; ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <!-- Mapping Info -->
    <div class="card neumorphic bg-white light:bg-gray-800 mb-4">
        <div class="card-header bg-gray-50 light:bg-gray-700">
            <h5 class="card-title mb-0 text-gray-700 light:text-gray-300">
                <i class="fas fa-info-circle me-2"></i>Mapping Information
            </h5>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-4">
                    <p><strong>Company:</strong> <?php echo htmlspecialchars($company['company_name'] ?? 'Unknown'); ?></p>
                </div>
                <div class="col-md-4">
                    <p><strong>File:</strong> <?php echo $payment ? htmlspecialchars($payment['file_path'] ?? $payment['statement_file'] ?? basename($file_path ?? 'Unknown')) : basename($file_path ?? 'No file'); ?></p>
                </div>
                <div class="col-md-4">
                    <p><strong>Mapped Fields:</strong> <?php echo count($mappings); ?></p>
                </div>
            </div>
        </div>
    </div>

    <!-- Data Preview -->
    <div class="card neumorphic bg-white light:bg-gray-800">
        <div class="card-header bg-gray-50 light:bg-gray-700">
            <h5 class="card-title mb-0 text-gray-700 light:text-gray-300">
                <i class="fas fa-table me-2"></i>Mapped Data Preview
            </h5>
        </div>
        <div class="card-body">
            <?php
            // Read the file and extract data
            $file_extension = pathinfo($file_path, PATHINFO_EXTENSION);
            $data = [];
            $headers = [];
            
            if ($file_extension === 'csv') {
                // Process CSV file
                if (($handle = fopen($file_path, "r")) !== FALSE) {
                    // Read headers
                    if (($row = fgetcsv($handle, 0, ",")) !== FALSE) {
                        $headers = $row;
                    }
                    
                    // Read data
                    while (($row = fgetcsv($handle, 0, ",")) !== FALSE) {
                        $data[] = array_combine($headers, $row);
                    }
                    
                    fclose($handle);
                }
            } elseif ($file_extension === 'xlsx' || $file_extension === 'xls') {
                // Process Excel file
                require_once '../vendor/autoload.php';
                
                $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReaderForFile($file_path);
                $reader->setReadDataOnly(true);
                $spreadsheet = $reader->load($file_path);
                $worksheet = $spreadsheet->getActiveSheet();
                
                // Get headers from first row
                $highestColumn = $worksheet->getHighestColumn();
                $headerRow = $worksheet->rangeToArray('A1:' . $highestColumn . '1', null, true, false)[0];
                // Handle null values before applying trim
                $headers = array_map(function($value) {
                    return is_null($value) || !is_string($value) ? '' : trim($value);
                }, $headerRow);
                
                // Get data
                $rows = $worksheet->rangeToArray('A2:' . $highestColumn . $worksheet->getHighestRow(), null, true, false);
                foreach ($rows as $row) {
                    if (!empty(array_filter($row))) { // Skip empty rows
                        $data[] = array_combine($headers, $row);
                    }
                }
            }
            
            // Create a mapping from company field names to system field names
            $field_mapping = [];
            foreach ($mappings as $mapping) {
                // Debug each mapping
                error_log("Processing mapping: " . print_r($mapping, true));
                
                // Make sure we have the required fields
                if (isset($mapping['company_field_name']) && isset($mapping['supplier_field_name'])) {
                    // Normalize the company field name to handle case sensitivity and whitespace
                    $company_field_normalized = isset($mapping['company_field_name']) && !is_null($mapping['company_field_name']) ? 
                        trim($mapping['company_field_name']) : '';
                    
                    $field_mapping[$company_field_normalized] = [
                        'system_field' => $mapping['supplier_field_name'],
                        'field_type' => $mapping['field_type'] ?? 'text'
                    ];
                    
                    // Also add the original field name as a key for better matching
                    $field_mapping[$mapping['company_field_name']] = [
                        'system_field' => $mapping['supplier_field_name'],
                        'field_type' => $mapping['field_type'] ?? 'text'
                    ];
                } else {
                    error_log("Missing required fields in mapping: " . print_r($mapping, true));
                }
            }

            // Debug the final field mapping
            error_log("Field mapping: " . print_r($field_mapping, true));
            
            // Get system field labels
            $system_fields = $field_mapping_model->getSystemFields();
            
            // Debug the original data
            error_log("Original data (first row): " . print_r(!empty($data) ? $data[0] : [], true));

            // Create a normalized version of the field mapping for better matching
            $normalized_field_mapping = [];
            foreach ($field_mapping as $company_field => $mapping_data) {
                // Normalize the field name (lowercase, trim whitespace)
                $normalized_field = is_null($company_field) ? '' : strtolower(trim($company_field));
                $normalized_field_mapping[$normalized_field] = $mapping_data;
            }
            
            // Transform data to use system field names
            $mapped_data = [];
            foreach ($data as $row) {
                $mapped_row = [];
                foreach ($row as $field_name => $value) {
                    // Try exact match first
                    if (isset($field_mapping[$field_name])) {
                        $mapping_data = $field_mapping[$field_name];
                    } else {
                        // Try normalized match
                        $normalized_field = is_null($field_name) ? '' : strtolower(trim($field_name));
                        if (isset($normalized_field_mapping[$normalized_field])) {
                            $mapping_data = $normalized_field_mapping[$normalized_field];
                        } else {
                            // No mapping found
                            error_log("No mapping found for field: '$field_name'");
                            continue;
                        }
                    }
                    
                    $system_field = $mapping_data['system_field'];
                    $field_type = $mapping_data['field_type'];
                    
                    error_log("Found mapping for '$field_name' -> '$system_field' (type: $field_type)");
                    
                    // Format value based on field type
                    switch ($field_type) {
                        case 'date':
                            // Try to format as date if it's a valid date
                            if ($value !== null && $value !== '') {
                                $date_value = strtotime($value);
                                if ($date_value !== false) {
                                    $value = date('Y-m-d', $date_value);
                                }
                            }
                            break;
                        case 'currency':
                            // Format as currency
                            if (is_numeric($value)) {
                                $value = '$' . number_format((float)$value, 2);
                            }
                            break;
                        case 'number':
                            // Ensure it's a number
                            if (is_numeric($value)) {
                                $value = number_format((float)$value, 2);
                            }
                            break;
                    }
                    
                    $mapped_row[$system_field] = $value;
                }
                
                if (!empty($mapped_row)) {
                    $mapped_data[] = $mapped_row;
                } else {
                    error_log("No mapped fields found for row: " . print_r($row, true));
                }
            }
            
            // Debug the mapped data
            error_log("Mapped data count: " . count($mapped_data));
            if (!empty($mapped_data)) {
                error_log("Mapped data (first row): " . print_r($mapped_data[0], true));
            }
            
            // Debug information - show if in development mode or debug parameter is set
            if (defined('ENVIRONMENT') && ENVIRONMENT === 'development' || isset($_GET['debug'])) {
                echo '<div class="card mb-4">';
                echo '<div class="card-header bg-info text-white">Debug Information</div>';
                echo '<div class="card-body">';
                
                echo '<h5>File Path:</h5>';
                echo '<p>' . htmlspecialchars($file_path) . '</p>';
                
                echo '<h5>File Extension:</h5>';
                echo '<p>' . htmlspecialchars($file_extension) . '</p>';
                
                echo '<h5>Headers Found:</h5>';
                echo '<pre>' . print_r($headers, true) . '</pre>';
                
                echo '<h5>Data Rows Found:</h5>';
                echo '<p>' . count($data) . ' rows</p>';
                
                echo '<h5>Company ID:</h5>';
                echo '<p>' . $company_id . '</p>';
                
                echo '<h5>Field Mappings:</h5>';
                echo '<pre>' . print_r($mappings, true) . '</pre>';
                
                echo '<h5>Field Mapping Array:</h5>';
                echo '<pre>' . print_r($field_mapping, true) . '</pre>';
                
                // Add direct database query results
                $db->query("SELECT * FROM field_mappings WHERE company_id = :company_id");
                $db->bind(':company_id', $company_id);
                $direct_mappings = $db->resultSet();
                
                echo '<h5>Direct Database Query Results:</h5>';
                echo '<pre>' . print_r($direct_mappings, true) . '</pre>';
                
                echo '<h5>Mapped Data:</h5>';
                echo '<p>' . count($mapped_data) . ' rows</p>';
                
                echo '</div>';
                echo '</div>';
            }
            
            // Display the mapped data
            if (!empty($mapped_data)) {
                echo '<div class="table-responsive">';
                echo '<table class="table table-striped table-hover">';
                
                // Display headers
                echo '<thead class="table-dark">';
                echo '<tr>';
                foreach (array_keys($mapped_data[0]) as $header) {
                    $display_header = isset($system_fields[$header]) ? $system_fields[$header] : $header;
                    echo '<th>' . htmlspecialchars($display_header) . '</th>';
                }
                echo '</tr>';
                echo '</thead>';
                
                // Display data
                echo '<tbody>';
                foreach ($mapped_data as $row) {
                    echo '<tr>';
                    foreach ($row as $value) {
                        echo '<td>' . htmlspecialchars($value ?? '') . '</td>';
                    }
                    echo '</tr>';
                }
                echo '</tbody>';
                
                echo '</table>';
                echo '</div>';
                
                // Show mapped fields information
                echo '<div class="alert alert-info mt-3">';
                echo '<h5><i class="fas fa-info-circle me-2"></i>Mapped Fields Information</h5>';
                echo '<p>Only the fields shown below will be published. Unmapped fields will be ignored.</p>';
                
                // Display mapped fields
                echo '<div class="row">';
                echo '<div class="col-md-6">';
                echo '<h6 class="mb-2">Mapped Fields:</h6>';
                echo '<ul class="list-group">';
                foreach (array_keys($mapped_data[0]) as $header) {
                    $display_header = isset($system_fields[$header]) ? $system_fields[$header] : $header;
                    echo '<li class="list-group-item list-group-item-success d-flex justify-content-between align-items-center">';
                    echo htmlspecialchars($display_header);
                    echo '<span class="badge bg-success rounded-pill"><i class="fas fa-check"></i></span>';
                    echo '</li>';
                }
                echo '</ul>';
                echo '</div>';
                
                // Display unmapped fields
                echo '<div class="col-md-6">';
                echo '<h6 class="mb-2">Unmapped Fields (will be ignored):</h6>';
                echo '<ul class="list-group">';
                $mapped_fields = [];
                foreach ($field_mapping as $company_field => $mapping) {
                    $mapped_fields[strtolower(trim($company_field))] = true;
                }
                
                foreach ($headers as $header) {
                    if (!isset($mapped_fields[strtolower(trim($header))])) {
                        echo '<li class="list-group-item list-group-item-secondary d-flex justify-content-between align-items-center">';
                        echo htmlspecialchars($header);
                        echo '<span class="badge bg-secondary rounded-pill"><i class="fas fa-times"></i></span>';
                        echo '</li>';
                    }
                }
                echo '</ul>';
                echo '</div>';
                echo '</div>';
                echo '</div>';
                
                // Show record count and publish button
                echo '<div class="d-flex justify-content-between align-items-center mt-3">';
                echo '<p class="mb-0">Showing ' . count($mapped_data) . ' records with ' . count(array_keys($mapped_data[0])) . ' mapped fields.</p>';
                echo '<button id="publishBtn" class="btn btn-success" onclick="publishData(' . $payment_id . ', ' . $company_id . ')"><i class="fas fa-check-circle me-2"></i><span>Publish Data</span></button>';
                echo '</div>';
                
                // Add JavaScript for handling publish action
                echo '<script>
                function publishData(paymentId, companyId) {
                    const btn = document.getElementById("publishBtn");
                    const btnText = btn.querySelector("span");
                    const originalText = btnText.textContent;
                    
                    // Disable button and show loading state
                    btn.disabled = true;
                    btnText.textContent = "Publishing...";
                    
                    // Make AJAX request to publish data
                    fetch(`publish_mapped_data.php?payment_id=${paymentId}&company_id=${companyId}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                // Show success message
                                alert("Data published successfully!");
                                // Redirect to payments page
                                window.location.href = "payments.php";
                            } else {
                                // Show error message
                                alert(data.message || "Failed to publish data");
                                // Reset button state
                                btn.disabled = false;
                                btnText.textContent = originalText;
                            }
                        })
                        .catch(error => {
                            console.error("Error:", error);
                            alert("An error occurred while publishing data");
                            // Reset button state
                            btn.disabled = false;
                            btnText.textContent = originalText;
                        });
                }
                </script>';
            } else {
                echo '<div class="alert alert-info">No mapped data found. Please map some fields first.</div>';
                
                // Show sample data if available
                if (!empty($data)) {
                    echo '<h5 class="mt-4">Sample Data from File:</h5>';
                    echo '<div class="table-responsive">';
                    echo '<table class="table table-sm table-striped">';
                    
                    // Display headers
                    echo '<thead class="table-secondary">';
                    echo '<tr>';
                    foreach ($headers as $header) {
                        echo '<th>' . htmlspecialchars($header ?? 'Column') . '</th>';
                    }
                    echo '</tr>';
                    echo '</thead>';
                    
                    // Display first 3 rows of data
                    echo '<tbody>';
                    for ($i = 0; $i < min(3, count($data)); $i++) {
                        echo '<tr>';
                        foreach ($data[$i] as $value) {
                            echo '<td>' . htmlspecialchars($value ?? '') . '</td>';
                        }
                        echo '</tr>';
                    }
                    echo '</tbody>';
                    
                    echo '</table>';
                    echo '</div>';
                }
            }
            ?>
        </div>
    </div>
    
    <!-- Download Button -->
    <?php if (!empty($mapped_data)): ?>
    <div class="mt-4 text-end">
        <form method="post" action="export_mapped_data.php">
            <input type="hidden" name="id" value="<?php echo $payment_id > 0 ? $payment_id : $company_id; ?>">
            <input type="hidden" name="type" value="<?php echo $payment_id > 0 ? 'payment' : 'company'; ?>">
            <button type="submit" class="btn btn-success hover-lift">
                <i class="fas fa-download me-2"></i> Export Mapped Data
            </button>
        </form>
    </div>
    <?php endif; ?>
</div>

<!-- SweetAlert2 will be used instead of Bootstrap modals -->

<script>
// Function to publish data
function publishData(paymentId, companyId) {
    // Use SweetAlert2 for confirmation
    Swal.fire({
        title: 'Confirm Publication',
        text: 'Are you sure you want to publish this data? This will make the data visible to riders. This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, Publish Data',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Show loading state with SweetAlert2
            Swal.fire({
                title: 'Publishing data...',
                html: 'Please wait while we process your request.',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            // Send AJAX request to publish data
            fetch('publish_mapped_data.php?ajax=1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                body: 'payment_id=' + paymentId + '&company_id=' + companyId
            })
            .then(response => {
                // Log the response for debugging
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                
                // Clone the response so we can both log it and use it
                return response.clone().text().then(text => {
                    console.log('Raw response:', text);
                    
                    // Try to parse as JSON regardless of content type
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        console.error('Failed to parse response as JSON:', e);
                        throw new Error('Received invalid JSON response from server: ' + text.substring(0, 100) + '...');
                    }
                });
            })
            .then(data => {
                if (data.success) {
                    // Show success message
                    Swal.fire({
                        title: 'Success!',
                        text: data.message || 'Data published successfully.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then((result) => {
                        // Redirect to payments page
                        window.location.href = 'payments.php';
                    });
                } else {
                    // Show error message
                    // Create debug link if available
                    let debugHtml = '';
                    if (data.debug_link) {
                        debugHtml = `<div class="mt-3">
                            <a href="${data.debug_link}" target="_blank" class="btn btn-sm btn-info">
                                <i class="fas fa-bug"></i> Debug Mode
                            </a>
                            <a href="../check_riders.php" target="_blank" class="btn btn-sm btn-secondary ms-2">
                                <i class="fas fa-users"></i> Check Riders
                            </a>
                        </div>`;
                    }
                    
                    // Add column link if available (for rider_id column error)
                    if (data.add_column_link) {
                        debugHtml += `<div class="mt-3">
                            <a href="${data.add_column_link}" class="btn btn-primary">
                                <i class="fas fa-plus-circle"></i> Add Rider ID Column
                            </a>
                        </div>`;
                    }
                    
                    Swal.fire({
                        title: 'Error!',
                        html: `${data.message || 'Failed to publish data.'} ${debugHtml}`,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            })
            .catch(error => {
                // Show error message
                console.error('Error:', error);
                
                Swal.fire({
                    title: 'Error!',
                    text: 'An unexpected error occurred. Please try again. ' + error.message,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            });
        }
    });
}
</script>

<?php
// Include footer
include '../includes/admin_footer.php';
?>
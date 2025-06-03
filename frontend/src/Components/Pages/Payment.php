<?php
/**
 * Payment Model
 */
// Include WeeklySummary model for processRiderPayment function
require_once __DIR__ . '/WeeklySummary.php';

class Payment {
    private $db;
    protected $table = 'payment_settlements';
    
    /**
     * Constructor
     * @param Database $db - Database connection
     */
    public function __construct($db = null) {
        if ($db) {
            $this->db = $db;
        } else {
            $this->db = Database::getInstance();
        }
    }
    
    /**
     * Get all payment settlements
     * @param string|null $status - Filter by status (pending, settled) or null for all
     * @return array - Array of payment settlements
     */
    public function getAllPaymentSettlements($status = null) {
        try {
            // Check if payment_settlements table exists
            $this->db->query("SHOW TABLES LIKE 'payment_settlements'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                // Create the payment_settlements table
                $this->db->query("CREATE TABLE IF NOT EXISTS `payment_settlements` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `rider_id` int(11) NOT NULL,
                    `request_id` int(11) NOT NULL,
                    `amount` decimal(10,2) NOT NULL,
                    `payment_date` datetime NOT NULL,
                    `status` varchar(20) NOT NULL DEFAULT 'pending',
                    `remarks` text DEFAULT NULL,
                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    KEY `rider_id` (`rider_id`),
                    KEY `request_id` (`request_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $this->db->execute();
                error_log("Created payment_settlements table");
                
                // Return empty array since table was just created
                return [];
            }
            
            // Build the SQL query - using only the payment_settlements table without joins
            $sql = "SELECT * FROM payment_settlements";
            
            // Add status filter if provided
            if ($status) {
                $sql .= " WHERE status = :status";
            }
            
            // Order by payment_date desc
            $sql .= " ORDER BY payment_date DESC";
            
            // Prepare and execute the query
            $this->db->query($sql);
            
            // Bind parameters if provided
            if ($status) {
                $this->db->bind(':status', $status);
            }
            
            // Get the results
            $results = $this->db->resultSet();
            
            return $results;
        } catch (Exception $e) {
            error_log("Error in getAllPaymentSettlements: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get count of pending payments
     * @return int - Number of pending payments
     */
    public function getPendingPaymentsCount() {
        $this->db->query("SELECT COUNT(*) as total FROM company_payments WHERE status = 'pending'");
        $result = $this->db->single();
        return (int)$result['total'];
    }
    
    /**
     * Get payment statistics for reporting
     * @param string $date_from - Start date (YYYY-MM-DD)
     * @param string $date_to - End date (YYYY-MM-DD)
     * @return array - Payment statistics
     */
    public function getPaymentStatistics($date_from, $date_to) {
        try {
            $stats = [
                'total_payments' => 0,
                'total_amount' => 0,
                'pending_payments' => 0,
                'pending_amount' => 0,
                'completed_payments' => 0,
                'completed_amount' => 0,
                'monthly_data' => [],
                'payment_methods' => []
            ];
            
            // Check if company_payments table exists
            $this->db->query("SHOW TABLES LIKE 'company_payments'");
            $company_payments_exists = !empty($this->db->resultSet());
            
            if ($company_payments_exists) {
                // Get total payments and amount
                $this->db->query("SELECT 
                                COUNT(*) as total_count, 
                                SUM(amount) as total_amount,
                                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
                                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_amount
                                FROM company_payments 
                                WHERE payment_date BETWEEN :date_from AND :date_to");
                
                $this->db->bind(':date_from', $date_from);
                $this->db->bind(':date_to', $date_to);
                
                $result = $this->db->single();
                
                if ($result) {
                    $stats['total_payments'] += (int)$result['total_count'];
                    $stats['total_amount'] += (float)$result['total_amount'];
                    $stats['pending_payments'] += (int)$result['pending_count'];
                    $stats['pending_amount'] += (float)$result['pending_amount'];
                    $stats['completed_payments'] += (int)$result['completed_count'];
                    $stats['completed_amount'] += (float)$result['completed_amount'];
                }
                
                // Get monthly data
                $this->db->query("SELECT 
                                DATE_FORMAT(payment_date, '%Y-%m') as month,
                                COUNT(*) as count,
                                SUM(amount) as amount
                                FROM company_payments 
                                WHERE payment_date BETWEEN :date_from AND :date_to
                                GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
                                ORDER BY month ASC");
                
                $this->db->bind(':date_from', $date_from);
                $this->db->bind(':date_to', $date_to);
                
                $monthly_data = $this->db->resultSet();
                
                if ($monthly_data) {
                    foreach ($monthly_data as $data) {
                        $stats['monthly_data'][$data['month']] = [
                            'count' => (int)$data['count'],
                            'amount' => (float)$data['amount']
                        ];
                    }
                }
            }
            
            // Check if payment_settlements table exists
            $this->db->query("SHOW TABLES LIKE 'payment_settlements'");
            $payment_settlements_exists = !empty($this->db->resultSet());
            
            if ($payment_settlements_exists) {
                // Get total payments and amount from payment_settlements
                $this->db->query("SELECT 
                                COUNT(*) as total_count, 
                                SUM(amount) as total_amount,
                                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
                                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_amount
                                FROM payment_settlements 
                                WHERE payment_date BETWEEN :date_from AND :date_to");
                
                $this->db->bind(':date_from', $date_from . ' 00:00:00');
                $this->db->bind(':date_to', $date_to . ' 23:59:59');
                
                $result = $this->db->single();
                
                if ($result) {
                    $stats['total_payments'] += (int)$result['total_count'];
                    $stats['total_amount'] += (float)$result['total_amount'];
                    $stats['pending_payments'] += (int)$result['pending_count'];
                    $stats['pending_amount'] += (float)$result['pending_amount'];
                    $stats['completed_payments'] += (int)$result['completed_count'];
                    $stats['completed_amount'] += (float)$result['completed_amount'];
                }
                
                // Get monthly data from payment_settlements
                $this->db->query("SELECT 
                                DATE_FORMAT(payment_date, '%Y-%m') as month,
                                COUNT(*) as count,
                                SUM(amount) as amount
                                FROM payment_settlements 
                                WHERE payment_date BETWEEN :date_from AND :date_to
                                GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
                                ORDER BY month ASC");
                
                $this->db->bind(':date_from', $date_from . ' 00:00:00');
                $this->db->bind(':date_to', $date_to . ' 23:59:59');
                
                $monthly_data = $this->db->resultSet();
                
                if ($monthly_data) {
                    foreach ($monthly_data as $data) {
                        if (isset($stats['monthly_data'][$data['month']])) {
                            $stats['monthly_data'][$data['month']]['count'] += (int)$data['count'];
                            $stats['monthly_data'][$data['month']]['amount'] += (float)$data['amount'];
                        } else {
                            $stats['monthly_data'][$data['month']] = [
                                'count' => (int)$data['count'],
                                'amount' => (float)$data['amount']
                            ];
                        }
                    }
                }
            }
            
            // Sort monthly data by month
            ksort($stats['monthly_data']);
            
            return $stats;
        } catch (Exception $e) {
            error_log("Error in getPaymentStatistics: " . $e->getMessage());
            return [
                'total_payments' => 0,
                'total_amount' => 0,
                'pending_payments' => 0,
                'pending_amount' => 0,
                'completed_payments' => 0,
                'completed_amount' => 0,
                'monthly_data' => [],
                'payment_methods' => []
            ];
        }
    }
    
    /**
     * Update daily order advance request status
     * @param int $request_id - Request ID
     * @param string $status - New status (approved, rejected)
     * @param string|null $remarks - Optional remarks
     * @return bool - True on success, false on failure
     */
    public function updateDailyOrderAdvanceStatus($request_id, $status, $remarks = null) {
        try {
            error_log("Updating daily order advance status: ID=$request_id, Status=$status");
            
            // Start transaction
            $this->db->beginTransaction();
            
            // Check if the request exists in payment_requests table
            $this->db->query("SELECT * FROM payment_requests WHERE id = :id");
            $this->db->bind(':id', $request_id);
            $request = $this->db->single();
            
            if (!$request) {
                error_log("Daily order advance request not found: ID=$request_id");
                $this->db->rollback();
                return false;
            }
            
            // Update the status - using only columns we know exist
            $this->db->query("UPDATE payment_requests SET 
                            status = :status, 
                            remarks = CONCAT(IFNULL(remarks, ''), '\nAdmin: ', :remarks),
                            response_date = NOW()
                            WHERE id = :id");
            
            $this->db->bind(':status', $status);
            $this->db->bind(':remarks', $remarks);
            $this->db->bind(':id', $request_id);
            
            if (!$this->db->execute()) {
                error_log("Failed to update daily order advance status: ID=$request_id");
                $this->db->rollback();
                return false;
            }
            
            // If approved, create a payment settlement record
            if ($status === 'approved') {
                try {
                    // Check if payment_settlements table exists
                    $this->db->query("SHOW TABLES LIKE 'payment_settlements'");
                    $table_exists = !empty($this->db->resultSet());
                    
                    if (!$table_exists) {
                        // Create the payment_settlements table
                        $this->db->query("CREATE TABLE IF NOT EXISTS `payment_settlements` (
                            `id` int(11) NOT NULL AUTO_INCREMENT,
                            `rider_id` int(11) NOT NULL,
                            `request_id` int(11) NOT NULL,
                            `amount` decimal(10,2) NOT NULL,
                            `payment_date` datetime NOT NULL,
                            `status` varchar(20) NOT NULL DEFAULT 'pending',
                            `remarks` text DEFAULT NULL,
                            `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            PRIMARY KEY (`id`),
                            KEY `rider_id` (`rider_id`),
                            KEY `request_id` (`request_id`)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                        $this->db->execute();
                        error_log("Created payment_settlements table");
                    }
                    
                    // Insert settlement record with data from the request
                    $this->db->query("INSERT INTO payment_settlements (
                                    rider_id, 
                                    request_id, 
                                    amount, 
                                    payment_date, 
                                    status, 
                                    remarks
                                ) VALUES (
                                    :rider_id, 
                                    :request_id, 
                                    :amount, 
                                    NOW(), 
                                    'pending', 
                                    :remarks
                                )");
                    
                    $this->db->bind(':rider_id', $request['rider_id']);
                    $this->db->bind(':request_id', $request_id);
                    $this->db->bind(':amount', $request['amount_requested']);
                    $this->db->bind(':remarks', "Approved daily order advance request #$request_id");
                    
                    if (!$this->db->execute()) {
                        error_log("Failed to create payment settlement record for daily order advance: ID=$request_id");
                        // Don't rollback the entire transaction if just the settlement creation fails
                        // We still want to update the status
                    } else {
                        error_log("Created payment settlement record for daily order advance: ID=$request_id");
                    }
                } catch (Exception $e) {
                    error_log("Error creating payment settlement: " . $e->getMessage());
                    // Continue with the approval process even if settlement creation fails
                }
            }
            
            // Commit the transaction
            $this->db->commit();
            error_log("Successfully updated daily order advance status: ID=$request_id, Status=$status");
            return true;
            
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollback();
            }
            error_log("Error in updateDailyOrderAdvanceStatus: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get a specific daily order advance request by ID
     * @param int $id - Request ID
     * @return array|false - Daily order advance request or false if not found
     */
    public function getDailyOrderAdvanceById($id) {
        try {
            $this->db->query("SELECT * FROM payment_requests WHERE id = :id");
            $this->db->bind(':id', $id);
            return $this->db->single();
        } catch (Exception $e) {
            error_log("Error in getDailyOrderAdvanceById: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get rider payment requests
     * @param int $rider_id - Rider ID
     * @param string|null $status - Filter by status (pending, approved, rejected) or null for all
     * @param string|null $start_date - Start date (YYYY-MM-DD) or null for all
     * @param string|null $end_date - End date (YYYY-MM-DD) or null for all
     * @return array - Array of payment requests
     */
    public function getRiderPaymentRequests($rider_id, $status = null, $start_date = null, $end_date = null) {
        try {
            // Check if payment_requests table exists
            $this->db->query("SHOW TABLES LIKE 'payment_requests'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                error_log("payment_requests table does not exist");
                return [];
            }
            
            // Build the SQL query
            $sql = "SELECT pr.*, c.company_name, s.supplier_name, u.full_name as approver_name 
                    FROM payment_requests pr 
                    LEFT JOIN companies c ON pr.company_id = c.id 
                    LEFT JOIN suppliers s ON pr.supplier_id = s.id
                    LEFT JOIN users u ON pr.approved_by = u.id 
                    WHERE pr.rider_id = :rider_id";
            
            // Add status filter if provided
            if ($status) {
                $sql .= " AND pr.status = :status";
            }
            
            // Add date range filter if provided
            if ($start_date && $end_date) {
                $sql .= " AND pr.request_date BETWEEN :start_date AND :end_date";
            }
            
            // Order by request_date desc
            $sql .= " ORDER BY pr.request_date DESC";
            
            // Prepare and execute the query
            $this->db->query($sql);
            
            // Bind parameters
            $this->db->bind(':rider_id', $rider_id);
            
            if ($status) {
                $this->db->bind(':status', $status);
            }
            
            if ($start_date && $end_date) {
                $this->db->bind(':start_date', $start_date . ' 00:00:00');
                $this->db->bind(':end_date', $end_date . ' 23:59:59');
            }
            
            // Get the results
            $results = $this->db->resultSet();
            
            return $results;
        } catch (Exception $e) {
            error_log("Error in getRiderPaymentRequests: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get a payment by ID
     * @param int $id - Payment ID
     * @return array|false - Payment data or false if not found
     */
    public function getPaymentById($id) {
        try {
            // First check if the payment exists in company_payments table
            $this->db->query("SELECT * FROM company_payments WHERE id = :id");
            $this->db->bind(':id', $id);
            $payment = $this->db->single();
            
            if ($payment) {
                return $payment;
            }
            
            // If not found in company_payments, check payment_settlements table
            $this->db->query("SELECT * FROM payment_settlements WHERE id = :id");
            $this->db->bind(':id', $id);
            $payment = $this->db->single();
            
            if ($payment) {
                return $payment;
            }
            
            // If not found in either table, return false
            return false;
        } catch (Exception $e) {
            error_log("Error in getPaymentById: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get a rider's payment by ID
     * @param int $payment_id - Payment ID
     * @param int $rider_id - Rider ID
     * @return array|false - Payment data or false if not found or not belonging to the rider
     */
    public function getRiderPaymentById($payment_id, $rider_id) {
        try {
            // First check if the payment exists in rider_payments table
            $this->db->query("SELECT * FROM rider_payments WHERE id = :id AND rider_id = :rider_id");
            $this->db->bind(':id', $payment_id);
            $this->db->bind(':rider_id', $rider_id);
            $payment = $this->db->single();
            
            if ($payment) {
                return $payment;
            }
            
            // If not found in rider_payments, check payment_settlements table
            $this->db->query("SELECT * FROM payment_settlements WHERE id = :id AND rider_id = :rider_id");
            $this->db->bind(':id', $payment_id);
            $this->db->bind(':rider_id', $rider_id);
            $payment = $this->db->single();
            
            if ($payment) {
                return $payment;
            }
            
            // If not found in either table, return false
            return false;
        } catch (Exception $e) {
            error_log("Error in getRiderPaymentById: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get weekly statement by date range
     * @param int $rider_id - Rider ID
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @return array|false - Weekly statement data or false if not found
     */
    public function getWeeklyStatementByDateRange($rider_id, $start_date, $end_date) {
        try {
            // Debug log
            error_log("Looking for weekly statement for rider ID: {$rider_id} from {$start_date} to {$end_date}");
            // First check if weekly_statements table exists and has data for this rider and week
            $this->db->query("SHOW TABLES LIKE 'weekly_statements'");
            $weekly_statements_exists = !empty($this->db->resultSet());
            
            if ($weekly_statements_exists) {
                // Get statement for this rider and week from weekly_statements
                $this->db->query("SELECT * FROM weekly_statements WHERE rider_id = :rider_id AND start_date = :start_date AND end_date = :end_date");
                $this->db->bind(':rider_id', $rider_id);
                $this->db->bind(':start_date', $start_date);
                $this->db->bind(':end_date', $end_date);
                $weekly_statement = $this->db->single();
                
                if ($weekly_statement) {
                    // Parse payment data if available
                    $payment_data = null;
                    if (isset($weekly_statement['payment_data']) && !empty($weekly_statement['payment_data'])) {
                        $payment_data = json_decode($weekly_statement['payment_data'], true);
                    }
                    
                    // Check if is_paid column exists
                    $is_paid = isset($weekly_statement['is_paid']) ? (int)$weekly_statement['is_paid'] : 0;
                    
                    // Check if paid_amount column exists
                    $paid_amount = isset($weekly_statement['paid_amount']) ? (float)$weekly_statement['paid_amount'] : 0;
                    
                    // If paid_amount is 0 but status is 'paid', use the net_amount or amount as paid_amount
                    if ($is_paid == 1 && $paid_amount == 0) {
                        $paid_amount = (float)($weekly_statement['net_amount'] ?? $weekly_statement['amount']);
                    }
                    
                    return [
                        'id' => $weekly_statement['id'],
                        'amount' => (float)$weekly_statement['amount'],
                        'payment_date' => $weekly_statement['payment_date'],
                        'status' => $weekly_statement['status'],
                        'is_paid' => $is_paid,
                        'paid_amount' => $paid_amount,
                        'company_name' => 'N/A', // Weekly statements don't have company name
                        'start_date' => $weekly_statement['start_date'],
                        'end_date' => $weekly_statement['end_date'],
                        'total_amount' => (float)$weekly_statement['amount'],
                        'commission_amount' => (float)($weekly_statement['commission_amount'] ?? 0),
                        'net_amount' => (float)($weekly_statement['net_amount'] ?? $weekly_statement['amount']),
                        'payment_reference' => $weekly_statement['payment_reference'] ?? '',
                        'remarks' => $weekly_statement['remarks'] ?? '',
                        'payment_data' => $payment_data
                    ];
                }
            }
            
            // If no weekly statement found, check rider_payments table
            $this->db->query("SHOW TABLES LIKE 'rider_payments'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                error_log("rider_payments table does not exist");
                return false;
            }
            
            // Query to get weekly payment for the rider within the date range
            $this->db->query("SELECT rp.*, cp.start_date, cp.end_date, cp.total_amount, 
                             cp.commission_amount, cp.net_amount, cp.status, cp.payment_date,
                             cp.payment_reference, cp.remarks, c.company_name
                             FROM rider_payments rp
                             LEFT JOIN company_payments cp ON rp.payment_id = cp.id
                             LEFT JOIN companies c ON rp.company_id = c.id
                             WHERE rp.rider_id = :rider_id 
                             AND (
                                 (cp.start_date <= :end_date AND cp.end_date >= :start_date)
                                 OR
                                 (rp.created_at BETWEEN :start_date_time AND :end_date_time)
                             )
                             ORDER BY rp.created_at DESC
                             LIMIT 1");
            
            // Debug the query
            error_log("SQL Query: SELECT rp.*, cp.start_date, cp.end_date, cp.total_amount, 
                      cp.commission_amount, cp.net_amount, cp.status, cp.payment_date,
                      cp.payment_reference, cp.remarks, c.company_name
                      FROM rider_payments rp
                      LEFT JOIN company_payments cp ON rp.payment_id = cp.id
                      LEFT JOIN companies c ON rp.company_id = c.id
                      WHERE rp.rider_id = {$rider_id} 
                      AND (
                          (cp.start_date <= '{$end_date}' AND cp.end_date >= '{$start_date}')
                          OR
                          (rp.created_at BETWEEN '{$start_date} 00:00:00' AND '{$end_date} 23:59:59')
                      )
                      ORDER BY rp.created_at DESC
                      LIMIT 1");
            
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':start_date', $start_date);
            $this->db->bind(':end_date', $end_date);
            $this->db->bind(':start_date_time', $start_date . ' 00:00:00');
            $this->db->bind(':end_date_time', $end_date . ' 23:59:59');
            
            $payment = $this->db->single();
            
            // Debug log
            if ($payment) {
                error_log("Found payment record for rider ID: {$rider_id}, payment ID: {$payment['id']}");
            } else {
                error_log("No payment record found for rider ID: {$rider_id} in the specified date range");
                return false;
            }
            
            // Parse payment data if available
            $payment_data = null;
            if (isset($payment['payment_data']) && !empty($payment['payment_data'])) {
                $payment_data = json_decode($payment['payment_data'], true);
            }
            
            // Extract amount from payment data if available
            $amount = isset($payment['amount']) ? (float)$payment['amount'] : 0;
            
            if ($amount == 0 && $payment_data) {
                // Try to find amount in payment data
                $amount_fields = [
                    'total_with_arrears', 'total_earnings', 'total', 'amount', 'earnings', 
                    'Total With Arrears', 'Total Earnings', 'Total', 'Amount', 'Earnings',
                    'pay_amount', 'payment_amount', 'Pay Amount', 'Payment Amount'
                ];
                
                foreach ($amount_fields as $field) {
                    if (isset($payment_data[$field]) && is_numeric($payment_data[$field])) {
                        $amount = (float)$payment_data[$field];
                        break;
                    }
                }
            }
            
            // Use net_amount from company_payments if available
            if (isset($payment['net_amount']) && $payment['net_amount'] > 0) {
                $amount = (float)$payment['net_amount'];
            }
            
            // Check if is_paid exists in the payment data
            $is_paid = isset($payment['is_paid']) ? (int)$payment['is_paid'] : 0;
            
            // If status is 'paid' but is_paid is not set, assume it's paid
            if (isset($payment['status']) && $payment['status'] === 'paid' && !isset($payment['is_paid'])) {
                $is_paid = 1;
            }
            
            // Check if paid_amount exists in the payment data
            $paid_amount = isset($payment['paid_amount']) ? (float)$payment['paid_amount'] : 0;
            
            // If paid_amount is 0 but status is 'paid', use the net_amount or amount as paid_amount
            if ($is_paid == 1 && $paid_amount == 0) {
                $paid_amount = isset($payment['net_amount']) ? (float)$payment['net_amount'] : $amount;
            }
            
            return [
                'id' => $payment['id'],
                'amount' => $amount,
                'payment_date' => $payment['payment_date'] ?? $payment['created_at'],
                'status' => $payment['status'] ?? 'pending',
                'is_paid' => $is_paid,
                'paid_amount' => $paid_amount,
                'company_name' => $payment['company_name'] ?? 'N/A',
                'start_date' => $payment['start_date'] ?? $start_date,
                'end_date' => $payment['end_date'] ?? $end_date,
                'total_amount' => isset($payment['total_amount']) ? (float)$payment['total_amount'] : $amount,
                'commission_amount' => isset($payment['commission_amount']) ? (float)$payment['commission_amount'] : 0,
                'net_amount' => isset($payment['net_amount']) ? (float)$payment['net_amount'] : $amount,
                'payment_reference' => $payment['payment_reference'] ?? '',
                'remarks' => $payment['remarks'] ?? '',
                'payment_data' => $payment_data
            ];
        } catch (Exception $e) {
            error_log("Error in getWeeklyStatementByDateRange: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Calculate total advance already requested for a rider within a date range
     * @param int $rider_id - Rider ID
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @param array $statuses - Array of statuses to include (default: ['pending', 'approved'])
     * @return float - Total amount already requested
     */
    public function getTotalAdvanceRequested($rider_id, $start_date, $end_date, $statuses = ['pending', 'approved']) {
        try {
            // Check if payment_requests table exists
            $this->db->query("SHOW TABLES LIKE 'payment_requests'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                return 0;
            }
            
            // Build the status condition
            $status_condition = "";
            if (!empty($statuses)) {
                $placeholders = implode(',', array_fill(0, count($statuses), '?'));
                $status_condition = " AND status IN ($placeholders)";
            }
            
            // Query to get total amount requested
            $sql = "SELECT COALESCE(SUM(amount_requested), 0) as total 
                    FROM payment_requests 
                    WHERE rider_id = ? 
                    AND request_date BETWEEN ? AND ?
                    $status_condition";
            
            // Prepare parameters
            $params = [$rider_id, $start_date . ' 00:00:00', $end_date . ' 23:59:59'];
            if (!empty($statuses)) {
                $params = array_merge($params, $statuses);
            }
            
            // Execute query
            $this->db->query($sql);
            foreach ($params as $index => $param) {
                $this->db->bind($index + 1, $param);
            }
            
            $result = $this->db->single();
            return (float)($result['total'] ?? 0);
        } catch (Exception $e) {
            error_log("Error in getTotalAdvanceRequested: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Get daily order advance requests
     * @param int|null $rider_id - Rider ID (optional)
     * @param string|null $status - Filter by status (pending, approved, rejected) or null for all
     * @return array - Array of daily order advance requests
     */
    public function getDailyOrderAdvanceRequests($rider_id = null, $status = null) {
        try {
            // First check if payment_requests table exists
            $this->db->query("SHOW TABLES LIKE 'payment_requests'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                // Create the payment_requests table if it doesn't exist
                $this->db->query("CREATE TABLE IF NOT EXISTS `payment_requests` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `rider_id` int(11) NOT NULL,
                    `supplier_id` int(11) DEFAULT NULL,
                    `order_date` date NOT NULL,
                    `total_earnings` decimal(10,2) NOT NULL DEFAULT 0.00,
                    `amount_requested` decimal(10,2) NOT NULL DEFAULT 0.00,
                    `request_date` date NOT NULL,
                    `status` varchar(20) NOT NULL DEFAULT 'pending',
                    `remarks` text DEFAULT NULL,
                    `is_daily_order` tinyint(1) NOT NULL DEFAULT 1,
                    `daily_order_id` int(11) DEFAULT NULL,
                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    KEY `rider_id` (`rider_id`),
                    KEY `order_date` (`order_date`),
                    KEY `status` (`status`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $this->db->execute();
                
                error_log("Created payment_requests table");
                
                // Return empty array since table was just created
                return [];
            }
            
            // Log the query for debugging
            error_log("Getting daily order advance requests for rider_id: " . ($rider_id ?? 'null'));
            
            // First check if the riders table has the full_name column
            $this->db->query("SHOW COLUMNS FROM riders LIKE 'full_name'");
            $full_name_exists = !empty($this->db->resultSet());
            
            // Check if payment_requests table has order_date column
            $this->db->query("SHOW COLUMNS FROM payment_requests LIKE 'order_date'");
            $order_date_exists = !empty($this->db->resultSet());
            
            // Build the query based on available columns
            $sql = "SELECT pr.id, pr.rider_id, pr.supplier_id, ";
            
            if ($order_date_exists) {
                $sql .= "pr.order_date, ";
            } else {
                $sql .= "DATE(pr.request_date) as order_date, ";
            }
            
            // Check if payment_requests table has total_earnings column
            $this->db->query("SHOW COLUMNS FROM payment_requests LIKE 'total_earnings'");
            $total_earnings_exists = !empty($this->db->resultSet());
            
            if ($total_earnings_exists) {
                $sql .= "pr.total_earnings, ";
            } else {
                $sql .= "0 as total_earnings, ";
            }
            
            $sql .= "pr.amount_requested, pr.request_date, 
                    pr.status, pr.remarks";
                    
            // Check if payment_requests table has is_daily_order column
            $this->db->query("SHOW COLUMNS FROM payment_requests LIKE 'is_daily_order'");
            $is_daily_order_exists = !empty($this->db->resultSet());
            
            if ($is_daily_order_exists) {
                $sql .= ", pr.is_daily_order";
            } else {
                $sql .= ", 1 as is_daily_order";
            }
            
            // Check if payment_requests table has daily_order_id column
            $this->db->query("SHOW COLUMNS FROM payment_requests LIKE 'daily_order_id'");
            $daily_order_id_exists = !empty($this->db->resultSet());
            
            if ($daily_order_id_exists) {
                $sql .= ", pr.daily_order_id";
            } else {
                $sql .= ", NULL as daily_order_id";
            }
            
            // Check if payment_requests table has created_at column
            $this->db->query("SHOW COLUMNS FROM payment_requests LIKE 'created_at'");
            $created_at_exists = !empty($this->db->resultSet());
            
            if ($created_at_exists) {
                $sql .= ", pr.created_at";
            } else {
                $sql .= ", pr.request_date as created_at";
            }
            
            // Check if payment_requests table has updated_at column
            $this->db->query("SHOW COLUMNS FROM payment_requests LIKE 'updated_at'");
            $updated_at_exists = !empty($this->db->resultSet());
            
            if ($updated_at_exists) {
                $sql .= ", pr.updated_at";
            } else {
                $sql .= ", pr.request_date as updated_at";
            }
            
            // Add rider name if the column exists
            if ($full_name_exists) {
                $sql .= ", r.full_name as rider_name";
            } else {
                $sql .= ", 'Unknown' as rider_name";
            }
            
            // Check if suppliers table has name column
            $this->db->query("SHOW COLUMNS FROM suppliers LIKE 'name'");
            $supplier_name_exists = !empty($this->db->resultSet());
            
            if ($supplier_name_exists) {
                $sql .= ", s.name as supplier_name";
            } else {
                $sql .= ", 'Unknown' as supplier_name";
            }
            
            // Check if daily_rider_orders table exists
            $this->db->query("SHOW TABLES LIKE 'daily_rider_orders'");
            $daily_rider_orders_exists = !empty($this->db->resultSet());
            
            // Check if payment_requests table has daily_order_id column
            $this->db->query("SHOW COLUMNS FROM payment_requests LIKE 'daily_order_id'");
            $daily_order_id_exists = !empty($this->db->resultSet());
            
            if ($daily_rider_orders_exists && $daily_order_id_exists) {
                // Add remaining fields if daily_rider_orders table exists and daily_order_id column exists
                $sql .= ", dro.order_count, dro.per_order_amount, dro.total_earning,
                        dro.order_date as daily_order_date, c.company_name, cs.store_name
                        FROM payment_requests pr
                        LEFT JOIN riders r ON pr.rider_id = r.id
                        LEFT JOIN suppliers s ON pr.supplier_id = s.id
                        LEFT JOIN daily_rider_orders dro ON pr.daily_order_id = dro.id
                        LEFT JOIN companies c ON dro.company_id = c.id
                        LEFT JOIN company_stores cs ON dro.store_id = cs.id
                        WHERE 1=1";
            } else {
                // Simplified query if daily_rider_orders table doesn't exist or daily_order_id column doesn't exist
                $sql .= ", NULL as order_count, NULL as per_order_amount, NULL as total_earning,
                        NULL as daily_order_date, NULL as company_name, NULL as store_name
                        FROM payment_requests pr
                        LEFT JOIN riders r ON pr.rider_id = r.id
                        LEFT JOIN suppliers s ON pr.supplier_id = s.id
                        WHERE 1=1";
            }
            
            // Check if payment_requests table has is_daily_order column
            if ($is_daily_order_exists) {
                $sql .= " AND pr.is_daily_order = 1";
            }
            
            if ($rider_id) {
                $sql .= " AND pr.rider_id = :rider_id";
            }
            
            if ($status) {
                $sql .= " AND pr.status = :status";
            }
            
            $sql .= " ORDER BY pr.request_date DESC";
            
            $this->db->query($sql);
            
            if ($rider_id) {
                $this->db->bind(':rider_id', $rider_id);
            }
            
            if ($status) {
                $this->db->bind(':status', $status);
            }
            
            $results = $this->db->resultSet();
            error_log("Found " . count($results) . " daily order advance requests");
            
            return $results;
        } catch (Exception $e) {
            error_log("Error in getDailyOrderAdvanceRequests: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Count pending payment requests
     * @return int - Number of pending payment requests
     */
    public function countPendingPaymentRequests() {
        try {
            $this->db->query("SELECT COUNT(*) as total FROM rider_payment_requests WHERE status = 'pending'");
            $result = $this->db->single();
            return (int)($result['total'] ?? 0);
        } catch (Exception $e) {
            error_log("Error in countPendingPaymentRequests: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Get earnings by date
     * @param string $date - Date in Y-m-d format
     * @return float - Earnings for the specified date
     */
    public function getEarningsByDate($date) {
        $this->db->query("SELECT SUM(total_earnings) as total FROM orders WHERE order_date = :date");
        $this->db->bind(':date', $date);
        $result = $this->db->single();
        return (float)($result['total'] ?? 0);
    }
    
    /**
     * Get total earnings from all orders
     * @return float - Total earnings
     */
    public function getTotalEarnings() {
        $this->db->query("SELECT SUM(total_earnings) as total FROM orders");
        $result = $this->db->single();
        return (float)($result['total'] ?? 0);
    }
    
    /**
     * Get total rider earnings
     * @return float - Total rider earnings
     */
    public function getTotalRiderEarnings() {
        $this->db->query("SELECT SUM(actual_amount) as total FROM rider_earnings WHERE is_finalized = 1");
        $result = $this->db->single();
        return (float)($result['total'] ?? 0);
    }
    
    /**
     * Get total company earnings
     * @return float - Total company earnings
     */
    public function getTotalCompanyEarnings() {
        $this->db->query("SELECT SUM(amount) as total FROM company_payments WHERE status = 'completed'");
        $result = $this->db->single();
        return (float)($result['total'] ?? 0);
    }
    
    /**
     * Get all payments with optional filters
     * @param int|null $company_id - Company ID filter (optional)
     * @param string|null $status - Payment status filter (optional)
     * @param string|null $mapping_status - Mapping status filter (optional)
     * @param string|null $start_date - Start date filter (optional)
     * @param string|null $end_date - End date filter (optional)
     * @return array - Array of payments
     */
    public function getAllPayments($company_id = null, $status = null, $mapping_status = null, $start_date = null, $end_date = null) {
        try {
            // Start building the query
            $sql = "SELECT cp.*, c.company_name 
                    FROM company_payments cp 
                    JOIN companies c ON cp.company_id = c.id 
                    WHERE 1=1";
            
            $params = [];
            
            // Add filters if provided
            if ($company_id) {
                $sql .= " AND cp.company_id = :company_id";
                $params[':company_id'] = $company_id;
            }
            
            if ($status) {
                $sql .= " AND cp.status = :status";
                $params[':status'] = $status;
            }
            
            if ($mapping_status) {
                $sql .= " AND cp.mapping_status = :mapping_status";
                $params[':mapping_status'] = $mapping_status;
            }
            
            if ($start_date) {
                $sql .= " AND cp.payment_date >= :start_date";
                $params[':start_date'] = $start_date;
            }
            
            if ($end_date) {
                $sql .= " AND cp.payment_date <= :end_date";
                $params[':end_date'] = $end_date;
            }
            
            // Add order by
            $sql .= " ORDER BY cp.id DESC";
            
            $this->db->query($sql);
            
            // Bind parameters
            foreach ($params as $param => $value) {
                $this->db->bind($param, $value);
            }
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getAllPayments: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get payment statistics
     * @return array - Array of payment statistics
     */
    public function getPaymentStats() {
        try {
            $stats = [
                'total' => 0,
                'pending' => 0,
                'processing' => 0,
                'completed' => 0,
                'rejected' => 0,
                'published' => 0,
                'unmapped' => 0,
                'mapping_in_progress' => 0,
                'mapped' => 0,
                'total_amount' => 0,
                'pending_amount' => 0,
                'processing_amount' => 0,
                'completed_amount' => 0,
                'rejected_amount' => 0
            ];
            
            // Get total count and amount
            $this->db->query("SELECT COUNT(*) as count, SUM(amount) as total_amount FROM company_payments");
            $result = $this->db->single();
            $stats['total'] = (int)($result['count'] ?? 0);
            $stats['total_amount'] = (float)($result['total_amount'] ?? 0);
            
            // Get counts and amounts by status
            $this->db->query("SELECT status, COUNT(*) as count, SUM(amount) as total_amount FROM company_payments GROUP BY status");
            $results = $this->db->resultSet();
            
            foreach ($results as $row) {
                $status = $row['status'];
                $count = (int)$row['count'];
                $amount = (float)($row['total_amount'] ?? 0);
                
                if (isset($stats[$status])) {
                    $stats[$status] = $count;
                    $stats[$status . '_amount'] = $amount;
                }
            }
            
            // Get counts by mapping status
            $this->db->query("SELECT mapping_status, COUNT(*) as count FROM company_payments GROUP BY mapping_status");
            $results = $this->db->resultSet();
            
            foreach ($results as $row) {
                $status = $row['mapping_status'];
                $count = (int)$row['count'];
                
                if (isset($stats[$status])) {
                    $stats[$status] = $count;
                }
            }
            
            return $stats;
        } catch (Exception $e) {
            error_log("Error in getPaymentStats: " . $e->getMessage());
            return [
                'total' => 0,
                'pending' => 0,
                'processing' => 0,
                'completed' => 0,
                'rejected' => 0,
                'published' => 0,
                'unmapped' => 0,
                'mapping_in_progress' => 0,
                'mapped' => 0,
                'total_amount' => 0,
                'pending_amount' => 0,
                'processing_amount' => 0,
                'completed_amount' => 0,
                'rejected_amount' => 0
            ];
        }
    }
    
    /**
     * Get company payments
     * @param int $company_id - Company ID
     * @param string $status - Payment status filter (optional)
     * @param string $start_date - Start date filter (optional)
     * @param string $end_date - End date filter (optional)
     * @return array - Array of company payments
     */
    public function getCompanyPayments($company_id, $status = '', $start_date = null, $end_date = null) {
        $sql = "SELECT * FROM company_payments WHERE company_id = :company_id";
        $params = [':company_id' => $company_id];
        
        if (!empty($status)) {
            $sql .= " AND status = :status";
            $params[':status'] = $status;
        }
        
        if ($start_date) {
            $sql .= " AND payment_date >= :start_date";
            $params[':start_date'] = $start_date;
        }
        
        if ($end_date) {
            $sql .= " AND payment_date <= :end_date";
            $params[':end_date'] = $end_date;
        }
        
        $sql .= " ORDER BY payment_date DESC";
        
        $this->db->query($sql);
        
        foreach ($params as $param => $value) {
            $this->db->bind($param, $value);
        }
        
        return $this->db->resultSet();
    }
    
    /**
     * Get company pending payments
     * @param int $company_id - Company ID
     * @return array - Array of pending payments for the company
     */
    public function getCompanyPendingPayments($company_id) {
        try {
            $this->db->query("SELECT * FROM company_payments 
                            WHERE company_id = :company_id 
                            AND status = 'pending'
                            ORDER BY payment_date DESC");
            
            $this->db->bind(':company_id', $company_id);
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getCompanyPendingPayments: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get store payments
     * @param int $store_id - Store ID
     * @param string $status - Payment status filter (optional)
     * @param string $start_date - Start date filter (optional)
     * @param string $end_date - End date filter (optional)
     * @return array - Array of store payments
     */
    public function getStorePayments($store_id, $status = '', $start_date = null, $end_date = null) {
        try {
            $sql = "SELECT p.*, o.store_id, o.order_date, r.id as rider_id, u.full_name as rider_name 
                    FROM payments p
                    JOIN orders o ON p.order_id = o.id
                    JOIN riders r ON o.rider_id = r.id
                    JOIN users u ON r.user_id = u.id
                    WHERE o.store_id = :store_id";
            
            $params = [':store_id' => $store_id];
            
            if (!empty($status)) {
                $sql .= " AND p.status = :status";
                $params[':status'] = $status;
            }
            
            if ($start_date) {
                $sql .= " AND o.order_date >= :start_date";
                $params[':start_date'] = $start_date;
            }
            
            if ($end_date) {
                $sql .= " AND o.order_date <= :end_date";
                $params[':end_date'] = $end_date;
            }
            
            $sql .= " ORDER BY o.order_date DESC";
            
            $this->db->query($sql);
            
            foreach ($params as $param => $value) {
                $this->db->bind($param, $value);
            }
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getStorePayments: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get store pending payments
     * @param int $store_id - Store ID
     * @return array - Array of pending payments
     */
    public function getStorePendingPayments($store_id) {
        return $this->getStorePayments($store_id, 'pending');
    }
    
    /**
     * Get rider payments by store
     * @param int $rider_id - Rider ID
     * @param int $store_id - Store ID
     * @param string $status - Payment status filter (optional)
     * @param string $start_date - Start date filter (optional)
     * @param string $end_date - End date filter (optional)
     * @return array - Array of rider payments for a specific store
     */
    public function getRiderPaymentsByStore($rider_id, $store_id, $status = '', $start_date = null, $end_date = null) {
        try {
            $sql = "SELECT p.*, o.store_id, o.order_date, r.id as rider_id, u.full_name as rider_name 
                    FROM payments p
                    JOIN orders o ON p.order_id = o.id
                    JOIN riders r ON o.rider_id = r.id
                    JOIN users u ON r.user_id = u.id
                    WHERE o.store_id = :store_id
                    AND o.rider_id = :rider_id";
            
            $params = [
                ':store_id' => $store_id,
                ':rider_id' => $rider_id
            ];
            
            if (!empty($status)) {
                $sql .= " AND p.status = :status";
                $params[':status'] = $status;
            }
            
            if ($start_date) {
                $sql .= " AND o.order_date >= :start_date";
                $params[':start_date'] = $start_date;
            }
            
            if ($end_date) {
                $sql .= " AND o.order_date <= :end_date";
                $params[':end_date'] = $end_date;
            }
            
            $sql .= " ORDER BY o.order_date DESC";
            
            $this->db->query($sql);
            
            foreach ($params as $param => $value) {
                $this->db->bind($param, $value);
            }
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getRiderPaymentsByStore: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get rider pending payments by store
     * @param int $rider_id - Rider ID
     * @param int $store_id - Store ID
     * @return array - Array of pending payments
     */
    public function getRiderPendingPaymentsByStore($rider_id, $store_id) {
        return $this->getRiderPaymentsByStore($rider_id, $store_id, 'pending');
    }
    
    /**
     * Get rider payment requests from rider_payment_requests table
     * @param int $rider_id - Rider ID
     * @param string|null $status - Filter by status (pending, approved, rejected) or null for all
     * @return array - Array of payment requests
     */
    public function getRiderDirectPaymentRequests($rider_id, $status = null) {
        try {
            // Check if the rider_remarks column exists in the table
            $this->db->query("SHOW COLUMNS FROM rider_payment_requests LIKE 'rider_remarks'");
            $rider_remarks_exists = !empty($this->db->resultSet());
            
            // If rider_remarks column doesn't exist, add it
            if (!$rider_remarks_exists) {
                $this->db->query("ALTER TABLE rider_payment_requests ADD COLUMN rider_remarks TEXT DEFAULT NULL AFTER rider_approval_date");
                $this->db->execute();
            }
            
            $sql = "SELECT rpr.*, s.company_name as supplier_name 
                    FROM rider_payment_requests rpr
                    JOIN suppliers s ON rpr.supplier_id = s.id
                    WHERE rpr.rider_id = :rider_id";
            
            $params = [':rider_id' => $rider_id];
            
            if ($status) {
                $sql .= " AND rpr.status = :status";
                $params[':status'] = $status;
            }
            
            $sql .= " ORDER BY rpr.created_at DESC";
            
            $this->db->query($sql);
            
            foreach ($params as $param => $value) {
                $this->db->bind($param, $value);
            }
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getRiderDirectPaymentRequests: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Check if rider has an advance request for a specific date
     * @param int $rider_id - Rider ID
     * @param string $order_date - Order date in Y-m-d format
     * @return bool - True if rider has an advance request for the date, false otherwise
     */
    public function hasAdvanceRequestForDate($rider_id, $order_date) {
        try {
            error_log("Checking if rider $rider_id has advance request for date $order_date");
            
            // First check rider_payment_requests table
            $this->db->query("SELECT COUNT(*) as count 
                            FROM rider_payment_requests 
                            WHERE rider_id = :rider_id 
                            AND order_date = :order_date 
                            AND is_advance = 1
                            AND status IN ('pending', 'approved')");
            
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':order_date', $order_date);
            
            $result1 = $this->db->single();
            $count1 = (int)($result1['count'] ?? 0);
            
            error_log("Found $count1 requests in rider_payment_requests table");
            
            // Check if payment_requests table exists
            $this->db->query("SHOW TABLES LIKE 'payment_requests'");
            $payment_requests_exists = !empty($this->db->resultSet());
            
            $count2 = 0;
            if ($payment_requests_exists) {
                // Check if payment_requests table has order_date column
                $this->db->query("SHOW COLUMNS FROM payment_requests LIKE 'order_date'");
                $order_date_exists = !empty($this->db->resultSet());
                
                if ($order_date_exists) {
                    // Then check payment_requests table with order_date
                    $this->db->query("SELECT COUNT(*) as count 
                                    FROM payment_requests 
                                    WHERE rider_id = :rider_id 
                                    AND order_date = :order_date 
                                    AND status IN ('pending', 'approved')");
                    
                    $this->db->bind(':rider_id', $rider_id);
                    $this->db->bind(':order_date', $order_date);
                } else {
                    // Just check by rider_id and status
                    $this->db->query("SELECT COUNT(*) as count 
                                    FROM payment_requests 
                                    WHERE rider_id = :rider_id 
                                    AND DATE(request_date) = :order_date
                                    AND status IN ('pending', 'approved')");
                    
                    $this->db->bind(':rider_id', $rider_id);
                    $this->db->bind(':order_date', $order_date);
                }
                
                $result2 = $this->db->single();
                $count2 = (int)($result2['count'] ?? 0);
                
                error_log("Found $count2 requests in payment_requests table");
            }
            
            // Return true if either table has a matching request
            return ($count1 > 0 || $count2 > 0);
        } catch (Exception $e) {
            error_log("Error in hasAdvanceRequestForDate: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Check if rider has an advance request for a specific daily order
     * @param int $rider_id - Rider ID
     * @param int $daily_order_id - Daily order ID
     * @return bool - True if rider has an advance request for the order, false otherwise
     */
    public function hasAdvanceRequestForDailyOrder($rider_id, $daily_order_id) {
        try {
            error_log("Checking if rider $rider_id has advance request for daily order $daily_order_id");
            
            // First check rider_payment_requests table
            $this->db->query("SELECT COUNT(*) as count 
                            FROM rider_payment_requests 
                            WHERE rider_id = :rider_id 
                            AND daily_order_id = :daily_order_id 
                            AND is_advance = 1
                            AND status IN ('pending', 'approved')");
            
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':daily_order_id', $daily_order_id);
            
            $result1 = $this->db->single();
            $count1 = (int)($result1['count'] ?? 0);
            
            error_log("Found $count1 requests in rider_payment_requests table");
            
            // Check if payment_requests table exists
            $this->db->query("SHOW TABLES LIKE 'payment_requests'");
            $payment_requests_exists = !empty($this->db->resultSet());
            
            $count2 = 0;
            if ($payment_requests_exists) {
                // Check if payment_requests table has daily_order_id column
                $this->db->query("SHOW COLUMNS FROM payment_requests LIKE 'daily_order_id'");
                $daily_order_id_exists = !empty($this->db->resultSet());
                
                if ($daily_order_id_exists) {
                    // Then check payment_requests table with daily_order_id
                    $this->db->query("SELECT COUNT(*) as count 
                                    FROM payment_requests 
                                    WHERE rider_id = :rider_id 
                                    AND daily_order_id = :daily_order_id 
                                    AND status IN ('pending', 'approved')");
                    
                    $this->db->bind(':rider_id', $rider_id);
                    $this->db->bind(':daily_order_id', $daily_order_id);
                    
                    $result2 = $this->db->single();
                    $count2 = (int)($result2['count'] ?? 0);
                    
                    error_log("Found $count2 requests in payment_requests table");
                }
            }
            
            // Return true if either table has a matching request
            return ($count1 > 0 || $count2 > 0);
        } catch (Exception $e) {
            error_log("Error in hasAdvanceRequestForDailyOrder: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get total advance already requested for a specific daily order
     * @param int $rider_id - Rider ID
     * @param int $daily_order_id - Daily order ID
     * @return float - Total amount already requested
     */
    public function getTotalAdvanceRequestedForDailyOrder($rider_id, $daily_order_id) {
        try {
            error_log("Getting total advance requested for rider $rider_id and daily order $daily_order_id");
            
            $total = 0;
            
            // First check rider_payment_requests table
            $this->db->query("SELECT COALESCE(SUM(amount_requested), 0) as total 
                            FROM rider_payment_requests 
                            WHERE rider_id = :rider_id 
                            AND daily_order_id = :daily_order_id 
                            AND is_advance = 1
                            AND status IN ('pending', 'approved')");
            
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':daily_order_id', $daily_order_id);
            
            $result1 = $this->db->single();
            $total1 = (float)($result1['total'] ?? 0);
            
            error_log("Found ₹$total1 in rider_payment_requests table for daily_order_id=$daily_order_id");
            
            // Check if payment_requests table exists
            $this->db->query("SHOW TABLES LIKE 'payment_requests'");
            $payment_requests_exists = !empty($this->db->resultSet());
            
            $total2 = 0;
            if ($payment_requests_exists) {
                // Check if payment_requests table has daily_order_id column
                $this->db->query("SHOW COLUMNS FROM payment_requests LIKE 'daily_order_id'");
                $daily_order_id_exists = !empty($this->db->resultSet());
                
                if ($daily_order_id_exists) {
                    // Then check payment_requests table with daily_order_id
                    $this->db->query("SELECT COALESCE(SUM(amount_requested), 0) as total 
                                    FROM payment_requests 
                                    WHERE rider_id = :rider_id 
                                    AND daily_order_id = :daily_order_id 
                                    AND status IN ('pending', 'approved')");
                    
                    $this->db->bind(':rider_id', $rider_id);
                    $this->db->bind(':daily_order_id', $daily_order_id);
                    
                    $result2 = $this->db->single();
                    $total2 = (float)($result2['total'] ?? 0);
                    
                    error_log("Found ₹$total2 in payment_requests table for daily_order_id=$daily_order_id");
                }
            }
            
            // Return the sum of both tables
            $total = $total1 + $total2;
            error_log("Total advance requested for daily_order_id=$daily_order_id: ₹$total");
            
            // Ensure we return a valid float value
            return is_numeric($total) ? (float)$total : 0;
        } catch (Exception $e) {
            error_log("Error in getTotalAdvanceRequestedForDailyOrder: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Create advance payment request
     * @param int $rider_id - Rider ID
     * @param int $supplier_id - Supplier ID
     * @param string $order_date - Order date in Y-m-d format
     * @param float $total_earnings - Total earnings
     * @param float $amount_requested - Amount requested
     * @param string $remarks - Optional remarks
     * @param bool $is_daily_order - Whether this is a daily order request
     * @param int|array|null $daily_order_ids - Daily order ID(s) (if applicable)
     * @return bool|string - True on success, error message on failure
     */
    public function createAdvanceRequest($rider_id, $supplier_id, $order_date, $total_earnings, $amount_requested, $remarks = '', $is_daily_order = false, $daily_order_ids = null) {
        try {
            error_log("Creating advance request for rider_id: $rider_id, order_date: $order_date, amount: $amount_requested, is_daily_order: " . ($is_daily_order ? 'true' : 'false'));
            
            // Get the start and end date of the current week (using 30 days as in the UI)
            $current_date = new DateTime($order_date);
            $start_of_week = clone $current_date;
            $start_of_week->modify('-30 days');
            $end_of_week = clone $current_date;
            
            error_log("Checking advance limits for rider $rider_id from {$start_of_week->format('Y-m-d')} to {$end_of_week->format('Y-m-d')}");
            
            // Get total earnings for the week
            $this->db->query("SELECT COALESCE(SUM(total_earning), 0) as total 
                             FROM daily_rider_orders 
                             WHERE rider_id = :rider_id 
                             AND order_date BETWEEN :start_date AND :end_date");
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':start_date', $start_of_week->format('Y-m-d'));
            $this->db->bind(':end_date', $end_of_week->format('Y-m-d'));
            
            $result = $this->db->single();
            $total_weekly_earnings = (float)($result['total'] ?? 0);
            
            // Calculate maximum allowable advance (70% of total earnings)
            $max_advance = $total_weekly_earnings * 0.7;
            
            // Get total advance already requested for this week
            $total_advance_requested = $this->getTotalAdvanceRequested($rider_id, $start_of_week->format('Y-m-d'), $end_of_week->format('Y-m-d'));
            
            // Calculate remaining eligible advance
            $remaining_advance = max(0, $max_advance - $total_advance_requested);
            
            error_log("Total weekly earnings: $total_weekly_earnings");
            error_log("Max advance (70%): $max_advance");
            error_log("Total advance requested: $total_advance_requested");
            error_log("Remaining advance: $remaining_advance");
            
            // Validate amount requested
            if ($amount_requested <= 0) {
                return "Amount requested must be greater than zero.";
            }
            
            if ($amount_requested > $remaining_advance) {
                return "Amount requested (₹" . number_format($amount_requested, 2) . ") exceeds the maximum allowable advance (₹" . number_format($remaining_advance, 2) . ").";
            }
            
            // Start transaction
            $this->db->beginTransaction();
            
            // Check if payment_requests table exists
            $this->db->query("SHOW TABLES LIKE 'payment_requests'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                // Create the payment_requests table if it doesn't exist
                $this->db->query("CREATE TABLE IF NOT EXISTS `payment_requests` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `rider_id` int(11) NOT NULL,
                    `supplier_id` int(11) DEFAULT NULL,
                    `order_date` date NOT NULL,
                    `total_earnings` decimal(10,2) NOT NULL DEFAULT 0.00,
                    `amount_requested` decimal(10,2) NOT NULL DEFAULT 0.00,
                    `request_date` date NOT NULL,
                    `status` varchar(20) NOT NULL DEFAULT 'pending',
                    `remarks` text DEFAULT NULL,
                    `is_daily_order` tinyint(1) NOT NULL DEFAULT 1,
                    `daily_order_ids` text DEFAULT NULL,
                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    KEY `rider_id` (`rider_id`),
                    KEY `order_date` (`order_date`),
                    KEY `status` (`status`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $this->db->execute();
                
                error_log("Created payment_requests table");
            }
            
            // Insert into payment_requests table
            $this->db->query("INSERT INTO payment_requests (
                            rider_id,
                            supplier_id,
                            order_date,
                            total_earnings,
                            amount_requested,
                            request_date,
                            status,
                            remarks,
                            is_daily_order,
                            daily_order_ids
                        ) VALUES (
                            :rider_id,
                            :supplier_id,
                            :order_date,
                            :total_earnings,
                            :amount_requested,
                            NOW(),
                            'pending',
                            :remarks,
                            :is_daily_order,
                            :daily_order_ids
                        )");
            
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':supplier_id', $supplier_id);
            $this->db->bind(':order_date', $order_date);
            $this->db->bind(':total_earnings', $total_earnings);
            $this->db->bind(':amount_requested', $amount_requested);
            $this->db->bind(':remarks', $remarks);
            $this->db->bind(':is_daily_order', $is_daily_order ? 1 : 0);
            $this->db->bind(':daily_order_ids', is_array($daily_order_ids) ? implode(',', $daily_order_ids) : $daily_order_ids);
            
            $result = $this->db->execute();
            
            if ($result) {
                $this->db->commit();
                error_log("Advance request created successfully");
                return true;
            } else {
                $this->db->rollback();
                error_log("Failed to create advance request");
                return "Failed to create advance request";
            }
        } catch (Exception $e) {
            // Only rollback if a transaction is active
            try {
                if ($this->db->inTransaction()) {
                    $this->db->rollback();
                }
            } catch (Exception $rollbackException) {
                // Ignore rollback exceptions
                error_log("Rollback error in createAdvanceRequest: " . $rollbackException->getMessage());
            }
            
            error_log("Error in createAdvanceRequest: " . $e->getMessage());
            return "Database error: " . $e->getMessage();
        }
    }
    
    /**
     * Update payment status
     * @param int $id - Payment ID
     * @param string $status - New status
     * @return bool - True on success, false on failure
     */
    public function updatePaymentStatus($id, $status) {
        try {
            $this->db->query("UPDATE company_payments SET status = :status, updated_at = NOW() WHERE id = :id");
            $this->db->bind(':status', $status);
            $this->db->bind(':id', $id);
            return $this->db->execute();
        } catch (Exception $e) {
            error_log("Error in updatePaymentStatus: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Update payment request status
     * @param int $request_id - Payment request ID
     * @param string $status - New status (approved, rejected)
     * @param string|null $remarks - Optional remarks
     * @return bool - True on success, false on failure
     */
    public function updatePaymentRequestStatus($request_id, $status, $remarks = null) {
        try {
            error_log("Updating payment request status: ID=$request_id, Status=$status");
            
            // Start transaction
            $this->db->beginTransaction();
            
            // First, determine which table the request is in
            $this->db->query("SELECT * FROM rider_payment_requests WHERE id = :id");
            $this->db->bind(':id', $request_id);
            $request1 = $this->db->single();
            
            $this->db->query("SELECT * FROM payment_requests WHERE id = :id");
            $this->db->bind(':id', $request_id);
            $request2 = $this->db->single();
            
            $updated = false;
            
            // Update in rider_payment_requests if found
            if ($request1) {
                error_log("Updating request in rider_payment_requests table");
                
                $this->db->query("UPDATE rider_payment_requests SET 
                                status = :status, 
                                admin_remarks = :remarks,
                                admin_approval_date = NOW(),
                                updated_at = NOW() 
                                WHERE id = :id");
                $this->db->bind(':status', $status);
                $this->db->bind(':remarks', $remarks);
                $this->db->bind(':id', $request_id);
                
                if ($this->db->execute()) {
                    $updated = true;
                    error_log("Updated rider_payment_requests record");
                }
            }
            
            // Update in payment_requests if found
            if ($request2) {
                error_log("Updating request in payment_requests table");
                
                $this->db->query("UPDATE payment_requests SET 
                                status = :status, 
                                remarks = CONCAT(IFNULL(remarks, ''), '\nAdmin: ', :remarks),
                                updated_at = NOW() 
                                WHERE id = :id");
                $this->db->bind(':status', $status);
                $this->db->bind(':remarks', $remarks);
                $this->db->bind(':id', $request_id);
                
                if ($this->db->execute()) {
                    $updated = true;
                    error_log("Updated payment_requests record");
                }
            }
            
            // If status is approved, create a payment settlement record
            if ($status === 'approved' && ($request1 || $request2)) {
                $request = $request1 ?? $request2;
                
                // Check if payment_settlements table exists
                $this->db->query("SHOW TABLES LIKE 'payment_settlements'");
                $table_exists = !empty($this->db->resultSet());
                
                if (!$table_exists) {
                    // Create the payment_settlements table
                    $this->db->query("CREATE TABLE IF NOT EXISTS `payment_settlements` (
                        `id` int(11) NOT NULL AUTO_INCREMENT,
                        `rider_id` int(11) NOT NULL,
                        `request_id` int(11) NOT NULL,
                        `amount` decimal(10,2) NOT NULL,
                        `payment_date` datetime NOT NULL,
                        `status` varchar(20) NOT NULL DEFAULT 'pending',
                        `remarks` text DEFAULT NULL,
                        `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        PRIMARY KEY (`id`),
                        KEY `rider_id` (`rider_id`),
                        KEY `request_id` (`request_id`)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                    $this->db->execute();
                    error_log("Created payment_settlements table");
                }
                
                // Insert settlement record
                $this->db->query("INSERT INTO payment_settlements (
                                rider_id, 
                                request_id, 
                                amount, 
                                payment_date, 
                                status, 
                                remarks, 
                                created_at
                            ) VALUES (
                                :rider_id, 
                                :request_id, 
                                :amount, 
                                NOW(), 
                                'pending', 
                                :remarks, 
                                NOW()
                            )");
                
                $this->db->bind(':rider_id', $request['rider_id']);
                $this->db->bind(':request_id', $request_id);
                $this->db->bind(':amount', $request['amount_requested']);
                $this->db->bind(':remarks', "Approved payment request #$request_id");
                
                if ($this->db->execute()) {
                    error_log("Created payment settlement record");
                } else {
                    error_log("Failed to create payment settlement record");
                    $this->db->rollback();
                    return false;
                }
            }
            
            if ($updated) {
                $this->db->commit();
                return true;
            } else {
                $this->db->rollback();
                error_log("Payment request not found in either table");
                return false;
            }
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollback();
            }
            error_log("Error in updatePaymentRequestStatus: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get all payment requests with advanced filtering
     * @param string|null $status - Filter by status (pending, approved, rejected) or null for all
     * @param bool $advance_only - If true, only return advance requests
     * @param bool $daily_orders_only - If true, only return daily order requests
     * @return array - Array of payment requests
     */
    public function getAllPaymentRequestsAdvanced($status = null, $advance_only = false, $daily_orders_only = false) {
        try {
            // First, check if there are any records in the rider_payment_requests table
            $this->db->query("SELECT COUNT(*) as count FROM rider_payment_requests");
            $count = $this->db->single();
            error_log("Total records in rider_payment_requests: " . ($count['count'] ?? 0));
            
            // Check if the required tables and columns exist
            $this->db->query("SHOW TABLES LIKE 'rider_payment_requests'");
            $table_exists = !empty($this->db->resultSet());
            if (!$table_exists) {
                error_log("rider_payment_requests table does not exist");
                return [];
            }
            
            // Check if the required columns exist
            $this->db->query("SHOW COLUMNS FROM rider_payment_requests LIKE 'rider_id'");
            $rider_id_exists = !empty($this->db->resultSet());
            if (!$rider_id_exists) {
                error_log("rider_id column does not exist in rider_payment_requests table");
                return [];
            }
            
            $this->db->query("SHOW COLUMNS FROM rider_payment_requests LIKE 'supplier_id'");
            $supplier_id_exists = !empty($this->db->resultSet());
            if (!$supplier_id_exists) {
                error_log("supplier_id column does not exist in rider_payment_requests table");
                return [];
            }
            
            // Check if the required tables exist
            $this->db->query("SHOW TABLES LIKE 'riders'");
            $riders_table_exists = !empty($this->db->resultSet());
            if (!$riders_table_exists) {
                error_log("riders table does not exist");
                return [];
            }
            
            $this->db->query("SHOW TABLES LIKE 'users'");
            $users_table_exists = !empty($this->db->resultSet());
            if (!$users_table_exists) {
                error_log("users table does not exist");
                return [];
            }
            
            $this->db->query("SHOW TABLES LIKE 'suppliers'");
            $suppliers_table_exists = !empty($this->db->resultSet());
            if (!$suppliers_table_exists) {
                error_log("suppliers table does not exist");
                return [];
            }
            
            // Use a simpler query to get all records from rider_payment_requests
            $sql = "SELECT * FROM rider_payment_requests";
            
            // Add a debug message
            error_log("Using simplified query: " . $sql);
            
            $params = [];
            
            if ($status) {
                $sql .= " WHERE status = :status";
                $params[':status'] = $status;
            }
            
            // We're not filtering by is_advance anymore to show all payment requests
            // if ($advance_only) {
            //     $sql .= " AND rpr.is_advance = 1";
            // }
            
            // Check if is_daily_order column exists before adding the condition
            $this->db->query("SHOW COLUMNS FROM rider_payment_requests LIKE 'is_daily_order'");
            $is_daily_order_exists = !empty($this->db->resultSet());
            
            if ($daily_orders_only && $is_daily_order_exists) {
                if ($status) {
                    $sql .= " AND is_daily_order = 1";
                } else {
                    $sql .= " WHERE is_daily_order = 1";
                }
            }
            
            $sql .= " ORDER BY created_at DESC";
            
            error_log("SQL Query: " . $sql);
            $this->db->query($sql);
            
            foreach ($params as $param => $value) {
                $this->db->bind($param, $value);
                error_log("Binding parameter: " . $param . " = " . $value);
            }
            
            $result = $this->db->resultSet();
            error_log("Query result count: " . count($result));
            
            // Add rider_id to each record if it doesn't exist
            foreach ($result as &$record) {
                if (!isset($record['rider_id']) && isset($record['id'])) {
                    // Try to get the rider_id from the database
                    $this->db->query("SELECT rider_id FROM rider_payment_requests WHERE id = :id");
                    $this->db->bind(':id', $record['id']);
                    $rider = $this->db->single();
                    if ($rider && isset($rider['rider_id'])) {
                        $record['rider_id'] = $rider['rider_id'];
                    }
                }
            }
            
            return $result;
        } catch (Exception $e) {
            error_log("Error in getAllPaymentRequestsAdvanced: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get all payment requests
     * @param string|null $status - Filter by status (pending, approved, rejected) or null for all
     * @return array - Array of payment requests
     */
    public function getAllPaymentRequests($status = null) {
        try {
            // Check both tables for payment requests
            $requests = [];
            
            // First check rider_payment_requests table
            $this->db->query("SHOW TABLES LIKE 'rider_payment_requests'");
            $table1_exists = !empty($this->db->resultSet());
            
            if ($table1_exists) {
                error_log("Checking rider_payment_requests table for payment requests");
                
                $sql1 = "SELECT 
                        rpr.*, 
                        r.full_name as rider_name,
                        s.name as supplier_name,
                        'rider_payment_requests' as source_table
                      FROM rider_payment_requests rpr
                      LEFT JOIN riders r ON rpr.rider_id = r.id
                      LEFT JOIN suppliers s ON rpr.supplier_id = s.id";
                
                if ($status) {
                    $sql1 .= " WHERE rpr.status = :status";
                }
                
                $sql1 .= " ORDER BY rpr.request_date DESC";
                
                $this->db->query($sql1);
                
                if ($status) {
                    $this->db->bind(':status', $status);
                }
                
                $result1 = $this->db->resultSet();
                error_log("Found " . count($result1) . " requests in rider_payment_requests table");
                
                $requests = array_merge($requests, $result1);
            }
            
            // Then check payment_requests table
            $this->db->query("SHOW TABLES LIKE 'payment_requests'");
            $table2_exists = !empty($this->db->resultSet());
            
            if ($table2_exists) {
                error_log("Checking payment_requests table for payment requests");
                
                $sql2 = "SELECT 
                        pr.*, 
                        r.full_name as rider_name,
                        s.name as supplier_name,
                        'payment_requests' as source_table
                      FROM payment_requests pr
                      LEFT JOIN riders r ON pr.rider_id = r.id
                      LEFT JOIN suppliers s ON pr.supplier_id = s.id";
                
                if ($status) {
                    $sql2 .= " WHERE pr.status = :status";
                }
                
                $sql2 .= " ORDER BY pr.request_date DESC";
                
                $this->db->query($sql2);
                
                if ($status) {
                    $this->db->bind(':status', $status);
                }
                
                $result2 = $this->db->resultSet();
                error_log("Found " . count($result2) . " requests in payment_requests table");
                
                $requests = array_merge($requests, $result2);
            }
            
            // Sort combined results by request_date (newest first)
            usort($requests, function($a, $b) {
                $date_a = strtotime($a['request_date'] ?? '0');
                $date_b = strtotime($b['request_date'] ?? '0');
                return $date_b - $date_a;
            });
            
            error_log("Total payment requests found: " . count($requests));
            return $requests;
        } catch (Exception $e) {
            error_log("Error in getAllPaymentRequests: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get advance requests with filters
     * @param array $filters - Filters to apply (rider_id, start_date, end_date, status)
     * @return array - Array of advance requests
     */
    public function getAdvanceRequests($filters = []) {
        try {
            // Check if payment_requests table exists
            $this->db->query("SHOW TABLES LIKE 'payment_requests'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                error_log("payment_requests table does not exist");
                return [];
            }
            
            $sql = "SELECT pr.*, 
                    r.full_name as rider_name,
                    s.name as supplier_name,
                    c.company_name,
                    cs.store_name
                    FROM payment_requests pr
                    LEFT JOIN riders r ON pr.rider_id = r.id
                    LEFT JOIN suppliers s ON pr.supplier_id = s.id
                    LEFT JOIN companies c ON pr.company_id = c.id
                    LEFT JOIN company_stores cs ON pr.store_id = cs.id
                    WHERE 1=1";
            
            $params = [];
            
            // Apply filters
            if (isset($filters['rider_id']) && !empty($filters['rider_id'])) {
                $sql .= " AND pr.rider_id = :rider_id";
                $params[':rider_id'] = $filters['rider_id'];
            }
            
            if (isset($filters['start_date']) && !empty($filters['start_date'])) {
                $sql .= " AND pr.request_date >= :start_date";
                $params[':start_date'] = $filters['start_date'];
            }
            
            if (isset($filters['end_date']) && !empty($filters['end_date'])) {
                $sql .= " AND pr.request_date <= :end_date";
                $params[':end_date'] = $filters['end_date'];
            }
            
            if (isset($filters['status']) && !empty($filters['status'])) {
                $sql .= " AND pr.status = :status";
                $params[':status'] = $filters['status'];
            }
            
            // Order by request date (newest first)
            $sql .= " ORDER BY pr.request_date DESC";
            
            $this->db->query($sql);
            
            // Bind parameters
            foreach ($params as $param => $value) {
                $this->db->bind($param, $value);
            }
            
            $results = $this->db->resultSet();
            error_log("Found " . count($results) . " advance requests with applied filters");
            
            return $results;
        } catch (Exception $e) {
            error_log("Error in getAdvanceRequests: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Upload weekly statement for a rider
     * @param int $rider_id - Rider ID
     * @param float $amount - Statement amount
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @param string $payment_date - Payment date (YYYY-MM-DD HH:MM:SS)
     * @param string $remarks - Remarks
     * @param float $commission_amount - Commission amount
     * @param float $net_amount - Net amount
     * @return bool - True if successful, false otherwise
     */
    public function uploadWeeklyStatement($rider_id, $amount, $start_date, $end_date, $payment_date, $remarks = '', $commission_amount = 0, $net_amount = 0) {
        try {
            // Check if weekly_statements table exists
            $this->db->query("SHOW TABLES LIKE 'weekly_statements'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                // Create the weekly_statements table
                $this->db->query("CREATE TABLE IF NOT EXISTS `weekly_statements` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `rider_id` int(11) NOT NULL,
                    `amount` decimal(10,2) NOT NULL,
                    `commission_amount` decimal(10,2) DEFAULT 0,
                    `net_amount` decimal(10,2) DEFAULT 0,
                    `start_date` date NOT NULL,
                    `end_date` date NOT NULL,
                    `payment_date` datetime NOT NULL,
                    `status` varchar(20) NOT NULL DEFAULT 'pending',
                    `payment_reference` varchar(100) DEFAULT NULL,
                    `payment_method` varchar(50) DEFAULT NULL,
                    `remarks` text DEFAULT NULL,
                    `payment_data` text DEFAULT NULL,
                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    KEY `rider_id` (`rider_id`),
                    KEY `start_date` (`start_date`),
                    KEY `end_date` (`end_date`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $this->db->execute();
                error_log("Created weekly_statements table");
            }
            
            // Check if statement already exists for this rider and week
            $this->db->query("SELECT id FROM weekly_statements WHERE rider_id = ? AND start_date = ? AND end_date = ?");
            $this->db->bind(1, $rider_id);
            $this->db->bind(2, $start_date);
            $this->db->bind(3, $end_date);
            $existing = $this->db->single();
            
            if ($existing) {
                error_log("Weekly statement already exists for rider $rider_id for week $start_date to $end_date");
                return false;
            }
            
            // Insert new statement
            $this->db->query("INSERT INTO weekly_statements (rider_id, amount, commission_amount, net_amount, start_date, end_date, payment_date, status, remarks) 
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $this->db->bind(1, $rider_id);
            $this->db->bind(2, $amount);
            $this->db->bind(3, $commission_amount);
            $this->db->bind(4, $net_amount > 0 ? $net_amount : $amount - $commission_amount);
            $this->db->bind(5, $start_date);
            $this->db->bind(6, $end_date);
            $this->db->bind(7, $payment_date);
            $this->db->bind(8, 'pending');
            $this->db->bind(9, $remarks);
            
            return $this->db->execute();
        } catch (Exception $e) {
            error_log("Error in uploadWeeklyStatement: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Process rider payment
     * @param int $rider_id - Rider ID
     * @param float $amount - Payment amount
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @param string $payment_date - Payment date (YYYY-MM-DD HH:MM:SS)
     * @param string $payment_method - Payment method
     * @param string $payment_reference - Payment reference
     * @param string $remarks - Remarks
     * @return bool - True if successful, false otherwise
     */
    public function processRiderPayment($rider_id, $amount, $start_date, $end_date, $payment_date, $payment_method = 'bank_transfer', $payment_reference = '', $remarks = '') {
        try {
            // Check if weekly_statements table exists
            $this->db->query("SHOW TABLES LIKE 'weekly_statements'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                error_log("weekly_statements table does not exist");
                return false;
            }
            
            // Check if is_paid column exists in weekly_statements table
            $this->db->query("SHOW COLUMNS FROM weekly_statements LIKE 'is_paid'");
            $is_paid_exists = !empty($this->db->resultSet());
            
            // Add is_paid column if it doesn't exist
            if (!$is_paid_exists) {
                $this->db->query("ALTER TABLE weekly_statements ADD COLUMN is_paid TINYINT(1) NOT NULL DEFAULT 0 AFTER status");
                $this->db->execute();
                error_log("Added is_paid column to weekly_statements table");
            }
            
            // Check if paid_amount column exists in weekly_statements table
            $this->db->query("SHOW COLUMNS FROM weekly_statements LIKE 'paid_amount'");
            $paid_amount_exists = !empty($this->db->resultSet());
            
            // Add paid_amount column if it doesn't exist
            if (!$paid_amount_exists) {
                $this->db->query("ALTER TABLE weekly_statements ADD COLUMN paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER net_amount");
                $this->db->execute();
                error_log("Added paid_amount column to weekly_statements table");
            }
            
            // Get statement for this rider and week
            $this->db->query("SELECT id FROM weekly_statements WHERE rider_id = ? AND start_date = ? AND end_date = ?");
            $this->db->bind(1, $rider_id);
            $this->db->bind(2, $start_date);
            $this->db->bind(3, $end_date);
            $statement = $this->db->single();
            
            if ($statement) {
                // First, get the current statement data to preserve the original weekly earnings
                $this->db->query("SELECT amount, net_amount FROM weekly_statements WHERE id = ?");
                $this->db->bind(1, $statement['id']);
                $current_statement = $this->db->single();
                
                // Preserve the original weekly earnings (amount and net_amount)
                $original_amount = $current_statement['amount'] ?? 0;
                $original_net_amount = $current_statement['net_amount'] ?? $original_amount;
                
                // Update existing statement - IMPORTANT: DO NOT update amount or net_amount
                $this->db->query("UPDATE weekly_statements SET 
                                  status = ?, 
                                  is_paid = 1,
                                  paid_amount = ?,
                                  payment_method = ?, 
                                  payment_reference = ?, 
                                  remarks = CONCAT(IFNULL(remarks, ''), '\n', ?) 
                                  WHERE id = ?");
                $this->db->bind(1, 'paid');
                $this->db->bind(2, $amount); // This is the actual paid amount
                $this->db->bind(3, $payment_method);
                $this->db->bind(4, $payment_reference);
                $this->db->bind(5, "Payment processed on " . date('Y-m-d H:i:s') . ": " . $remarks);
                $this->db->bind(6, $statement['id']);
                
                return $this->db->execute();
            } else {
                // Get weekly earnings from WeeklySummary model
                $weekly_summary = new WeeklySummary($this->db);
                $summary = $weekly_summary->calculateWeeklySummary($rider_id, $start_date, $end_date);
                
                // Get the original weekly earnings from the summary
                $weekly_earnings = isset($summary['weekly_earnings']) ? $summary['weekly_earnings'] : $amount;
                $advance_requested = isset($summary['advance_requested']) ? $summary['advance_requested'] : 0;
                
                // Check if there's data in rider_payments table that might have the original earnings
                $this->db->query("SELECT payment_data FROM rider_payments 
                                 WHERE rider_id = ? 
                                 AND JSON_EXTRACT(payment_data, '$.start_date') = ? 
                                 AND JSON_EXTRACT(payment_data, '$.end_date') = ?
                                 ORDER BY created_at DESC LIMIT 1");
                $this->db->bind(1, $rider_id);
                $this->db->bind(2, $start_date);
                $this->db->bind(3, $end_date);
                $rider_payment = $this->db->single();
                
                // If we found a rider_payment record, try to extract the total_earnings
                if ($rider_payment && isset($rider_payment['payment_data'])) {
                    $payment_data = json_decode($rider_payment['payment_data'], true);
                    if (isset($payment_data['total_earnings']) && is_numeric($payment_data['total_earnings'])) {
                        $weekly_earnings = (float)$payment_data['total_earnings'];
                        error_log("Found original weekly earnings in rider_payments: $weekly_earnings");
                    }
                }
                
                // Create new statement and mark as paid
                $this->db->query("INSERT INTO weekly_statements (rider_id, amount, net_amount, paid_amount, start_date, end_date, payment_date, status, is_paid, payment_method, payment_reference, remarks) 
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)");
                $this->db->bind(1, $rider_id);
                $this->db->bind(2, $weekly_earnings); // Store the original weekly earnings
                $this->db->bind(3, $weekly_earnings); // Store the original weekly earnings
                $this->db->bind(4, $amount); // Store the actual paid amount
                $this->db->bind(5, $start_date);
                $this->db->bind(6, $end_date);
                $this->db->bind(7, $payment_date);
                $this->db->bind(8, 'paid');
                $this->db->bind(9, $payment_method);
                $this->db->bind(10, $payment_reference);
                $this->db->bind(11, $remarks);
                
                return $this->db->execute();
            }
        } catch (Exception $e) {
            error_log("Error in processRiderPayment: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get weekly advance requests
     * @param int|null $rider_id - Rider ID (optional)
     * @param string|null $status - Filter by status (pending, approved, rejected) or null for all
     * @return array - Array of weekly advance requests
     */
    public function getWeeklyAdvanceRequests($rider_id = null, $status = null) {
        try {
            // First check if payment_requests table exists
            $this->db->query("SHOW TABLES LIKE 'payment_requests'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                return [];
            }

            // Get the current date
            $current_date = new DateTime();
            
            // Calculate week number (1-4) based on day of month
            $day_of_month = (int)$current_date->format('d');
            $week_number = ceil($day_of_month / 7);
            
            // Calculate start and end dates for the week
            $start_date = new DateTime($current_date->format('Y-m-01')); // First day of month
            $start_date->modify('+' . (($week_number - 1) * 7) . ' days');
            $end_date = clone $start_date;
            $end_date->modify('+6 days');
            
            // If end date is beyond current month, adjust it
            if ($end_date->format('m') !== $current_date->format('m')) {
                $end_date = new DateTime($current_date->format('Y-m-t')); // Last day of month
            }

            // Build the query to get weekly totals
            $sql = "SELECT 
                    MIN(pr.id) as id,
                    pr.rider_id,
                    pr.supplier_id,
                    :start_date as week_start_date,
                    :end_date as week_end_date,
                    SUM(pr.total_earnings) as total_earnings,
                    SUM(pr.amount_requested) as amount_requested,
                    MAX(pr.request_date) as request_date,
                    pr.status,
                    GROUP_CONCAT(pr.remarks SEPARATOR '; ') as remarks,
                    COUNT(DISTINCT pr.daily_order_id) as order_count
                    FROM payment_requests pr
                    WHERE pr.is_daily_order = 1
                    AND pr.order_date BETWEEN :start_date AND :end_date";

            if ($rider_id) {
                $sql .= " AND pr.rider_id = :rider_id";
            }

            if ($status) {
                $sql .= " AND pr.status = :status";
            }

            $sql .= " GROUP BY pr.rider_id, pr.status";

            $this->db->query($sql);
            $this->db->bind(':start_date', $start_date->format('Y-m-d'));
            $this->db->bind(':end_date', $end_date->format('Y-m-d'));
            
            if ($rider_id) {
                $this->db->bind(':rider_id', $rider_id);
            }
            
            if ($status) {
                $this->db->bind(':status', $status);
            }

            $results = $this->db->resultSet();
            
            // Check if weekly statement exists for this week
            foreach ($results as &$result) {
                $this->db->query("SELECT COUNT(*) as count FROM weekly_statements 
                                 WHERE rider_id = :rider_id 
                                 AND week_start_date = :start_date 
                                 AND week_end_date = :end_date 
                                 AND status = 'published'");
                $this->db->bind(':rider_id', $result['rider_id']);
                $this->db->bind(':start_date', $start_date->format('Y-m-d'));
                $this->db->bind(':end_date', $end_date->format('Y-m-d'));
                $statement = $this->db->single();
                $result['has_weekly_statement'] = ($statement['count'] > 0);
            }

            return $results;
        } catch (Exception $e) {
            error_log("Error in getWeeklyAdvanceRequests: " . $e->getMessage());
            return [];
        }
    }
}
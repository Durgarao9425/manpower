http://localhost/manpower/rider/payments.php<?php
/**
 * Weekly Settlement Model
 * Handles operations related to weekly settlement calculations
 */
class WeeklySettlement {
    private $db;
    
    /**
     * Constructor
     * @param Database $db - Database connection
     */
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Calculate weekly settlement for a rider
     * @param int $rider_id - Rider ID
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @return array - Settlement calculation
     */
    public function calculateWeeklySettlement($rider_id, $start_date, $end_date) {
        try {
            // Start transaction
            $this->db->beginTransaction();
            
            // 1. Get weekly final earnings from admin uploaded weekly report
            $weekly_earnings = $this->getWeeklyFinalEarnings($rider_id, $start_date, $end_date);
            
            // 2. Get sum of daily earnings for the same week from daily uploaded reports
            $daily_earnings = $this->getDailyEarnings($rider_id, $start_date, $end_date);
            
            // 3. Get total approved advance amounts from that week
            $advance_amounts = $this->getAdvanceAmounts($rider_id, $start_date, $end_date);
            
            // 4. Calculate settlement amount
            // Week Settlement Amount = (Weekly Final Earnings) - (Sum of Daily Earnings) - (Total Approved Advance Amounts)
            $settlement_amount = $weekly_earnings - $daily_earnings - $advance_amounts;
            
            // Commit transaction
            $this->db->commit();
            
            // Log the calculation details for debugging
            error_log("Weekly settlement calculation for rider $rider_id from $start_date to $end_date:");
            error_log("Weekly final earnings: $weekly_earnings");
            error_log("Sum of daily earnings: $daily_earnings");
            error_log("Total advance amounts: $advance_amounts");
            error_log("Settlement amount: $settlement_amount");
            
            return [
                'weekly_earnings' => $weekly_earnings,
                'daily_earnings' => $daily_earnings,
                'advance_amounts' => $advance_amounts,
                'settlement_amount' => $settlement_amount
            ];
        } catch (Exception $e) {
            // Rollback transaction on error
            if ($this->db->inTransaction()) {
                $this->db->rollback();
            }
            
            error_log("Error in calculateWeeklySettlement: " . $e->getMessage());
            return [
                'weekly_earnings' => 0,
                'daily_earnings' => 0,
                'advance_amounts' => 0,
                'settlement_amount' => 0,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Get weekly final earnings from admin uploaded weekly report
     * @param int $rider_id - Rider ID
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @return float - Weekly final earnings
     */
    private function getWeeklyFinalEarnings($rider_id, $start_date, $end_date) {
        try {
            // Check if earnings table exists
            $this->db->query("SHOW TABLES LIKE 'earnings'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                error_log("earnings table does not exist");
                return 0;
            }
            
            // Query to get weekly final earnings from the earnings table
            $this->db->query("SELECT SUM(amount) as total_earnings 
                             FROM earnings 
                             WHERE rider_id = :rider_id 
                             AND earning_date >= :start_date 
                             AND earning_date <= :end_date 
                             AND (status = 'approved' OR status = 'pending')");
            
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':start_date', $start_date);
            $this->db->bind(':end_date', $end_date);
            
            $result = $this->db->single();
            return $result && isset($result['total_earnings']) ? (float)$result['total_earnings'] : 0;
        } catch (Exception $e) {
            error_log("Error in getWeeklyFinalEarnings: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Get sum of daily earnings for the same week from daily uploaded reports
     * @param int $rider_id - Rider ID
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @return float - Sum of daily earnings
     */
    private function getDailyEarnings($rider_id, $start_date, $end_date) {
        try {
            // Check if daily_rider_orders table exists
            $this->db->query("SHOW TABLES LIKE 'daily_rider_orders'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                error_log("daily_rider_orders table does not exist");
                return 0;
            }
            
            // Query to get daily earnings from the daily_rider_orders table
            $this->db->query("SELECT SUM(total_earning) as total_daily_earnings 
                             FROM daily_rider_orders 
                             WHERE rider_id = :rider_id 
                             AND order_date >= :start_date 
                             AND order_date <= :end_date");
            
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':start_date', $start_date);
            $this->db->bind(':end_date', $end_date);
            
            $result = $this->db->single();
            $total_daily_earnings = $result && isset($result['total_daily_earnings']) ? (float)$result['total_daily_earnings'] : 0;
            
            error_log("Total daily earnings for rider $rider_id from $start_date to $end_date: $total_daily_earnings");
            return $total_daily_earnings;
        } catch (Exception $e) {
            error_log("Error in getDailyEarnings: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Get total approved advance amounts from that week
     * @param int $rider_id - Rider ID
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @return float - Total approved advance amounts
     */
    private function getAdvanceAmounts($rider_id, $start_date, $end_date) {
        try {
            // Check if payment_requests table exists
            $this->db->query("SHOW TABLES LIKE 'payment_requests'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                error_log("payment_requests table does not exist");
                return 0;
            }
            
            // Query to get approved advance amounts from the payment_requests table
            $this->db->query("SELECT SUM(amount_requested) as total_advances 
                             FROM payment_requests 
                             WHERE rider_id = :rider_id 
                             AND request_date >= :start_date 
                             AND request_date <= :end_date 
                             AND status = 'approved'");
            
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':start_date', $start_date);
            $this->db->bind(':end_date', $end_date);
            
            $result = $this->db->single();
            $total_advances = $result && isset($result['total_advances']) ? (float)$result['total_advances'] : 0;
            
            error_log("Total approved advances for rider $rider_id from $start_date to $end_date: $total_advances");
            return $total_advances;
        } catch (Exception $e) {
            error_log("Error in getAdvanceAmounts: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Create a weekly settlement
     * @param int $rider_id - Rider ID
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @param int $created_by - User ID of the creator
     * @return int|bool - Settlement ID or false on failure
     */
    public function createWeeklySettlement($rider_id, $start_date, $end_date, $created_by = null) {
        try {
            // Start transaction
            $this->db->beginTransaction();
            
            // Calculate settlement
            $settlement_data = $this->calculateWeeklySettlement($rider_id, $start_date, $end_date);
            
            // Check if settlement amount is valid
            if ($settlement_data['settlement_amount'] == 0 && $settlement_data['weekly_earnings'] == 0) {
                // No earnings for this period
                $this->db->rollback();
                return false;
            }
            
            // Prepare settlement data
            $data = [
                'rider_id' => $rider_id,
                'settlement_date' => date('Y-m-d'),
                'start_date' => $start_date,
                'end_date' => $end_date,
                'weekly_earnings' => $settlement_data['weekly_earnings'],
                'daily_earnings' => $settlement_data['daily_earnings'],
                'advance_amounts' => $settlement_data['advance_amounts'],
                'settlement_amount' => $settlement_data['settlement_amount'],
                'status' => 'pending',
                'created_by' => $created_by,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            // Insert into weekly_settlements table
            $this->db->query("INSERT INTO weekly_settlements (
                            rider_id,
                            settlement_date,
                            start_date,
                            end_date,
                            weekly_earnings,
                            daily_earnings,
                            advance_amounts,
                            settlement_amount,
                            status,
                            created_by,
                            created_at)
                            VALUES (
                            :rider_id,
                            :settlement_date,
                            :start_date,
                            :end_date,
                            :weekly_earnings,
                            :daily_earnings,
                            :advance_amounts,
                            :settlement_amount,
                            :status,
                            :created_by,
                            :created_at)");
            
            $this->db->bind(':rider_id', $data['rider_id']);
            $this->db->bind(':settlement_date', $data['settlement_date']);
            $this->db->bind(':start_date', $data['start_date']);
            $this->db->bind(':end_date', $data['end_date']);
            $this->db->bind(':weekly_earnings', $data['weekly_earnings']);
            $this->db->bind(':daily_earnings', $data['daily_earnings']);
            $this->db->bind(':advance_amounts', $data['advance_amounts']);
            $this->db->bind(':settlement_amount', $data['settlement_amount']);
            $this->db->bind(':status', $data['status']);
            $this->db->bind(':created_by', $data['created_by']);
            $this->db->bind(':created_at', $data['created_at']);
            
            if ($this->db->execute()) {
                $settlement_id = $this->db->lastInsertId();
                
                // Update earnings status to settled
                $this->db->query("UPDATE earnings SET 
                                settlement_id = :settlement_id, 
                                status = 'settled' 
                                WHERE rider_id = :rider_id 
                                AND earning_date >= :start_date 
                                AND earning_date <= :end_date 
                                AND (status = 'approved' OR status = 'pending')");
                
                $this->db->bind(':settlement_id', $settlement_id);
                $this->db->bind(':rider_id', $data['rider_id']);
                $this->db->bind(':start_date', $data['start_date']);
                $this->db->bind(':end_date', $data['end_date']);
                
                $this->db->execute();
                
                // Commit transaction
                $this->db->commit();
                return $settlement_id;
            } else {
                $this->db->rollback();
                return false;
            }
        } catch (Exception $e) {
            // Rollback transaction on error
            if ($this->db->inTransaction()) {
                $this->db->rollback();
            }
            
            error_log("Error in createWeeklySettlement: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Ensure the weekly_settlements table exists
     * @return bool - True if table exists or was created successfully
     */
    public function ensureTableExists() {
        try {
            // Check if weekly_settlements table exists
            $this->db->query("SHOW TABLES LIKE 'weekly_settlements'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                // Create the weekly_settlements table
                $this->db->query("CREATE TABLE IF NOT EXISTS `weekly_settlements` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `rider_id` int(11) NOT NULL,
                    `settlement_date` date NOT NULL,
                    `start_date` date NOT NULL,
                    `end_date` date NOT NULL,
                    `weekly_earnings` decimal(10,2) NOT NULL DEFAULT 0.00,
                    `daily_earnings` decimal(10,2) NOT NULL DEFAULT 0.00,
                    `advance_amounts` decimal(10,2) NOT NULL DEFAULT 0.00,
                    `settlement_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
                    `status` varchar(20) NOT NULL DEFAULT 'pending',
                    `payment_method` varchar(50) DEFAULT NULL,
                    `payment_reference` varchar(100) DEFAULT NULL,
                    `payment_date` date DEFAULT NULL,
                    `notes` text DEFAULT NULL,
                    `created_by` int(11) DEFAULT NULL,
                    `updated_by` int(11) DEFAULT NULL,
                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    KEY `rider_id` (`rider_id`),
                    KEY `status` (`status`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                
                return $this->db->execute();
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Error in ensureTableExists: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get all weekly settlements with optional filters
     * @param array $filters - Optional filters
     * @return array - Array of weekly settlements
     */
    public function getAllWeeklySettlements($filters = []) {
        try {
            // Ensure the table exists
            $this->ensureTableExists();
            
            $sql = "SELECT ws.*, r.full_name as rider_name, u.full_name as created_by_name 
                    FROM weekly_settlements ws 
                    JOIN riders r ON ws.rider_id = r.id 
                    LEFT JOIN users u ON ws.created_by = u.id 
                    WHERE 1=1";
            
            $params = [];
            
            if (isset($filters['rider_id']) && !empty($filters['rider_id'])) {
                $sql .= " AND ws.rider_id = :rider_id";
                $params[':rider_id'] = $filters['rider_id'];
            }
            
            if (isset($filters['status']) && !empty($filters['status'])) {
                $sql .= " AND ws.status = :status";
                $params[':status'] = $filters['status'];
            }
            
            if (isset($filters['start_date']) && !empty($filters['start_date'])) {
                $sql .= " AND ws.settlement_date >= :start_date";
                $params[':start_date'] = $filters['start_date'];
            }
            
            if (isset($filters['end_date']) && !empty($filters['end_date'])) {
                $sql .= " AND ws.settlement_date <= :end_date";
                $params[':end_date'] = $filters['end_date'];
            }
            
            if (isset($filters['search']) && !empty($filters['search'])) {
                $sql .= " AND (r.full_name LIKE :search)";
                $params[':search'] = '%' . $filters['search'] . '%';
            }
            
            $sql .= " ORDER BY ws.settlement_date DESC, ws.id DESC";
            
            if (isset($filters['limit']) && is_numeric($filters['limit'])) {
                $sql .= " LIMIT :limit";
                $params[':limit'] = $filters['limit'];
            }
            
            if (isset($filters['offset']) && is_numeric($filters['offset'])) {
                $sql .= " OFFSET :offset";
                $params[':offset'] = $filters['offset'];
            }
            
            $this->db->query($sql);
            
            foreach ($params as $param => $value) {
                $this->db->bind($param, $value);
            }
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getAllWeeklySettlements: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Update weekly settlement status
     * @param array $data - Settlement data
     * @return bool - True on success, false on failure
     */
    public function updateWeeklySettlementStatus($data) {
        try {
            $this->db->query("UPDATE weekly_settlements SET
                            status = :status,
                            payment_method = :payment_method,
                            payment_reference = :payment_reference,
                            payment_date = :payment_date,
                            notes = :notes,
                            updated_by = :updated_by,
                            updated_at = NOW()
                            WHERE id = :id");
            
            $this->db->bind(':status', $data['status']);
            $this->db->bind(':payment_method', $data['payment_method'] ?? null);
            $this->db->bind(':payment_reference', $data['payment_reference'] ?? null);
            $this->db->bind(':payment_date', $data['payment_date'] ?? null);
            $this->db->bind(':notes', $data['notes'] ?? null);
            $this->db->bind(':updated_by', $data['updated_by'] ?? null);
            $this->db->bind(':id', $data['id']);
            
            return $this->db->execute();
        } catch (Exception $e) {
            error_log("Error in updateWeeklySettlementStatus: " . $e->getMessage());
            return false;
        }
    }
}
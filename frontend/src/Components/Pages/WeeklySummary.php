<?php
/**
 * Weekly Summary Model
 * Handles operations related to rider weekly financial summary
 */
class WeeklySummary {
    private $db;
    
    /**
     * Constructor
     * @param Database $db - Database connection
     */
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Get the start and end date of the current month-based week
     * Week 1: From day 1 to day 7
     * Week 2: From day 8 to day 14
     * Week 3: From day 15 to day 21
     * Week 4: From day 22 to the last day of the month
     * 
     * @param string|null $date - Reference date (defaults to current date)
     * @return array - Array with start_date and end_date
     */
    public function getCurrentWeekDates($date = null) {
        if (!$date) {
            $date = date('Y-m-d');
        }
        
        $timestamp = strtotime($date);
        $day_of_month = date('j', $timestamp); // 1-31
        $month = date('m', $timestamp);
        $year = date('Y', $timestamp);
        $last_day_of_month = date('t', $timestamp);
        
        // Determine which week of the month we're in
        if ($day_of_month >= 1 && $day_of_month <= 7) {
            // Week 1: day 1-7
            $start_date = date('Y-m-d', mktime(0, 0, 0, $month, 1, $year));
            $end_date = date('Y-m-d', mktime(0, 0, 0, $month, 7, $year));
        } else if ($day_of_month >= 8 && $day_of_month <= 14) {
            // Week 2: day 8-14
            $start_date = date('Y-m-d', mktime(0, 0, 0, $month, 8, $year));
            $end_date = date('Y-m-d', mktime(0, 0, 0, $month, 14, $year));
        } else if ($day_of_month >= 15 && $day_of_month <= 21) {
            // Week 3: day 15-21
            $start_date = date('Y-m-d', mktime(0, 0, 0, $month, 15, $year));
            $end_date = date('Y-m-d', mktime(0, 0, 0, $month, 21, $year));
        } else {
            // Week 4: day 22 to end of month
            $start_date = date('Y-m-d', mktime(0, 0, 0, $month, 22, $year));
            $end_date = date('Y-m-d', mktime(0, 0, 0, $month, $last_day_of_month, $year));
        }
        
        error_log("Month-based week calculation for date $date: Week " . ceil($day_of_month / 7) . " (days $day_of_month/$last_day_of_month), period: $start_date to $end_date");
        
        return [
            'start_date' => $start_date,
            'end_date' => $end_date
        ];
    }
    
    /**
     * Get daily orders summary for a rider within a date range
     * @param int $rider_id - Rider ID
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @return array - Daily orders summary
     */
    public function getDailyOrdersSummary($rider_id, $start_date, $end_date) {
        try {
            // Check if daily_rider_orders table exists
            $this->db->query("SHOW TABLES LIKE 'daily_rider_orders'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                error_log("daily_rider_orders table does not exist");
                return [];
            }
            
            // Query to get daily orders for the rider within the date range
            $this->db->query("SELECT dro.*, 
                             c.company_name, 
                             cs.store_name,
                             dou.upload_date
                             FROM daily_rider_orders dro
                             LEFT JOIN companies c ON dro.company_id = c.id
                             LEFT JOIN company_stores cs ON dro.store_id = cs.id
                             LEFT JOIN daily_order_uploads dou ON dro.upload_id = dou.id
                             WHERE dro.rider_id = :rider_id 
                             AND dro.order_date BETWEEN :start_date AND :end_date
                             ORDER BY dro.order_date ASC");
            
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':start_date', $start_date);
            $this->db->bind(':end_date', $end_date);
            
            // Debug log
            error_log("Fetching daily orders for rider ID: {$rider_id} from {$start_date} to {$end_date}");
            
            $daily_orders = $this->db->resultSet();
            
            // Debug log
            error_log("Found " . count($daily_orders) . " daily orders for rider ID: {$rider_id}");
            
            // Group orders by date
            $orders_by_date = [];
            $totals = [
                'order_count' => 0,
                'total_earning' => 0,
                'advance_requested' => 0,
                'remaining_amount' => 0
            ];
            
            foreach ($daily_orders as $order) {
                $date = $order['order_date'];
                
                if (!isset($orders_by_date[$date])) {
                    // Get advance requests for this date
                    $advance_amount = $this->getAdvanceRequestsForDate($rider_id, $date);
                    
                    $orders_by_date[$date] = [
                        'date' => $date,
                        'formatted_date' => date('D, M d', strtotime($date)),
                        'order_count' => (int)$order['order_count'],
                        'total_earning' => (float)$order['total_earning'],
                        'advance_requested' => $advance_amount,
                        'remaining_amount' => (float)$order['total_earning'] - $advance_amount,
                        'company_name' => $order['company_name'] ?? 'N/A',
                        'store_name' => $order['store_name'] ?? 'N/A',
                        'upload_date' => $order['upload_date'] ?? null
                    ];
                } else {
                    // If multiple entries for same date, add to existing
                    $orders_by_date[$date]['order_count'] += (int)$order['order_count'];
                    $orders_by_date[$date]['total_earning'] += (float)$order['total_earning'];
                    $orders_by_date[$date]['remaining_amount'] = $orders_by_date[$date]['total_earning'] - $orders_by_date[$date]['advance_requested'];
                }
                
                // Update totals
                $totals['order_count'] += (int)$order['order_count'];
                $totals['total_earning'] += (float)$order['total_earning'];
            }
            
            // Get total advance requested for the week
            $totals['advance_requested'] = $this->getTotalAdvanceRequested($rider_id, $start_date, $end_date);
            $totals['remaining_amount'] = $totals['total_earning'] - $totals['advance_requested'];
            
            return [
                'daily_orders' => array_values($orders_by_date),
                'totals' => $totals
            ];
        } catch (Exception $e) {
            error_log("Error in getDailyOrdersSummary: " . $e->getMessage());
            return [
                'daily_orders' => [],
                'totals' => [
                    'order_count' => 0,
                    'total_earning' => 0,
                    'advance_requested' => 0,
                    'remaining_amount' => 0
                ]
            ];
        }
    }
    
    /**
     * Get advance requests for a specific date
     * @param int $rider_id - Rider ID
     * @param string $date - Date (YYYY-MM-DD)
     * @return float - Total advance requested for the date
     */
    public function getAdvanceRequestsForDate($rider_id, $date) {
        try {
            // Use the Payment model to get the total advance requested for this date
            $payment_model = new Payment($this->db);
            return $payment_model->getTotalAdvanceRequested($rider_id, $date, $date, ['approved']);
        } catch (Exception $e) {
            error_log("Error in getAdvanceRequestsForDate: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Get total advance requested within a date range
     * @param int $rider_id - Rider ID
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @return float - Total advance requested
     */
    public function getTotalAdvanceRequested($rider_id, $start_date, $end_date) {
        try {
            // Use the Payment model to get the total advance requested
            $payment_model = new Payment($this->db);
            return $payment_model->getTotalAdvanceRequested($rider_id, $start_date, $end_date, ['approved']);
        } catch (Exception $e) {
            error_log("Error in getTotalAdvanceRequested: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Get weekly final payment from rider_payments table
     * @param int $rider_id - Rider ID
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @return array - Weekly payment data
     */
    public function getWeeklyFinalPayment($rider_id, $start_date, $end_date) {
        try {
            // Use the Payment model to get the weekly statement
            $payment_model = new Payment($this->db);
            $payment = $payment_model->getWeeklyStatementByDateRange($rider_id, $start_date, $end_date);
            
            if (!$payment) {
                return [
                    'found' => false,
                    'amount' => 0,
                    'payment_date' => null,
                    'status' => 'pending',
                    'is_paid' => 0,
                    'paid_amount' => 0,
                    'payment_data' => null
                ];
            }
            
            // Check if is_paid field exists in the payment data
            $is_paid = isset($payment['is_paid']) ? (int)$payment['is_paid'] : 0;
            
            // Check if paid_amount field exists in the payment data
            $paid_amount = isset($payment['paid_amount']) ? (float)$payment['paid_amount'] : 0;
            
            return [
                'found' => true,
                'id' => $payment['id'],
                'amount' => $payment['amount'],
                'payment_date' => $payment['payment_date'],
                'status' => $payment['status'],
                'is_paid' => $is_paid,
                'paid_amount' => $paid_amount,
                'company_name' => $payment['company_name'] ?? '',
                'start_date' => $payment['start_date'],
                'end_date' => $payment['end_date'],
                'total_amount' => $payment['total_amount'] ?? $payment['amount'],
                'commission_amount' => $payment['commission_amount'] ?? 0,
                'net_amount' => $payment['net_amount'] ?? $payment['amount'],
                'payment_reference' => $payment['payment_reference'] ?? '',
                'remarks' => $payment['remarks'] ?? '',
                'payment_data' => $payment['payment_data'] ?? null
            ];
        } catch (Exception $e) {
            error_log("Error in getWeeklyFinalPayment: " . $e->getMessage());
            return [
                'found' => false,
                'amount' => 0,
                'payment_date' => null,
                'status' => 'pending',
                'is_paid' => 0,
                'paid_amount' => 0,
                'payment_data' => null
            ];
        }
    }
    
    /**
     * Get order comparisons data for reconciliation
     * @param int $rider_id - Rider ID
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @return array - Order comparisons data
     */
    public function getOrderComparisons($rider_id, $start_date, $end_date) {
        try {
            // Check if order_comparisons table exists
            $this->db->query("SHOW TABLES LIKE 'order_comparisons'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                error_log("order_comparisons table does not exist");
                return [];
            }
            
            // Query to get order comparisons for the rider within the date range
            $this->db->query("SELECT oc.*, c.company_name
                             FROM order_comparisons oc
                             LEFT JOIN companies c ON oc.company_id = c.id
                             WHERE oc.rider_id = :rider_id 
                             AND oc.comparison_date BETWEEN :start_date AND :end_date
                             ORDER BY oc.comparison_date DESC");
            
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':start_date', $start_date);
            $this->db->bind(':end_date', $end_date);
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getOrderComparisons: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Calculate final weekly summary for a rider
     * @param int $rider_id - Rider ID
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @return array - Weekly summary data
     */
    public function calculateWeeklySummary($rider_id, $start_date, $end_date) {
        try {
            // Get weekly final payment first to check if it's already paid
            $weekly_payment = $this->getWeeklyFinalPayment($rider_id, $start_date, $end_date);
            
            // If payment is found and is_paid flag is set, use the stored values without recalculating
            if ($weekly_payment['found'] && isset($weekly_payment['is_paid']) && $weekly_payment['is_paid'] == 1) {
                error_log("Payment already marked as paid for rider $rider_id, week $start_date to $end_date. Using stored values.");
                
                // Get advance requests using direct SQL query
                $this->db->query("SELECT SUM(amount_requested) as total FROM payment_requests WHERE rider_id = :rider_id AND status = :status AND request_date BETWEEN :start_date AND :end_date");
                $this->db->bind(':rider_id', $rider_id);
                $this->db->bind(':status', 'approved');
                $this->db->bind(':start_date', $start_date . ' 00:00:00');
                $this->db->bind(':end_date', $end_date . ' 23:59:59');
                $result = $this->db->single();
                $advance_requested = (float)($result['total'] ?? 0);
                
                // For paid payments, we use the stored values
                // IMPORTANT: Always use the original amount/net_amount as the weekly earnings
                $weekly_earnings = $weekly_payment['amount']; // Original weekly earnings
                $paid_amount = $weekly_payment['paid_amount']; // Actual paid amount
                
                // Return the summary with stored values
                return [
                    'start_date' => $start_date,
                    'end_date' => $end_date,
                    'daily_orders' => [], // Empty as we don't need to recalculate
                    'daily_totals' => [
                        'order_count' => 0,
                        'total_earning' => $weekly_earnings, // This is the original weekly earnings amount
                        'advance_requested' => $advance_requested,
                        'remaining_amount' => 0 // Remaining is 0 since it's already paid
                    ],
                    'weekly_payment' => $weekly_payment,
                    'order_comparisons' => [],
                    'final_payable' => 0, // Final payable is 0 since it's already paid
                    'is_paid' => 1,
                    'paid_amount' => $paid_amount,
                    'weekly_earnings' => $weekly_earnings, // This is the original weekly earnings amount
                    'advance_requested' => $advance_requested
                ];
            }
            
            // If not paid, proceed with normal calculation
            // Get daily orders summary
            $daily_orders_summary = $this->getDailyOrdersSummary($rider_id, $start_date, $end_date);
            
            // Get order comparisons
            $order_comparisons = $this->getOrderComparisons($rider_id, $start_date, $end_date);
            
            // Get the weekly earnings - ALWAYS use the original amount from weekly_payment if available
            $weekly_earnings = $daily_orders_summary['totals']['total_earning'];
            if ($weekly_payment['found']) {
                $weekly_earnings = $weekly_payment['amount']; // Always use the original amount
                error_log("WeeklySummary model - Using weekly earnings from database: " . $weekly_earnings);
            }
            
            // Calculate final payable amount
            $final_payable = 0;
            
            // If payment is already marked as paid, final payable should be 0
            if ($weekly_payment['found'] && isset($weekly_payment['is_paid']) && $weekly_payment['is_paid'] == 1) {
                $final_payable = 0;
                error_log("WeeklySummary model - Payment already paid, setting final payable to 0");
            } else {
                // If not paid, calculate the final payable as weekly earnings minus advance requested
                $final_payable = $weekly_earnings - $daily_orders_summary['totals']['advance_requested'];
                error_log("WeeklySummary model - Payment not paid, final payable: " . $final_payable);
            }
            
            return [
                'start_date' => $start_date,
                'end_date' => $end_date,
                'daily_orders' => $daily_orders_summary['daily_orders'],
                'daily_totals' => $daily_orders_summary['totals'],
                'weekly_payment' => $weekly_payment,
                'order_comparisons' => $order_comparisons,
                'final_payable' => $final_payable,
                'is_paid' => 0,
                'paid_amount' => 0,
                'weekly_earnings' => $weekly_earnings, // Use the weekly_earnings variable we calculated above
                'advance_requested' => $daily_orders_summary['totals']['advance_requested']
            ];
        } catch (Exception $e) {
            error_log("Error in calculateWeeklySummary: " . $e->getMessage());
            return [
                'start_date' => $start_date,
                'end_date' => $end_date,
                'daily_orders' => [],
                'daily_totals' => [
                    'order_count' => 0,
                    'total_earning' => 0,
                    'advance_requested' => 0,
                    'remaining_amount' => 0
                ],
                'weekly_payment' => [
                    'found' => false,
                    'amount' => 0,
                    'payment_date' => null,
                    'status' => 'pending',
                    'is_paid' => 0,
                    'paid_amount' => 0,
                    'payment_data' => null
                ],
                'order_comparisons' => [],
                'final_payable' => 0,
                'is_paid' => 0,
                'paid_amount' => 0,
                'weekly_earnings' => 0,
                'advance_requested' => 0,
                'error' => $e->getMessage()
            ];
        }
    }
}
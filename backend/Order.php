<?php
/**
 * Order Model
 * Handles all operations related to orders
 */
class Order {
    private $db;

    /**
     * Constructor
     * @param Database $db - Database connection
     */
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Get total number of orders
     * @return int - Total number of orders
     */
    public function getTotalOrders() {
        return $this->countAllOrders();
    }
    
    /**
     * Count all orders
     * @return int - Total number of orders
     */
    public function countAllOrders() {
        $this->db->query("SELECT COUNT(*) as total FROM orders");
        $result = $this->db->single();
        return (int)$result['total'];
    }
    
    /**
     * Get recent orders by rider and company
     * @param int $rider_id - Rider ID
     * @param int $company_id - Company ID
     * @param int $limit - Number of orders to return
     * @return array - Array of orders
     */
    public function getRecentOrdersByRiderAndCompany($rider_id, $company_id, $limit = 5) {
        try {
            $this->db->query("SELECT * FROM orders 
                            WHERE rider_id = :rider_id 
                            AND company_id = :company_id 
                            ORDER BY order_date DESC, id DESC 
                            LIMIT :limit");
            
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':company_id', $company_id);
            $this->db->bind(':limit', $limit, PDO::PARAM_INT);
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getRecentOrdersByRiderAndCompany: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Count all company orders
     * @return int - Total number of company orders
     */
    public function countAllCompanyOrders() {
        try {
            // First check if daily_order_uploads table exists
            $this->db->query("SHOW TABLES LIKE 'daily_order_uploads'");
            $table_exists = !empty($this->db->resultSet());
            error_log("daily_order_uploads table exists: " . ($table_exists ? 'Yes' : 'No'));
            
            if ($table_exists) {
                // Get the sum of total_orders from daily_order_uploads
                $this->db->query("SELECT SUM(total_orders) as total FROM daily_order_uploads");
                $result = $this->db->single();
                error_log("Sum of total_orders from daily_order_uploads: " . ($result['total'] ?? 'NULL'));
                
                if ($result && isset($result['total']) && $result['total'] > 0) {
                    return (int)$result['total'];
                }
            }
            
            // Fallback to counting from orders table
            $this->db->query("SELECT COUNT(*) as total FROM orders");
            $result = $this->db->single();
            return (int)($result['total'] ?? 0);
        } catch (Exception $e) {
            error_log("Error in countAllCompanyOrders: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Count all rider orders
     * @return int - Total number of rider orders
     */
    public function countAllRiderOrders() {
        $this->db->query("SELECT COUNT(*) as total FROM orders");
        $result = $this->db->single();
        return (int)($result['total'] ?? 0);
    }
    
    // The getRiderOrders method has been moved to line 787 with additional parameters
    
    /**
     * Get rider orders by date
     * @param int $rider_id - Rider ID
     * @param string $date - Date (YYYY-MM-DD)
     * @return array - Array of orders
     */
    public function getRiderOrdersByDate($rider_id, $date) {
        try {
            $this->db->query("SELECT o.*, 
                           c.company_name,
                           s.store_name,
                           cu.full_name as customer_name
                    FROM orders o
                    JOIN companies c ON o.company_id = c.id
                    LEFT JOIN company_stores s ON o.store_id = s.id
                    LEFT JOIN customers cu ON o.customer_id = cu.id
                    WHERE o.rider_id = :rider_id
                    AND o.order_date = :date
                    ORDER BY o.created_at DESC");
            
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':date', $date);
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getRiderOrdersByDate: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get company orders by date
     * @param int $company_id - Company ID
     * @param string $date - Date (YYYY-MM-DD)
     * @return array - Array of orders
     */
    public function getCompanyOrdersByDate($company_id, $date) {
        try {
            // First check if daily_order_uploads table exists
            $this->db->query("SHOW TABLES LIKE 'daily_order_uploads'");
            $table_exists = !empty($this->db->resultSet());
            
            if ($table_exists) {
                // Check if there are any uploads for this company and date
                $this->db->query("SELECT * FROM daily_order_uploads 
                                WHERE company_id = :company_id 
                                AND order_date = :date");
                $this->db->bind(':company_id', $company_id);
                $this->db->bind(':date', $date);
                $uploads = $this->db->resultSet();
                
                if (!empty($uploads)) {
                    // Get daily rider orders for this company and date
                    $this->db->query("SELECT dro.*, 
                                    c.company_name, 
                                    cs.store_name,
                                    r.full_name as rider_name
                                    FROM daily_rider_orders dro
                                    LEFT JOIN companies c ON dro.company_id = c.id
                                    LEFT JOIN company_stores cs ON dro.store_id = cs.id
                                    LEFT JOIN riders r ON dro.rider_id = r.id
                                    WHERE dro.company_id = :company_id 
                                    AND dro.order_date = :date
                                    ORDER BY dro.created_at DESC");
                    $this->db->bind(':company_id', $company_id);
                    $this->db->bind(':date', $date);
                    return $this->db->resultSet();
                }
            }
            
            // Fallback to original query if no daily uploads found
            $this->db->query("SELECT o.*, 
                           r.rider_name,
                           s.store_name,
                           cu.full_name as customer_name
                    FROM orders o
                    LEFT JOIN riders r ON o.rider_id = r.id
                    LEFT JOIN company_stores s ON o.store_id = s.id
                    LEFT JOIN customers cu ON o.customer_id = cu.id
                    WHERE o.company_id = :company_id
                    AND o.order_date = :date
                    ORDER BY o.created_at DESC");
            
            $this->db->bind(':company_id', $company_id);
            $this->db->bind(':date', $date);
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getCompanyOrdersByDate: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get company total orders
     * @param int $company_id - Company ID
     * @return int - Total number of orders
     */
    public function getCompanyTotalOrders($company_id) {
        try {
            $this->db->query("SELECT COUNT(*) as total FROM orders WHERE company_id = :company_id");
            $this->db->bind(':company_id', $company_id);
            $result = $this->db->single();
            return (int)($result['total'] ?? 0);
        } catch (Exception $e) {
            error_log("Error in getCompanyTotalOrders: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Get store total orders
     * @param int $store_id - Store ID
     * @return int - Total number of orders
     */
    public function getStoreTotalOrders($store_id) {
        try {
            $this->db->query("SELECT COUNT(*) as total FROM orders WHERE store_id = :store_id");
            $this->db->bind(':store_id', $store_id);
            $result = $this->db->single();
            return (int)($result['total'] ?? 0);
        } catch (Exception $e) {
            error_log("Error in getStoreTotalOrders: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Get store orders by date
     * @param int $store_id - Store ID
     * @param string $date - Date (YYYY-MM-DD)
     * @return array - Array of orders
     */
    public function getStoreOrdersByDate($store_id, $date) {
        try {
            $this->db->query("SELECT o.*, 
                           r.id as rider_id,
                           u.full_name as rider_name,
                           c.company_name,
                           s.store_name
                    FROM orders o
                    JOIN riders r ON o.rider_id = r.id
                    JOIN users u ON r.user_id = u.id
                    JOIN companies c ON o.company_id = c.id
                    JOIN company_stores s ON o.store_id = s.id
                    WHERE o.store_id = :store_id
                    AND o.order_date = :date
                    ORDER BY o.created_at DESC");
            
            $this->db->bind(':store_id', $store_id);
            $this->db->bind(':date', $date);
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getStoreOrdersByDate: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get rider orders by store and date
     * @param int $rider_id - Rider ID
     * @param int $store_id - Store ID
     * @param string $date - Date (YYYY-MM-DD)
     * @return array - Array of orders
     */
    public function getRiderOrdersByStoreAndDate($rider_id, $store_id, $date) {
        try {
            $this->db->query("SELECT o.*, 
                           r.id as rider_id,
                           u.full_name as rider_name,
                           c.company_name,
                           s.store_name
                    FROM orders o
                    JOIN riders r ON o.rider_id = r.id
                    JOIN users u ON r.user_id = u.id
                    JOIN companies c ON o.company_id = c.id
                    JOIN company_stores s ON o.store_id = s.id
                    WHERE o.rider_id = :rider_id
                    AND o.store_id = :store_id
                    AND o.order_date = :date
                    ORDER BY o.created_at DESC");
            
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':store_id', $store_id);
            $this->db->bind(':date', $date);
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getRiderOrdersByStoreAndDate: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get rider orders by store
     * @param int $rider_id - Rider ID
     * @param int $store_id - Store ID
     * @return array - Array of orders
     */
    public function getRiderOrdersByStore($rider_id, $store_id) {
        try {
            $this->db->query("SELECT o.*, 
                           r.id as rider_id,
                           u.full_name as rider_name,
                           c.company_name,
                           s.store_name
                    FROM orders o
                    JOIN riders r ON o.rider_id = r.id
                    JOIN users u ON r.user_id = u.id
                    JOIN companies c ON o.company_id = c.id
                    JOIN company_stores s ON o.store_id = s.id
                    WHERE o.rider_id = :rider_id
                    AND o.store_id = :store_id
                    ORDER BY o.created_at DESC");
            
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':store_id', $store_id);
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getRiderOrdersByStore: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Count orders by date
     * @param string $date - Date (YYYY-MM-DD)
     * @return int - Number of orders for the date
     */
    public function countOrdersByDate($date) {
        try {
            // First check if daily_order_uploads table exists
            $this->db->query("SHOW TABLES LIKE 'daily_order_uploads'");
            $table_exists = !empty($this->db->resultSet());
            
            if ($table_exists) {
                // Get the sum of total_orders from daily_order_uploads for the given date
                $this->db->query("SELECT SUM(total_orders) as total FROM daily_order_uploads WHERE order_date = :date");
                $this->db->bind(':date', $date);
                $result = $this->db->single();
                
                if ($result && isset($result['total']) && $result['total'] > 0) {
                    return (int)$result['total'];
                }
            }
            
            // Fallback to the original query if the daily_order_uploads table doesn't exist or has no data
            $this->db->query("SELECT COUNT(*) as total FROM orders WHERE order_date = :date");
            $this->db->bind(':date', $date);
            $result = $this->db->single();
            return (int)($result['total'] ?? 0);
        } catch (Exception $e) {
            error_log("Error in countOrdersByDate: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Get orders by date
     * @param string $date - Date (YYYY-MM-DD)
     * @return array - Array of orders for the date
     */
    public function getOrdersByDate($date) {
        try {
            $this->db->query("SELECT o.*,
                           r.id as rider_id,
                           u.full_name as rider_name,
                           c.company_name,
                           s.store_name
                    FROM orders o
                    JOIN riders r ON o.rider_id = r.id
                    JOIN users u ON r.user_id = u.id
                    JOIN companies c ON o.company_id = c.id
                    LEFT JOIN company_stores s ON o.store_id = s.id
                    WHERE o.order_date = :date
                    ORDER BY o.created_at DESC");
            
            $this->db->bind(':date', $date);
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getOrdersByDate: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get count of today's orders
     * @return int - Number of orders today
     */
    public function getTodayOrdersCount() {
        return $this->countOrdersByDate(date('Y-m-d'));
    }
    
    /**
     * Get recent orders
     * @param int $limit - Number of orders to return
     * @return array - Array of recent orders
     */
    public function getRecentOrders($limit = 5) {
        $this->db->query("SELECT o.*,
                        r.id as rider_id,
                        u.full_name as rider_name,
                        c.company_name,
                        cs.store_name
                        FROM orders o
                        JOIN riders r ON o.rider_id = r.id
                        JOIN users u ON r.user_id = u.id
                        JOIN companies c ON o.company_id = c.id
                        LEFT JOIN company_stores cs ON o.store_id = cs.id
                        ORDER BY o.id DESC
                        LIMIT :limit");
        
        $this->db->bind(':limit', $limit);
        
        return $this->db->resultSet();
    }
    
    /**
     * Get monthly order counts
     * @param int $year - Year to get data for (defaults to current year)
     * @return array - Array of monthly order counts
     */
    public function getMonthlyOrderCounts($year = null) {
        if (!$year) {
            $year = date('Y');
        }
        
        $this->db->query("SELECT 
                        MONTH(order_date) as month,
                        COUNT(*) as order_count
                        FROM orders
                        WHERE YEAR(order_date) = :year
                        GROUP BY MONTH(order_date)
                        ORDER BY MONTH(order_date)");
        
        $this->db->bind(':year', $year);
        
        $results = $this->db->resultSet();
        
        // Format the results into a 12-month array
        $monthly_data = array_fill(1, 12, 0);
        foreach ($results as $row) {
            $monthly_data[(int)$row['month']] = (int)$row['order_count'];
        }
        
        return $monthly_data;
    }
    
    /**
     * Get monthly order trends
     * @return array - Monthly order trends data
     */
    public function getMonthlyOrderTrends() {
        $this->db->query("SELECT 
                        YEAR(order_date) as year,
                        MONTH(order_date) as month,
                        COUNT(*) as order_count,
                        SUM(total_earnings) as total_earnings
                        FROM orders
                        WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                        GROUP BY YEAR(order_date), MONTH(order_date)
                        ORDER BY YEAR(order_date), MONTH(order_date)");
        
        $results = $this->db->resultSet();
        
        // Format the results
        $trends = [];
        foreach ($results as $row) {
            $month_name = date('M', mktime(0, 0, 0, $row['month'], 1));
            $year = $row['year'];
            $label = $month_name . ' ' . $year;
            
            $trends[] = [
                'month' => $month_name,
                'year' => $year,
                'label' => $label,
                'order_count' => (int)$row['order_count'],
                'total_earnings' => (float)$row['total_earnings']
            ];
        }
        
        return $trends;
    }
    
    /**
     * Get order status distribution
     * @param string $start_date Optional start date (YYYY-MM-DD)
     * @param string $end_date Optional end date (YYYY-MM-DD)
     * @return array Distribution of order statuses
     */
    public function getOrderStatusDistribution($start_date = null, $end_date = null) {
        $sql = "SELECT status, COUNT(*) as count FROM orders";
        
        if ($start_date || $end_date) {
            $sql .= " WHERE";
            
            if ($start_date) {
                $sql .= " order_date >= :start_date";
            }
            
            if ($end_date) {
                $sql .= $start_date ? " AND order_date <= :end_date" : " order_date <= :end_date";
            }
        }
        
        $sql .= " GROUP BY status ORDER BY count DESC";
        
        $this->db->query($sql);
        
        if ($start_date) {
            $this->db->bind(':start_date', $start_date);
        }
        
        if ($end_date) {
            $this->db->bind(':end_date', $end_date);
        }
        
        return $this->db->resultSet();
    }
    
    /**
     * Get order comparison metrics
     * @return array - Array of order comparison metrics
     */
    public function getOrderComparisonMetrics() {
        // Current month
        $current_month = date('Y-m');
        $previous_month = date('Y-m', strtotime('-1 month'));
        
        // Current month orders
        $this->db->query("SELECT COUNT(*) as count FROM orders WHERE DATE_FORMAT(order_date, '%Y-%m') = :current_month");
        $this->db->bind(':current_month', $current_month);
        $current_month_orders = (int)$this->db->single()['count'];
        
        // Previous month orders
        $this->db->query("SELECT COUNT(*) as count FROM orders WHERE DATE_FORMAT(order_date, '%Y-%m') = :previous_month");
        $this->db->bind(':previous_month', $previous_month);
        $previous_month_orders = (int)$this->db->single()['count'];
        
        // Calculate percentage change
        $percentage_change = 0;
        if ($previous_month_orders > 0) {
            $percentage_change = round((($current_month_orders - $previous_month_orders) / $previous_month_orders) * 100);
        }
        
        return [
            'current_month' => $current_month_orders,
            'previous_month' => $previous_month_orders,
            'percentage_change' => $percentage_change
        ];
    }

    /**
     * Get company orders
     * @param int $company_id - Company ID
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @param array $filters - Additional filters
     * @return array - Array of orders
     */
    public function getCompanyOrders($company_id, $start_date, $end_date, $filters = []) {
        $sql = "SELECT o.*,
                r.id as rider_id,
                u.full_name as rider_name,
                cs.store_name
                FROM orders o
                JOIN riders r ON o.rider_id = r.id
                JOIN users u ON r.user_id = u.id
                LEFT JOIN company_stores cs ON o.store_id = cs.id
                WHERE o.company_id = :company_id
                AND o.order_date BETWEEN :start_date AND :end_date";
        
        $params = [
            ':company_id' => $company_id,
            ':start_date' => $start_date,
            ':end_date' => $end_date
        ];
        
        // Add additional filters
        if (!empty($filters)) {
            if (isset($filters['rider_id'])) {
                $sql .= " AND o.rider_id = :rider_id";
                $params[':rider_id'] = $filters['rider_id'];
            }
            
            if (isset($filters['store_id'])) {
                $sql .= " AND o.store_id = :store_id";
                $params[':store_id'] = $filters['store_id'];
            }
            
            if (isset($filters['status'])) {
                $sql .= " AND o.status = :status";
                $params[':status'] = $filters['status'];
            }
        }
        
        $sql .= " ORDER BY o.order_date DESC, o.id DESC";
        
        // Add limit if specified
        if (!empty($filters) && isset($filters['limit']) && is_numeric($filters['limit'])) {
            $sql .= " LIMIT " . intval($filters['limit']);
        }
        
        try {
            $this->db->query($sql);
            
            foreach ($params as $param => $value) {
                $this->db->bind($param, $value);
            }
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            return [];
        }
    }
    
    /**
     * Get weekly summary for a company
     * @param int $company_id - Company ID
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @return array - Weekly summary data
     */
    public function getWeeklySummary($company_id, $start_date, $end_date) {
        try {
            $this->db->query("SELECT 
                            COUNT(*) as total_orders,
                            COUNT(DISTINCT rider_id) as total_riders,
                            SUM(total_km) as total_km,
                            SUM(total_earnings) as total_amount
                            FROM orders 
                            WHERE company_id = :company_id 
                            AND order_date BETWEEN :start_date AND :end_date");
            
            $this->db->bind(':company_id', $company_id);
            $this->db->bind(':start_date', $start_date);
            $this->db->bind(':end_date', $end_date);
            
            return $this->db->single();
        } catch (Exception $e) {
            return [
                'total_orders' => 0,
                'total_riders' => 0,
                'total_km' => 0,
                'total_amount' => 0
            ];
        }
    }
    
    /**
     * Get all orders
     * @param string $date_from - Start date (YYYY-MM-DD)
     * @param string $date_to - End date (YYYY-MM-DD)
     * @param array $filters - Additional filters
     * @return array - Array of orders
     */
    public function getAllOrders($date_from = null, $date_to = null, $filters = []) {
        $sql = "SELECT o.*,
                r.id as rider_id,
                u_rider.full_name as rider_name,
                c.company_name,
                u_company.full_name as company_contact,
                s.store_name
                FROM orders o
                JOIN riders r ON o.rider_id = r.id
                JOIN users u_rider ON r.user_id = u_rider.id
                JOIN companies c ON o.company_id = c.id
                JOIN users u_company ON c.user_id = u_company.id
                LEFT JOIN company_stores s ON o.store_id = s.id";

        $where_clauses = [];

        if ($date_from) {
            $where_clauses[] = "o.order_date >= :date_from";
        }

        if ($date_to) {
            $where_clauses[] = "o.order_date <= :date_to";
        }

        // Apply additional filters
        if (!empty($filters)) {
            if (isset($filters['rider_id'])) {
                $where_clauses[] = "o.rider_id = :rider_id";
            }

            if (isset($filters['company_id'])) {
                $where_clauses[] = "o.company_id = :company_id";
            }

            if (isset($filters['store_id'])) {
                $where_clauses[] = "o.store_id = :store_id";
            }

            if (isset($filters['status'])) {
                $where_clauses[] = "o.status = :status";
            }

            if (isset($filters['source'])) {
                $where_clauses[] = "o.source = :source";
            }

            if (isset($filters['is_finalized'])) {
                $where_clauses[] = "o.is_finalized = :is_finalized";
            }

            if (isset($filters['week_number'])) {
                $where_clauses[] = "o.week_number = :week_number";
            }

            if (isset($filters['year'])) {
                $where_clauses[] = "o.year = :year";
            }
        }

        // Add WHERE clause if there are any conditions
        if (!empty($where_clauses)) {
            $sql .= " WHERE " . implode(" AND ", $where_clauses);
        }

        $sql .= " ORDER BY o.order_date DESC, o.id DESC";

        // Add LIMIT if specified
        if (isset($filters['limit'])) {
            $sql .= " LIMIT :limit";
        }

        $this->db->query($sql);

        // Bind parameters
        if ($date_from) {
            $this->db->bind(':date_from', $date_from);
        }

        if ($date_to) {
            $this->db->bind(':date_to', $date_to);
        }

        // Bind additional filters
        if (!empty($filters)) {
            if (isset($filters['rider_id'])) {
                $this->db->bind(':rider_id', $filters['rider_id']);
            }

            if (isset($filters['company_id'])) {
                $this->db->bind(':company_id', $filters['company_id']);
            }

            if (isset($filters['store_id'])) {
                $this->db->bind(':store_id', $filters['store_id']);
            }

            if (isset($filters['status'])) {
                $this->db->bind(':status', $filters['status']);
            }

            if (isset($filters['source'])) {
                $this->db->bind(':source', $filters['source']);
            }

            if (isset($filters['is_finalized'])) {
                $this->db->bind(':is_finalized', $filters['is_finalized']);
            }

            if (isset($filters['week_number'])) {
                $this->db->bind(':week_number', $filters['week_number']);
            }

            if (isset($filters['year'])) {
                $this->db->bind(':year', $filters['year']);
            }

            if (isset($filters['limit'])) {
                $this->db->bind(':limit', $filters['limit']);
            }
        }

        return $this->db->resultSet();
    }
    
    /**
     * Get order by ID
     * @param int $id - Order ID
     * @return array - Order data
     */
    public function getOrderById($id) {
        $this->db->query("SELECT o.*,
                        r.id as rider_id,
                        u_rider.full_name as rider_name,
                        c.company_name,
                        u_company.full_name as company_contact,
                        u_added.full_name as added_by_name,
                        s.store_name
                        FROM orders o
                        JOIN riders r ON o.rider_id = r.id
                        JOIN users u_rider ON r.user_id = u_rider.id
                        JOIN companies c ON o.company_id = c.id
                        JOIN users u_company ON c.user_id = u_company.id
                        JOIN users u_added ON o.added_by = u_added.id
                        LEFT JOIN company_stores s ON o.store_id = s.id
                        WHERE o.id = :id");

        $this->db->bind(':id', $id);

        return $this->db->single();
    }

    /**
     * Get order by rider and date
     * @param int $rider_id - Rider ID
     * @param string $order_date - Order date (YYYY-MM-DD)
     * @return array|bool - Order data or false if not found
     */
    public function getOrderByRiderAndDate($rider_id, $order_date) {
        $this->db->query("SELECT * FROM orders WHERE rider_id = :rider_id AND order_date = :order_date");
        $this->db->bind(':rider_id', $rider_id);
        $this->db->bind(':order_date', $order_date);
        return $this->db->single();
    }

    /**
     * Create order
     * @param array $data - Order data
     * @return int|bool - Order ID or false on failure
     */
    public function createOrder($data) {
        $sql = "INSERT INTO orders (
                rider_id, company_id, store_id, order_date,
                order_type, order_count, pay_rate, km_traveled,
                km_rate, source, is_finalized, status, added_by
                ) VALUES (
                :rider_id, :company_id, :store_id, :order_date,
                :order_type, :order_count, :pay_rate, :km_traveled,
                :km_rate, :source, :is_finalized, :status, :added_by
                )";

        $this->db->query($sql);

        $this->db->bind(':rider_id', $data['rider_id']);
        $this->db->bind(':company_id', $data['company_id']);
        $this->db->bind(':store_id', $data['store_id'] ?? null);
        $this->db->bind(':order_date', $data['order_date']);
        $this->db->bind(':order_type', $data['order_type'] ?? 'per_order');
        $this->db->bind(':order_count', $data['order_count'] ?? 0);
        $this->db->bind(':pay_rate', $data['pay_rate'] ?? 0);
        $this->db->bind(':km_traveled', $data['km_traveled'] ?? 0);
        $this->db->bind(':km_rate', $data['km_rate'] ?? 0);
        $this->db->bind(':source', $data['source'] ?? 'manual');
        $this->db->bind(':is_finalized', $data['is_finalized'] ?? false);
        $this->db->bind(':status', $data['status'] ?? 'pending');
        $this->db->bind(':added_by', $data['added_by']);

        if ($this->db->execute()) {
            return $this->db->lastInsertId();
        } else {
            return false;
        }
    }

    /**
     * Update order
     * @param array $data - Order data
     * @return bool - True on success, false on failure
     */
    public function updateOrder($data) {
        $sql = "UPDATE orders SET ";
        $params = [];

        // Build dynamic update query based on provided data
        if (isset($data['order_count'])) {
            $params[] = "order_count = :order_count";
        }

        if (isset($data['pay_rate'])) {
            $params[] = "pay_rate = :pay_rate";
        }

        if (isset($data['km_traveled'])) {
            $params[] = "km_traveled = :km_traveled";
        }

        if (isset($data['km_rate'])) {
            $params[] = "km_rate = :km_rate";
        }

        if (isset($data['order_type'])) {
            $params[] = "order_type = :order_type";
        }

        if (isset($data['store_id'])) {
            $params[] = "store_id = :store_id";
        }

        if (isset($data['status'])) {
            $params[] = "status = :status";
        }

        if (isset($data['is_finalized'])) {
            $params[] = "is_finalized = :is_finalized";
        }

        if (isset($data['source'])) {
            $params[] = "source = :source";
        }

        if (empty($params)) {
            return false; // Nothing to update
        }

        $sql .= implode(", ", $params);
        $sql .= " WHERE id = :id";

        $this->db->query($sql);

        // Bind parameters
        if (isset($data['order_count'])) {
            $this->db->bind(':order_count', $data['order_count']);
        }

        if (isset($data['pay_rate'])) {
            $this->db->bind(':pay_rate', $data['pay_rate']);
        }

        if (isset($data['km_traveled'])) {
            $this->db->bind(':km_traveled', $data['km_traveled']);
        }

        if (isset($data['km_rate'])) {
            $this->db->bind(':km_rate', $data['km_rate']);
        }

        if (isset($data['order_type'])) {
            $this->db->bind(':order_type', $data['order_type']);
        }

        if (isset($data['store_id'])) {
            $this->db->bind(':store_id', $data['store_id']);
        }

        if (isset($data['status'])) {
            $this->db->bind(':status', $data['status']);
        }

        if (isset($data['is_finalized'])) {
            $this->db->bind(':is_finalized', $data['is_finalized']);
        }

        if (isset($data['source'])) {
            $this->db->bind(':source', $data['source']);
        }

        $this->db->bind(':id', $data['id']);

        return $this->db->execute();
    }
    
    /**
     * Delete order
     * @param int $id - Order ID
     * @return bool - True on success, false on failure
     */
    public function deleteOrder($id) {
        $this->db->query("DELETE FROM orders WHERE id = :id");
        $this->db->bind(':id', $id);
        return $this->db->execute();
    }

    /**
     * Get orders for a rider
     * @param int $rider_id - Rider ID
     * @param string $date_from - Start date (YYYY-MM-DD)
     * @param string $date_to - End date (YYYY-MM-DD)
     * @param array $filters - Additional filters
     * @return array - Array of orders
     */
    public function getRiderOrders($rider_id, $date_from = null, $date_to = null, $filters = []) {
        $sql = "SELECT o.*, c.company_name, s.store_name
                FROM orders o
                JOIN companies c ON o.company_id = c.id
                LEFT JOIN company_stores s ON o.store_id = s.id
                WHERE o.rider_id = :rider_id";

        if ($date_from) {
            $sql .= " AND o.order_date >= :date_from";
        }

        if ($date_to) {
            $sql .= " AND o.order_date <= :date_to";
        }

        // Apply additional filters
        if (!empty($filters)) {
            if (isset($filters['company_id'])) {
                $sql .= " AND o.company_id = :company_id";
            }

            if (isset($filters['store_id'])) {
                $sql .= " AND o.store_id = :store_id";
            }

            if (isset($filters['status'])) {
                $sql .= " AND o.status = :status";
            }

            if (isset($filters['source'])) {
                $sql .= " AND o.source = :source";
            }

            if (isset($filters['is_finalized'])) {
                $sql .= " AND o.is_finalized = :is_finalized";
            }

            if (isset($filters['week_number'])) {
                $sql .= " AND o.week_number = :week_number";
            }

            if (isset($filters['year'])) {
                $sql .= " AND o.year = :year";
            }
        }

        $sql .= " ORDER BY o.order_date DESC, o.id DESC";

        // Add LIMIT if specified
        if (isset($filters['limit'])) {
            $sql .= " LIMIT :limit";
        }

        $this->db->query($sql);
        $this->db->bind(':rider_id', $rider_id);

        if ($date_from) {
            $this->db->bind(':date_from', $date_from);
        }

        if ($date_to) {
            $this->db->bind(':date_to', $date_to);
        }

        // Bind additional filters
        if (!empty($filters)) {
            if (isset($filters['company_id'])) {
                $this->db->bind(':company_id', $filters['company_id']);
            }

            if (isset($filters['store_id'])) {
                $this->db->bind(':store_id', $filters['store_id']);
            }

            if (isset($filters['status'])) {
                $this->db->bind(':status', $filters['status']);
            }

            if (isset($filters['source'])) {
                $this->db->bind(':source', $filters['source']);
            }

            if (isset($filters['is_finalized'])) {
                $this->db->bind(':is_finalized', $filters['is_finalized']);
            }

            if (isset($filters['week_number'])) {
                $this->db->bind(':week_number', $filters['week_number']);
            }

            if (isset($filters['year'])) {
                $this->db->bind(':year', $filters['year']);
            }

            if (isset($filters['limit'])) {
                $this->db->bind(':limit', $filters['limit']);
            }
        }

        return $this->db->resultSet();
    }

    /**
     * Get orders by rider (alias for backward compatibility)
     * @param int $rider_id - Rider ID
     * @param string $date_from - Start date (YYYY-MM-DD)
     * @param string $date_to - End date (YYYY-MM-DD)
     * @return array - Array of orders
     */
    public function getOrdersByRider($rider_id, $date_from = null, $date_to = null) {
        return $this->getRiderOrders($rider_id, $date_from, $date_to);
    }
    
    /**
     * Get orders by company
     * @param int $company_id - Company ID
     * @param string $date_from - Start date (YYYY-MM-DD)
     * @param string $date_to - End date (YYYY-MM-DD)
     * @param array $filters - Additional filters
     * @return array - Array of orders
     */
    public function getCompanyOrdersDetailed($company_id, $date_from = null, $date_to = null, $filters = []) {
        $sql = "SELECT o.*,
                r.id as rider_id,
                u.full_name as rider_name,
                s.store_name
                FROM orders o
                JOIN riders r ON o.rider_id = r.id
                JOIN users u ON r.user_id = u.id
                LEFT JOIN company_stores s ON o.store_id = s.id
                WHERE o.company_id = :company_id";

        if ($date_from) {
            $sql .= " AND o.order_date >= :date_from";
        }

        if ($date_to) {
            $sql .= " AND o.order_date <= :date_to";
        }

        // Apply additional filters
        if (!empty($filters)) {
            if (isset($filters['rider_id'])) {
                $sql .= " AND o.rider_id = :rider_id";
            }

            if (isset($filters['store_id'])) {
                $sql .= " AND o.store_id = :store_id";
            }

            if (isset($filters['status'])) {
                $sql .= " AND o.status = :status";
            }

            if (isset($filters['source'])) {
                $sql .= " AND o.source = :source";
            }

            if (isset($filters['is_finalized'])) {
                $sql .= " AND o.is_finalized = :is_finalized";
            }

            if (isset($filters['week_number'])) {
                $sql .= " AND o.week_number = :week_number";
            }

            if (isset($filters['year'])) {
                $sql .= " AND o.year = :year";
            }
        }

        $sql .= " ORDER BY o.order_date DESC, o.id DESC";

        // Add LIMIT if specified
        if (isset($filters['limit'])) {
            $sql .= " LIMIT :limit";
        }

        $this->db->query($sql);
        $this->db->bind(':company_id', $company_id);

        if ($date_from) {
            $this->db->bind(':date_from', $date_from);
        }

        if ($date_to) {
            $this->db->bind(':date_to', $date_to);
        }

        // Bind additional filters
        if (!empty($filters)) {
            if (isset($filters['rider_id'])) {
                $this->db->bind(':rider_id', $filters['rider_id']);
            }

            if (isset($filters['store_id'])) {
                $this->db->bind(':store_id', $filters['store_id']);
            }

            if (isset($filters['status'])) {
                $this->db->bind(':status', $filters['status']);
            }

            if (isset($filters['source'])) {
                $this->db->bind(':source', $filters['source']);
            }

            if (isset($filters['is_finalized'])) {
                $this->db->bind(':is_finalized', $filters['is_finalized']);
            }

            if (isset($filters['week_number'])) {
                $this->db->bind(':week_number', $filters['week_number']);
            }

            if (isset($filters['year'])) {
                $this->db->bind(':year', $filters['year']);
            }

            if (isset($filters['limit'])) {
                $this->db->bind(':limit', $filters['limit']);
            }
        }

        return $this->db->resultSet();
    }

    /**
     * Get orders by company (alias for backward compatibility)
     * @param int $company_id - Company ID
     * @param string $date_from - Start date (YYYY-MM-DD)
     * @param string $date_to - End date (YYYY-MM-DD)
     * @return array - Array of orders
     */
    public function getOrdersByCompany($company_id, $date_from = null, $date_to = null) {
        return $this->getCompanyOrdersDetailed($company_id, $date_from, $date_to);
    }

    /**
     * Get orders by store
     * @param int $store_id - Store ID
     * @param string $date_from - Start date (YYYY-MM-DD)
     * @param string $date_to - End date (YYYY-MM-DD)
     * @param array $filters - Additional filters
     * @return array - Array of orders
     */
    public function getStoreOrders($store_id, $date_from = null, $date_to = null, $filters = []) {
        $sql = "SELECT o.*,
                r.id as rider_id,
                u.full_name as rider_name,
                c.company_name
                FROM orders o
                JOIN riders r ON o.rider_id = r.id
                JOIN users u ON r.user_id = u.id
                JOIN companies c ON o.company_id = c.id
                WHERE o.store_id = :store_id";

        if ($date_from) {
            $sql .= " AND o.order_date >= :date_from";
        }

        if ($date_to) {
            $sql .= " AND o.order_date <= :date_to";
        }

        // Apply additional filters
        if (!empty($filters)) {
            if (isset($filters['rider_id'])) {
                $sql .= " AND o.rider_id = :rider_id";
            }

            if (isset($filters['status'])) {
                $sql .= " AND o.status = :status";
            }

            if (isset($filters['source'])) {
                $sql .= " AND o.source = :source";
            }

            if (isset($filters['is_finalized'])) {
                $sql .= " AND o.is_finalized = :is_finalized";
            }

            if (isset($filters['week_number'])) {
                $sql .= " AND o.week_number = :week_number";
            }

            if (isset($filters['year'])) {
                $sql .= " AND o.year = :year";
            }
        }

        $sql .= " ORDER BY o.order_date DESC, o.id DESC";

        // Add LIMIT if specified
        if (isset($filters['limit'])) {
            $sql .= " LIMIT :limit";
        }

        $this->db->query($sql);
        $this->db->bind(':store_id', $store_id);

        if ($date_from) {
            $this->db->bind(':date_from', $date_from);
        }

        if ($date_to) {
            $this->db->bind(':date_to', $date_to);
        }

        // Bind additional filters
        if (!empty($filters)) {
            if (isset($filters['rider_id'])) {
                $this->db->bind(':rider_id', $filters['rider_id']);
            }

            if (isset($filters['status'])) {
                $this->db->bind(':status', $filters['status']);
            }

            if (isset($filters['source'])) {
                $this->db->bind(':source', $filters['source']);
            }

            if (isset($filters['is_finalized'])) {
                $this->db->bind(':is_finalized', $filters['is_finalized']);
            }

            if (isset($filters['week_number'])) {
                $this->db->bind(':week_number', $filters['week_number']);
            }

            if (isset($filters['year'])) {
                $this->db->bind(':year', $filters['year']);
            }

            if (isset($filters['limit'])) {
                $this->db->bind(':limit', $filters['limit']);
            }
        }

        return $this->db->resultSet();
    }
    
    /**
     * Get orders by supplier
     * @param int $supplier_id - Supplier ID
     * @param string $date_from - Start date (YYYY-MM-DD)
     * @param string $date_to - End date (YYYY-MM-DD)
     * @return array - Array of orders
     */
    public function getOrdersBySupplier($supplier_id, $date_from = null, $date_to = null) {
        $sql = "SELECT o.*,
                r.id as rider_id,
                u_rider.full_name as rider_name,
                c.company_name
                FROM orders o
                JOIN riders r ON o.rider_id = r.id
                JOIN users u_rider ON r.user_id = u_rider.id
                JOIN companies c ON o.company_id = c.id
                WHERE r.created_by = :supplier_id";

        if ($date_from) {
            $sql .= " AND o.order_date >= :date_from";
        }

        if ($date_to) {
            $sql .= " AND o.order_date <= :date_to";
        }

        $sql .= " ORDER BY o.order_date DESC";

        $this->db->query($sql);
        $this->db->bind(':supplier_id', $supplier_id);

        if ($date_from) {
            $this->db->bind(':date_from', $date_from);
        }

        if ($date_to) {
            $this->db->bind(':date_to', $date_to);
        }

        return $this->db->resultSet();
    }

    /**
     * Get orders by status
     * @param string $status - Order status (pending, completed, cancelled)
     * @param string $date_from - Start date (YYYY-MM-DD)
     * @param string $date_to - End date (YYYY-MM-DD)
     * @return array - Array of orders
     */
    public function getOrdersByStatus($status, $date_from = null, $date_to = null) {
        $sql = "SELECT o.*,
                r.id as rider_id,
                u_rider.full_name as rider_name,
                c.company_name,
                (o.order_count * o.pay_rate) as total_earnings
                FROM orders o
                JOIN riders r ON o.rider_id = r.id
                JOIN users u_rider ON r.user_id = u_rider.id
                JOIN companies c ON o.company_id = c.id
                WHERE o.status = :status";

        if ($date_from) {
            $sql .= " AND o.order_date >= :date_from";
        }

        if ($date_to) {
            $sql .= " AND o.order_date <= :date_to";
        }

        $sql .= " ORDER BY o.order_date DESC";

        $this->db->query($sql);
        $this->db->bind(':status', $status);

        if ($date_from) {
            $this->db->bind(':date_from', $date_from);
        }

        if ($date_to) {
            $this->db->bind(':date_to', $date_to);
        }

        return $this->db->resultSet();
    }
    
    /**
     * Get order statistics
     * @param string $period - Period (daily, weekly, monthly, yearly)
     * @param string $date_from - Start date (YYYY-MM-DD)
     * @param string $date_to - End date (YYYY-MM-DD)
     * @return array - Statistics data
     */
    public function getOrderStatistics($period = 'daily', $date_from = null, $date_to = null) {
        $group_by = '';
        $date_format = '';
        
        switch ($period) {
            case 'daily':
                $group_by = 'o.order_date';
                $date_format = '%Y-%m-%d';
                break;
            case 'weekly':
                $group_by = 'YEARWEEK(o.order_date, 1)';
                $date_format = '%x-W%v';
                break;
            case 'monthly':
                $group_by = 'YEAR(o.order_date), MONTH(o.order_date)';
                $date_format = '%Y-%m';
                break;
            case 'yearly':
                $group_by = 'YEAR(o.order_date)';
                $date_format = '%Y';
                break;
            default:
                $group_by = 'o.order_date';
                $date_format = '%Y-%m-%d';
        }
        
        $sql = "SELECT 
                DATE_FORMAT(o.order_date, '$date_format') as period, 
                COUNT(*) as order_entries, 
                SUM(o.order_count) as total_orders, 
                SUM(o.total_earnings) as total_earnings, 
                AVG(o.pay_rate) as avg_pay_rate 
                FROM orders o";
        
        $where = [];
        
        if ($date_from) {
            $where[] = "o.order_date >= :date_from";
        }
        
        if ($date_to) {
            $where[] = "o.order_date <= :date_to";
        }
        
        if (!empty($where)) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }
        
        $sql .= " GROUP BY $group_by ORDER BY o.order_date ASC";
        
        $this->db->query($sql);
        
        if ($date_from) {
            $this->db->bind(':date_from', $date_from);
        }
        
        if ($date_to) {
            $this->db->bind(':date_to', $date_to);
        }
        
        return $this->db->resultSet();
    }
    
    /**
     * Check if order exists for rider and date
     * @param int $rider_id - Rider ID
     * @param int $company_id - Company ID
     * @param string $order_date - Order date
     * @return array|bool - Order data or false if not found
     */
    public function checkOrderExists($rider_id, $company_id, $order_date) {
        $this->db->query("SELECT * FROM orders 
                        WHERE rider_id = :rider_id 
                        AND company_id = :company_id 
                        AND order_date = :order_date");
        
        $this->db->bind(':rider_id', $rider_id);
        $this->db->bind(':company_id', $company_id);
        $this->db->bind(':order_date', $order_date);
        
        $result = $this->db->single();
        
        return $result ? $result : false;
    }

    /**
     * Get all distinct order statuses
     * @return array - Array of order statuses
     */
    public function getOrderStatuses() {
        $this->db->query("SELECT DISTINCT status FROM orders ORDER BY status ASC");
        $results = $this->db->resultSet();
        
        $statuses = [];
        foreach ($results as $result) {
            $statuses[] = $result['status'];
        }
        
        return $statuses;
    }

    /**
     * Update order status
     * @param array $data - Order data containing id and status
     * @return bool - True on success, false on failure
     */
    public function updateOrderStatus($data) {
        $this->db->query("UPDATE orders SET status = :status WHERE id = :id");
        
        $this->db->bind(':status', $data['status']);
        $this->db->bind(':id', $data['id']);
        
        return $this->db->execute();
    }

    /**
     * Get total number of orders (alternative implementation)
     * @return int Total orders count
     * @deprecated Use countAllOrders() instead
     */
    private function _countAllOrdersAlt() {
        try {
            $result = $this->db->select("SELECT COUNT(*) as count FROM orders");
            return $result[0]['count'] ?? 0;
        } catch (Exception $e) {
            error_log("Error counting all orders: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get monthly order trends (alternative implementation)
     * @param int $months Number of months to analyze
     * @return array Monthly order trends
     * @deprecated Use getMonthlyOrderTrends() instead
     */
    private function _getMonthlyOrderTrendsAlt($months = 6) {
        try {
            return $this->db->select("
                SELECT 
                    DATE_FORMAT(order_date, '%Y-%m') as month,
                    COUNT(*) as count
                FROM orders
                WHERE order_date >= DATE_SUB(CURRENT_DATE, INTERVAL ? MONTH)
                GROUP BY DATE_FORMAT(order_date, '%Y-%m')
                ORDER BY month ASC
            ", [$months]);
        } catch (Exception $e) {
            error_log("Error getting monthly order trends: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get order statistics by status (simplified version)
     * @return array Order statistics
     * @deprecated Use getOrderStatistics($period, $date_from, $date_to) instead
     */
    private function getOrderStatisticsByStatus() {
        try {
            $stats = $this->db->select("
                SELECT
                    status,
                    COUNT(*) as count,
                    COALESCE(SUM(total_earnings), 0) as total_earnings
                FROM orders
                GROUP BY status
            ");

            $result = [
                'total' => 0,
                'pending' => 0,
                'completed' => 0,
                'cancelled' => 0,
                'total_earnings' => 0
            ];

            foreach ($stats as $stat) {
                $result[$stat['status']] = $stat['count'];
                $result['total'] += $stat['count'];
                $result['total_earnings'] += $stat['total_earnings'];
            }

            return $result;
        } catch (Exception $e) {
            error_log("Error getting order statistics: " . $e->getMessage());
            return [
                'total' => 0,
                'pending' => 0,
                'completed' => 0,
                'cancelled' => 0,
                'total_earnings' => 0
            ];
        }
    }

    /**
     * Get orders by date range
     * @param string $date_from Start date
     * @param string $date_to End date
     * @return array Orders in date range
     */
    public function getOrdersByDateRange($date_from, $date_to) {
        try {
            return $this->db->select("
                SELECT 
                    o.*,
                    r.full_name as rider_name,
                    c.company_name
                FROM orders o
                LEFT JOIN riders r ON o.rider_id = r.id
                LEFT JOIN companies c ON o.company_id = c.id
                WHERE o.order_date BETWEEN ? AND ?
                ORDER BY o.order_date DESC
            ", [$date_from, $date_to]);
        } catch (Exception $e) {
            error_log("Error getting orders by date range: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Create a new order using simplified method
     * @param array $data Order data
     * @return int|false New order ID or false on failure
     * @deprecated Use createOrder() instead
     */
    private function createOrderSimple($data) {
        try {
            return $this->db->insert('orders', $data);
        } catch (Exception $e) {
            error_log("Error creating order: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update an order using simplified method
     * @param int $id Order ID
     * @param array $data Order data
     * @return bool Success status
     * @deprecated Use updateOrder() instead
     */
    private function updateOrderSimple($id, $data) {
        try {
            return $this->db->update('orders', $data, ['id' => $id]);
        } catch (Exception $e) {
            error_log("Error updating order: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete an order using simplified method
     * @param int $id Order ID
     * @return bool Success status
     * @deprecated Use deleteOrder() instead
     */
    private function deleteOrderSimple($id) {
        try {
            return $this->db->delete('orders', ['id' => $id]);
        } catch (Exception $e) {
            error_log("Error deleting order: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Count orders for a specific date (alternative implementation with error handling)
     * @param string $date - Date (YYYY-MM-DD)
     * @return int - Number of orders for the date
     * @deprecated Use countOrdersByDate() instead
     */
    private function _countOrdersByDateAlt($date) {
        try {
            $this->db->query("SELECT COUNT(*) as count FROM orders WHERE order_date = :date");
            $this->db->bind(':date', $date);
            $result = $this->db->single();
            return $result && isset($result['count']) ? (int)$result['count'] : 0;
        } catch (Exception $e) {
            error_log("Error in countOrdersByDate: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get distribution of order statuses
     * @param string $start_date Optional start date (YYYY-MM-DD)
     * @param string $end_date Optional end date (YYYY-MM-DD)
     * @return array Distribution of order statuses
     */
    public function getDistributionOfOrderStatuses($start_date = null, $end_date = null) {
        try {
            $sql = "SELECT status, COUNT(*) as count 
                    FROM orders 
                    WHERE 1=1";
            
            $params = [];
            
            if ($start_date) {
                $sql .= " AND order_date >= :start_date";
                $params[':start_date'] = $start_date;
            }
            
            if ($end_date) {
                $sql .= " AND order_date <= :end_date";
                $params[':end_date'] = $end_date;
            }
            
            $sql .= " GROUP BY status";
            
            $this->db->query($sql);
            
            foreach ($params as $param => $value) {
                $this->db->bind($param, $value);
            }
            
            $results = $this->db->resultSet();
            
            $distribution = [];
            foreach ($results as $row) {
                $distribution[$row['status']] = (int)$row['count'];
            }
            
            return $distribution;
        } catch (Exception $e) {
            error_log("Error in getDistributionOfOrderStatuses: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get recent orders
     * @param int $limit - Number of recent orders to fetch (default 5)
     * @return array - Array of recent orders
     */


    /**
     * Count orders with filters
     * @param string $status - Status filter
     * @param string $search - Search term
     * @param string $date_from - Start date (YYYY-MM-DD)
     * @param string $date_to - End date (YYYY-MM-DD)
     * @return int - Total number of orders matching the filters
     */
    public function countOrdersWithFilters($status = null, $search = null, $company_id = null, $rider_id = null, $date_from = null, $date_to = null) {
        $sql = "SELECT COUNT(*) as total FROM orders o 
                JOIN riders r ON o.rider_id = r.id 
                JOIN users u_rider ON r.user_id = u_rider.id 
                JOIN companies c ON o.company_id = c.id 
                JOIN users u_company ON c.user_id = u_company.id 
                WHERE 1=1";
        
        $params = [];
        
        if ($status) {
            $sql .= " AND o.status = :status";
            $params[':status'] = $status;
        }
        
        if ($search) {
            $sql .= " AND (u_rider.full_name LIKE :search OR c.company_name LIKE :search)";
            $params[':search'] = "%$search%";
        }
        
        if ($company_id) {
            $sql .= " AND o.company_id = :company_id";
            $params[':company_id'] = $company_id;
        }
        
        if ($rider_id) {
            $sql .= " AND o.rider_id = :rider_id";
            $params[':rider_id'] = $rider_id;
        }
        
        if ($date_from) {
            $sql .= " AND o.order_date >= :date_from";
            $params[':date_from'] = $date_from;
        }
        
        if ($date_to) {
            $sql .= " AND o.order_date <= :date_to";
            $params[':date_to'] = $date_to;
        }
        
        $this->db->query($sql);
        
        foreach ($params as $param => $value) {
            $this->db->bind($param, $value);
        }
        
        $result = $this->db->single();
        return $result['total'];
    }
    
    /**
     * Get orders with filters and pagination
     * @param string $status - Status filter
     * @param string $search - Search term
     * @param int $company_id - Company ID filter
     * @param int $rider_id - Rider ID filter
     * @param string $date_from - Start date (YYYY-MM-DD)
     * @param string $date_to - End date (YYYY-MM-DD)
     * @param int $limit - Records per page
     * @param int $offset - Offset for pagination
     * @return array - Array of orders
     */
    public function getOrdersWithFilters($status = null, $search = null, $company_id = null, $rider_id = null, $date_from = null, $date_to = null, $limit = 10, $offset = 0) {
        try {
            $sql = "SELECT o.*, 
                    r.id as rider_id, 
                    u_rider.full_name as rider_name, 
                    c.company_name, 
                    u_company.full_name as company_contact,
                    (o.order_count * o.pay_rate) as total_earnings 
                    FROM orders o 
                    JOIN riders r ON o.rider_id = r.id 
                    JOIN users u_rider ON r.user_id = u_rider.id 
                    JOIN companies c ON o.company_id = c.id 
                    JOIN users u_company ON c.user_id = u_company.id 
                    WHERE 1=1";
            
            $params = [];
            
            if ($status) {
                $sql .= " AND o.status = :status";
                $params[':status'] = $status;
            }
            
            if ($search) {
                $sql .= " AND (u_rider.full_name LIKE :search OR c.company_name LIKE :search)";
                $params[':search'] = "%$search%";
            }
            
            if ($company_id) {
                $sql .= " AND o.company_id = :company_id";
                $params[':company_id'] = $company_id;
            }
            
            if ($rider_id) {
                $sql .= " AND o.rider_id = :rider_id";
                $params[':rider_id'] = $rider_id;
            }
            
            if ($date_from) {
                $sql .= " AND o.order_date >= :date_from";
                $params[':date_from'] = $date_from;
            }
            
            if ($date_to) {
                $sql .= " AND o.order_date <= :date_to";
                $params[':date_to'] = $date_to;
            }
            
            $sql .= " ORDER BY o.order_date DESC, o.id DESC LIMIT :limit OFFSET :offset";
            $params[':limit'] = $limit;
            $params[':offset'] = $offset;
            
            $this->db->query($sql);
            
            foreach ($params as $param => $value) {
                $this->db->bind($param, $value);
            }
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getOrdersWithFilters: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get daily order uploads
     * @param int $limit - Number of uploads to return
     * @return array - Array of daily order uploads
     */
    public function getDailyOrderUploads($limit = 10, $rider_id = null) {
        try {
            // Check if daily_order_uploads table exists
            $this->db->query("SHOW TABLES LIKE 'daily_order_uploads'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                // Create the daily_order_uploads table
                $this->db->query("CREATE TABLE IF NOT EXISTS `daily_order_uploads` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `rider_id` int(11) NOT NULL,
                    `company_id` int(11) DEFAULT NULL,
                    `store_id` int(11) DEFAULT NULL,
                    `file_name` varchar(255) NOT NULL,
                    `original_file_name` varchar(255) NOT NULL,
                    `file_path` varchar(255) NOT NULL,
                    `file_size` int(11) NOT NULL,
                    `file_type` varchar(100) NOT NULL,
                    `upload_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `status` varchar(20) NOT NULL DEFAULT 'pending',
                    `processed_date` datetime DEFAULT NULL,
                    `processed_by` int(11) DEFAULT NULL,
                    `remarks` text DEFAULT NULL,
                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    KEY `rider_id` (`rider_id`),
                    KEY `upload_date` (`upload_date`),
                    KEY `status` (`status`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $this->db->execute();
                
                // Insert sample data
                $this->db->query("INSERT INTO `daily_order_uploads` 
                    (`rider_id`, `file_name`, `original_file_name`, `file_path`, `file_size`, `file_type`, `upload_date`, `status`) 
                    VALUES 
                    (:rider_id, 'sample_upload_1.xlsx', 'daily_orders.xlsx', '/uploads/daily_orders/sample_upload_1.xlsx', 12345, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', NOW(), 'completed')");
                $this->db->bind(':rider_id', $rider_id ? $rider_id : 1);
                $this->db->execute();
            }
            
            // Base query with company and store information
            $sql = "SELECT du.*, 
                   c.company_name, 
                   cs.store_name,
                   (SELECT COUNT(*) FROM daily_rider_orders dro WHERE dro.upload_id = du.id) AS order_count,
                   (SELECT GROUP_CONCAT(DISTINCT dro.rider_name SEPARATOR ', ') FROM daily_rider_orders dro WHERE dro.upload_id = du.id) AS rider_name
                   FROM daily_order_uploads du
                   LEFT JOIN companies c ON du.company_id = c.id
                   LEFT JOIN company_stores cs ON du.store_id = cs.id";
            
            // No filter by rider_id for now
            // if ($rider_id) {
            //     $sql .= " WHERE du.rider_id = :rider_id";
            // }
            
            $sql .= " ORDER BY du.upload_date DESC LIMIT :limit";
            
            $this->db->query($sql);
            
            // Commented out for now
            // if ($rider_id) {
            //     $this->db->bind(':rider_id', $rider_id);
            // }
            
            $this->db->bind(':limit', $limit);
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getDailyOrderUploads: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get daily rider orders by date
     * @param int $rider_id - Rider ID
     * @param string $date - Order date (YYYY-MM-DD)
     * @return array - Array of daily rider orders
     */
    public function getDailyRiderOrdersByDate($rider_id, $date) {
        try {
            // Check if daily_rider_orders table exists
            $this->db->query("SHOW TABLES LIKE 'daily_rider_orders'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                return [];
            }
            
            $this->db->query("SELECT dro.*, duo.file_name, duo.upload_date 
                            FROM daily_rider_orders dro
                            JOIN daily_order_uploads duo ON dro.upload_id = duo.id
                            WHERE dro.rider_id = :rider_id
                            AND dro.order_date = :date
                            ORDER BY duo.upload_date DESC");
            
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':date', $date);
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getDailyRiderOrdersByDate: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get rider's daily orders for a date range
     * @param int $rider_id - Rider ID
     * @param string $start_date - Start date (YYYY-MM-DD)
     * @param string $end_date - End date (YYYY-MM-DD)
     * @return array - Array of daily rider orders
     */
    public function getRiderDailyOrders($rider_id, $start_date = null, $end_date = null) {
        try {
            // Check if daily_rider_orders table exists
            $this->db->query("SHOW TABLES LIKE 'daily_rider_orders'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                // Create the daily_rider_orders table
                $this->db->query("CREATE TABLE IF NOT EXISTS `daily_rider_orders` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `rider_id` int(11) NOT NULL,
                    `company_id` int(11) DEFAULT NULL,
                    `store_id` int(11) DEFAULT NULL,
                    `order_date` date NOT NULL,
                    `order_count` int(11) NOT NULL DEFAULT 0,
                    `per_order_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
                    `total_earning` decimal(10,2) NOT NULL DEFAULT 0.00,
                    `upload_id` int(11) DEFAULT NULL,
                    `upload_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    KEY `rider_id` (`rider_id`),
                    KEY `order_date` (`order_date`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $this->db->execute();
            }
            
            // Check if daily_order_uploads table exists
            $this->db->query("SHOW TABLES LIKE 'daily_order_uploads'");
            $uploads_table_exists = !empty($this->db->resultSet());
            
            if (!$uploads_table_exists) {
                // Create the daily_order_uploads table
                $this->db->query("CREATE TABLE IF NOT EXISTS `daily_order_uploads` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `rider_id` int(11) NOT NULL,
                    `file_name` varchar(255) NOT NULL,
                    `original_file_name` varchar(255) NOT NULL,
                    `file_path` varchar(255) NOT NULL,
                    `file_size` int(11) NOT NULL,
                    `file_type` varchar(100) NOT NULL,
                    `upload_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `status` varchar(20) NOT NULL DEFAULT 'pending',
                    `processed_date` datetime DEFAULT NULL,
                    `processed_by` int(11) DEFAULT NULL,
                    `remarks` text DEFAULT NULL,
                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    KEY `rider_id` (`rider_id`),
                    KEY `upload_date` (`upload_date`),
                    KEY `status` (`status`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $this->db->execute();
                
                // Insert sample data
                $this->db->query("INSERT INTO `daily_order_uploads` 
                    (`rider_id`, `file_name`, `original_file_name`, `file_path`, `file_size`, `file_type`, `upload_date`, `status`) 
                    VALUES 
                    (:rider_id, 'sample_upload_1.xlsx', 'daily_orders.xlsx', '/uploads/daily_orders/sample_upload_1.xlsx', 12345, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', NOW(), 'completed')");
                $this->db->bind(':rider_id', $rider_id);
                $this->db->execute();
                
                // Insert sample data into daily_rider_orders
                $this->db->query("INSERT INTO `daily_rider_orders` 
                    (`rider_id`, `company_id`, `store_id`, `order_date`, `order_count`, `per_order_amount`, `total_earning`, `upload_id`) 
                    VALUES 
                    (:rider_id, 1, 1, CURDATE(), 10, 50.00, 500.00, 1),
                    (:rider_id, 1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 8, 50.00, 400.00, 1),
                    (:rider_id, 1, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 12, 50.00, 600.00, 1),
                    (:rider_id, 1, 1, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 15, 50.00, 750.00, 1),
                    (:rider_id, 1, 1, DATE_SUB(CURDATE(), INTERVAL 14 DAY), 9, 50.00, 450.00, 1)");
                $this->db->bind(':rider_id', $rider_id);
                $this->db->execute();
            }
            
            // Debug: Check if there are any records in the daily_rider_orders table
            $this->db->query("SELECT COUNT(*) as count FROM daily_rider_orders WHERE rider_id = :rider_id");
            $this->db->bind(':rider_id', $rider_id);
            $count = $this->db->single();
            error_log("Number of daily_rider_orders records for rider_id $rider_id: " . $count['count']);
            
            // Debug log
            error_log("Getting daily orders for rider ID: " . $rider_id);
            
            $sql = "SELECT dro.*, 
                           duo.file_name, 
                           duo.upload_date, 
                           duo.id as upload_id,
                           c.company_name, 
                           cs.store_name
                    FROM daily_rider_orders dro
                    LEFT JOIN daily_order_uploads duo ON dro.upload_id = duo.id
                    LEFT JOIN companies c ON dro.company_id = c.id
                    LEFT JOIN company_stores cs ON dro.store_id = cs.id
                    WHERE dro.rider_id = :rider_id";
            
            $params = [':rider_id' => $rider_id];
            
            if ($start_date) {
                $sql .= " AND dro.order_date >= :start_date";
                $params[':start_date'] = $start_date;
            }
            
            if ($end_date) {
                $sql .= " AND dro.order_date <= :end_date";
                $params[':end_date'] = $end_date;
            }
            
            $sql .= " ORDER BY dro.order_date DESC, duo.upload_date DESC";
            
            $this->db->query($sql);
            
            foreach ($params as $param => $value) {
                $this->db->bind($param, $value);
            }
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getRiderDailyOrders: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get latest daily order for a rider
     * @param int $rider_id - Rider ID
     * @return array|bool - Daily order data or false if not found
     */
    public function getLatestDailyOrder($rider_id) {
        try {
            // Check if daily_rider_orders table exists
            $this->db->query("SHOW TABLES LIKE 'daily_rider_orders'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                return false;
            }
            
            $this->db->query("SELECT dro.*, duo.file_name, duo.upload_date 
                            FROM daily_rider_orders dro
                            JOIN daily_order_uploads duo ON dro.upload_id = duo.id
                            WHERE dro.rider_id = :rider_id
                            ORDER BY dro.order_date DESC, duo.upload_date DESC
                            LIMIT 1");
            
            $this->db->bind(':rider_id', $rider_id);
            
            return $this->db->single();
        } catch (Exception $e) {
            error_log("Error in getLatestDailyOrder: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get orders with advanced advanced filters
     * @param string $date_from - Start date (YYYY-MM-DD)
     * @param string $date_to - End date (YYYY-MM-DD)
     * @param string $status - Status filter
     * @param int $company_id - Company ID filter
     * @param int $store_id - Store ID filter
     * @param int $rider_id - Rider ID filter
     * @param int $page - Page number
     * @param int $limit - Results per page
     * @return array - Array of orders
     */
    public function getOrdersWithAdvancedAdvancedFilters($date_from = null, $date_to = null, $status = null, $company_id = null, $store_id = null, $rider_id = null, $page = 0, $limit = 20) {
        try {
            $sql = "SELECT o.*, r.id as rider_id, u.full_name as rider_name, c.company_name, s.store_name 
                    FROM orders o 
                    LEFT JOIN riders r ON o.rider_id = r.id 
                    LEFT JOIN users u ON r.user_id = u.id 
                    LEFT JOIN companies c ON o.company_id = c.id 
                    LEFT JOIN stores s ON o.store_id = s.id 
                    WHERE 1=1";
            
            $params = [];
            
            if ($date_from) {
                $sql .= " AND o.order_date >= :date_from";
                $params[':date_from'] = $date_from;
            }
            
            if ($date_to) {
                $sql .= " AND o.order_date <= :date_to";
                $params[':date_to'] = $date_to;
            }
            
            if ($status) {
                $sql .= " AND o.status = :status";
                $params[':status'] = $status;
            }
            
            if ($company_id) {
                $sql .= " AND o.company_id = :company_id";
                $params[':company_id'] = $company_id;
            }
            
            if ($store_id) {
                $sql .= " AND o.store_id = :store_id";
                $params[':store_id'] = $store_id;
            }
            
            if ($rider_id) {
                $sql .= " AND o.rider_id = :rider_id";
                $params[':rider_id'] = $rider_id;
            }
            
            $sql .= " ORDER BY o.order_date DESC";
            
            if ($limit > 0) {
                $sql .= " LIMIT :offset, :limit";
                $params[':offset'] = $page * $limit;
                $params[':limit'] = $limit;
            }
            
            $this->db->query($sql);
            
            foreach ($params as $key => $value) {
                $this->db->bind($key, $value);
            }
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getOrdersWithAdvancedFilters: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get daily order uploads with optional limit
     * @param int|null $limit - Limit the number of results (null for no limit)
     * @return array - Array of daily order uploads
     */
    public function getDailyOrderUploadsExtended($limit = null, $rider_id = null) {
        try {
            // Check if daily_order_uploads table exists
            $this->db->query("SHOW TABLES LIKE 'daily_order_uploads'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                return [];
            }
            
            $sql = "SELECT du.*, 
                   c.company_name, 
                   cs.store_name,
                   (SELECT GROUP_CONCAT(DISTINCT dro.rider_name SEPARATOR ', ') 
                    FROM daily_rider_orders dro 
                    WHERE dro.upload_id = du.id) AS rider_names
                   FROM daily_order_uploads du
                   LEFT JOIN companies c ON du.company_id = c.id
                   LEFT JOIN company_stores cs ON du.store_id = cs.id";
            
            // If rider_id is provided, only show uploads that include this rider
            if ($rider_id) {
                $sql .= " WHERE EXISTS (
                    SELECT 1 FROM daily_rider_orders dro 
                    WHERE dro.upload_id = du.id AND dro.rider_id = :rider_id
                )";
            }
            
            $sql .= " ORDER BY du.upload_date DESC";
            
            if ($limit !== null) {
                $sql .= " LIMIT :limit";
            }
            
            $this->db->query($sql);
            
            if ($rider_id) {
                $this->db->bind(':rider_id', $rider_id);
            }
            
            if ($limit !== null) {
                $this->db->bind(':limit', $limit);
            }
            
            return $this->db->resultSet();
        } catch (Exception $e) {
            error_log("Error in getDailyOrderUploadsExtended: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get daily order by ID
     * @param int $id - Daily order ID
     * @return array|null - Daily order data or null if not found
     */
    public function getDailyOrderById($id) {
        try {
            $this->db->query("SELECT * FROM daily_rider_orders WHERE id = :id");
            $this->db->bind(':id', $id);
            return $this->db->single();
        } catch (Exception $e) {
            error_log("Error in getDailyOrderById: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get rider earnings statistics
     * @param int $rider_id - Rider ID
     * @return array - Array of earnings statistics
     */
    public function getRiderEarningsStats($rider_id) {
        try {
            // Check if companies table exists
            $this->db->query("SHOW TABLES LIKE 'companies'");
            $companies_table_exists = !empty($this->db->resultSet());
            
            if (!$companies_table_exists) {
                // Create the companies table
                $this->db->query("CREATE TABLE IF NOT EXISTS `companies` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `company_name` varchar(255) NOT NULL,
                    `company_code` varchar(50) DEFAULT NULL,
                    `contact_person` varchar(255) DEFAULT NULL,
                    `contact_email` varchar(255) DEFAULT NULL,
                    `contact_phone` varchar(20) DEFAULT NULL,
                    `address` text DEFAULT NULL,
                    `city` varchar(100) DEFAULT NULL,
                    `state` varchar(100) DEFAULT NULL,
                    `postal_code` varchar(20) DEFAULT NULL,
                    `country` varchar(100) DEFAULT NULL,
                    `status` varchar(20) NOT NULL DEFAULT 'active',
                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    UNIQUE KEY `company_code` (`company_code`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $this->db->execute();
                
                // Insert sample data
                $this->db->query("INSERT INTO `companies` 
                    (`id`, `company_name`, `company_code`, `contact_person`, `contact_email`, `contact_phone`, `status`) 
                    VALUES 
                    (1, 'Sample Company', 'SAMPLE', 'John Doe', 'john@example.com', '1234567890', 'active')");
                $this->db->execute();
            }
            
            // Check if company_stores table exists
            $this->db->query("SHOW TABLES LIKE 'company_stores'");
            $stores_table_exists = !empty($this->db->resultSet());
            
            if (!$stores_table_exists) {
                // Create the company_stores table
                $this->db->query("CREATE TABLE IF NOT EXISTS `company_stores` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `company_id` int(11) NOT NULL,
                    `store_name` varchar(255) NOT NULL,
                    `store_code` varchar(50) DEFAULT NULL,
                    `contact_person` varchar(255) DEFAULT NULL,
                    `contact_email` varchar(255) DEFAULT NULL,
                    `contact_phone` varchar(20) DEFAULT NULL,
                    `address` text DEFAULT NULL,
                    `city` varchar(100) DEFAULT NULL,
                    `state` varchar(100) DEFAULT NULL,
                    `postal_code` varchar(20) DEFAULT NULL,
                    `country` varchar(100) DEFAULT NULL,
                    `status` varchar(20) NOT NULL DEFAULT 'active',
                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    KEY `company_id` (`company_id`),
                    UNIQUE KEY `store_code` (`store_code`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $this->db->execute();
                
                // Insert sample data
                $this->db->query("INSERT INTO `company_stores` 
                    (`id`, `company_id`, `store_name`, `store_code`, `contact_person`, `contact_email`, `contact_phone`, `status`) 
                    VALUES 
                    (1, 1, 'Sample Store', 'STORE1', 'Jane Doe', 'jane@example.com', '0987654321', 'active')");
                $this->db->execute();
            }
            
            // Check if companies table exists
            $this->db->query("SHOW TABLES LIKE 'companies'");
            $companies_table_exists = !empty($this->db->resultSet());
            
            if (!$companies_table_exists) {
                // Create the companies table
                $this->db->query("CREATE TABLE IF NOT EXISTS `companies` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `company_name` varchar(255) NOT NULL,
                    `company_code` varchar(50) DEFAULT NULL,
                    `contact_person` varchar(255) DEFAULT NULL,
                    `contact_email` varchar(255) DEFAULT NULL,
                    `contact_phone` varchar(20) DEFAULT NULL,
                    `address` text DEFAULT NULL,
                    `city` varchar(100) DEFAULT NULL,
                    `state` varchar(100) DEFAULT NULL,
                    `postal_code` varchar(20) DEFAULT NULL,
                    `country` varchar(100) DEFAULT NULL,
                    `status` varchar(20) NOT NULL DEFAULT 'active',
                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    UNIQUE KEY `company_code` (`company_code`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $this->db->execute();
                
                // Insert sample data
                $this->db->query("INSERT INTO `companies` 
                    (`id`, `company_name`, `company_code`, `contact_person`, `contact_email`, `contact_phone`, `status`) 
                    VALUES 
                    (1, 'Sample Company', 'SAMPLE', 'John Doe', 'john@example.com', '1234567890', 'active')");
                $this->db->execute();
            }
            
            // Check if company_stores table exists
            $this->db->query("SHOW TABLES LIKE 'company_stores'");
            $stores_table_exists = !empty($this->db->resultSet());
            
            if (!$stores_table_exists) {
                // Create the company_stores table
                $this->db->query("CREATE TABLE IF NOT EXISTS `company_stores` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `company_id` int(11) NOT NULL,
                    `store_name` varchar(255) NOT NULL,
                    `store_code` varchar(50) DEFAULT NULL,
                    `contact_person` varchar(255) DEFAULT NULL,
                    `contact_email` varchar(255) DEFAULT NULL,
                    `contact_phone` varchar(20) DEFAULT NULL,
                    `address` text DEFAULT NULL,
                    `city` varchar(100) DEFAULT NULL,
                    `state` varchar(100) DEFAULT NULL,
                    `postal_code` varchar(20) DEFAULT NULL,
                    `country` varchar(100) DEFAULT NULL,
                    `status` varchar(20) NOT NULL DEFAULT 'active',
                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    KEY `company_id` (`company_id`),
                    UNIQUE KEY `store_code` (`store_code`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $this->db->execute();
                
                // Insert sample data
                $this->db->query("INSERT INTO `company_stores` 
                    (`id`, `company_id`, `store_name`, `store_code`, `contact_person`, `contact_email`, `contact_phone`, `status`) 
                    VALUES 
                    (1, 1, 'Sample Store', 'STORE1', 'Jane Doe', 'jane@example.com', '0987654321', 'active')");
                $this->db->execute();
            }
            
            $stats = [
                'total_orders' => 0,
                'total_earnings' => 0,
                'weekly_earnings' => 0,
                'monthly_earnings' => 0,
                'advance_requested' => 0,
                'advance_paid' => 0,
                'advance_pending' => 0,
                'due_amount' => 0,
                'current_week_name' => 'Current Week',
                'current_week' => date('W'),
                'current_month' => date('n'),
                'current_year' => date('Y')
            ];
            
            // Check if daily_rider_orders table exists
            $this->db->query("SHOW TABLES LIKE 'daily_rider_orders'");
            $table_exists = !empty($this->db->resultSet());
            
            if (!$table_exists) {
                // Create the daily_rider_orders table
                $this->db->query("CREATE TABLE IF NOT EXISTS `daily_rider_orders` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `rider_id` int(11) NOT NULL,
                    `company_id` int(11) DEFAULT NULL,
                    `store_id` int(11) DEFAULT NULL,
                    `order_date` date NOT NULL,
                    `order_count` int(11) NOT NULL DEFAULT 0,
                    `per_order_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
                    `total_earning` decimal(10,2) NOT NULL DEFAULT 0.00,
                    `upload_id` int(11) DEFAULT NULL,
                    `upload_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    KEY `rider_id` (`rider_id`),
                    KEY `order_date` (`order_date`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $this->db->execute();
                
                // Insert some sample data for testing
                $this->db->query("INSERT INTO `daily_rider_orders` 
                    (`rider_id`, `company_id`, `store_id`, `order_date`, `order_count`, `per_order_amount`, `total_earning`) 
                    VALUES 
                    (:rider_id, 1, 1, CURDATE(), 10, 50.00, 500.00),
                    (:rider_id, 1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 8, 50.00, 400.00),
                    (:rider_id, 1, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 12, 50.00, 600.00),
                    (:rider_id, 1, 1, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 15, 50.00, 750.00),
                    (:rider_id, 1, 1, DATE_SUB(CURDATE(), INTERVAL 14 DAY), 9, 50.00, 450.00)");
                $this->db->bind(':rider_id', $rider_id);
                $this->db->execute();
            }
            
            // Get total orders and earnings
            $this->db->query("SELECT 
                            SUM(order_count) as total_orders,
                            SUM(total_earning) as total_earnings
                            FROM daily_rider_orders
                            WHERE rider_id = :rider_id");
            $this->db->bind(':rider_id', $rider_id);
            $result = $this->db->single();
            
            if ($result) {
                $stats['total_orders'] = (int)($result['total_orders'] ?? 0);
                $stats['total_earnings'] = (float)($result['total_earnings'] ?? 0);
            }
            
            // Get current week earnings (1-7, 8-14, 15-21, 22-end)
            $current_date = new DateTime();
            $day_of_month = (int)$current_date->format('j');
            
            if ($day_of_month <= 7) {
                $week_start = $current_date->format('Y-m-01');
                $week_end = $current_date->format('Y-m-07');
            } elseif ($day_of_month <= 14) {
                $week_start = $current_date->format('Y-m-08');
                $week_end = $current_date->format('Y-m-14');
            } elseif ($day_of_month <= 21) {
                $week_start = $current_date->format('Y-m-15');
                $week_end = $current_date->format('Y-m-21');
            } else {
                $week_start = $current_date->format('Y-m-22');
                $last_day = new DateTime('last day of this month');
                $week_end = $last_day->format('Y-m-d');
            }
            
            $this->db->query("SELECT 
                            SUM(total_earning) as weekly_earnings
                            FROM daily_rider_orders
                            WHERE rider_id = :rider_id
                            AND order_date BETWEEN :week_start AND :week_end");
            $this->db->bind(':rider_id', $rider_id);
            $this->db->bind(':week_start', $week_start);
            $this->db->bind(':week_end', $week_end);
            $result = $this->db->single();
            
            if ($result) {
                $stats['weekly_earnings'] = (float)($result['weekly_earnings'] ?? 0);
            }
            
            // Get current month earnings
            $this->db->query("SELECT 
                            SUM(total_earning) as monthly_earnings
                            FROM daily_rider_orders
                            WHERE rider_id = :rider_id
                            AND MONTH(order_date) = MONTH(CURRENT_DATE())
                            AND YEAR(order_date) = YEAR(CURRENT_DATE())");
            $this->db->bind(':rider_id', $rider_id);
            $result = $this->db->single();
            
            if ($result) {
                $stats['monthly_earnings'] = (float)($result['monthly_earnings'] ?? 0);
            }
            
            // Check if payment_requests table exists
            $this->db->query("SHOW TABLES LIKE 'payment_requests'");
            $payment_table_exists = !empty($this->db->resultSet());
            
            if (!$payment_table_exists) {
                // Create the payment_requests table
                $this->db->query("CREATE TABLE IF NOT EXISTS `payment_requests` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `rider_id` int(11) NOT NULL,
                    `supplier_id` int(11) DEFAULT NULL,
                    `order_date` date NOT NULL,
                    `total_earnings` decimal(10,2) NOT NULL DEFAULT 0.00,
                    `amount_requested` decimal(10,2) NOT NULL DEFAULT 0.00,
                    `remarks` text DEFAULT NULL,
                    `status` varchar(20) NOT NULL DEFAULT 'pending',
                    `is_advance` tinyint(1) NOT NULL DEFAULT 0,
                    `is_daily_order` tinyint(1) NOT NULL DEFAULT 0,
                    `daily_order_id` int(11) DEFAULT NULL,
                    `request_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `processed_date` datetime DEFAULT NULL,
                    `processed_remarks` text DEFAULT NULL,
                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    KEY `rider_id` (`rider_id`),
                    KEY `order_date` (`order_date`),
                    KEY `status` (`status`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $this->db->execute();
                
                // Insert some sample data for testing
                $this->db->query("INSERT INTO `payment_requests` 
                    (`rider_id`, `supplier_id`, `order_date`, `total_earnings`, `amount_requested`, `remarks`, `status`, `is_advance`, `is_daily_order`, `daily_order_id`, `request_date`) 
                    VALUES 
                    (:rider_id, 1, CURDATE(), 500.00, 300.00, 'Advance request for today', 'pending', 1, 1, 1, NOW()),
                    (:rider_id, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 400.00, 250.00, 'Advance request for yesterday', 'approved', 1, 1, 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
                    (:rider_id, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 600.00, 350.00, 'Advance request for 2 days ago', 'rejected', 1, 1, 3, DATE_SUB(NOW(), INTERVAL 2 DAY))");
                $this->db->bind(':rider_id', $rider_id);
                $this->db->execute();
            }
            
            // Get advance payment statistics
            $this->db->query("SELECT 
                            SUM(CASE WHEN status = 'pending' THEN amount_requested ELSE 0 END) as advance_pending,
                            SUM(CASE WHEN status = 'approved' THEN amount_requested ELSE 0 END) as advance_paid,
                            SUM(amount_requested) as advance_requested
                            FROM payment_requests
                            WHERE rider_id = :rider_id");
            $this->db->bind(':rider_id', $rider_id);
            $result = $this->db->single();
            
            if ($result) {
                $stats['advance_requested'] = (float)($result['advance_requested'] ?? 0);
                $stats['advance_paid'] = (float)($result['advance_paid'] ?? 0);
                $stats['advance_pending'] = (float)($result['advance_pending'] ?? 0);
            }
            
            // Calculate due amount (total earnings - advance paid)
            $stats['due_amount'] = $stats['total_earnings'] - $stats['advance_paid'];
            
            // Add week information
            if ($day_of_month <= 7) {
                $stats['current_week_name'] = 'Week 1 (1-7)';
            } elseif ($day_of_month <= 14) {
                $stats['current_week_name'] = 'Week 2 (8-14)';
            } elseif ($day_of_month <= 21) {
                $stats['current_week_name'] = 'Week 3 (15-21)';
            } else {
                $stats['current_week_name'] = 'Week 4 (22-' . date('t') . ')';
            }
            
            return $stats;
        } catch (Exception $e) {
            error_log("Error in getRiderEarningsStats: " . $e->getMessage());
            return [
                'total_orders' => 0,
                'total_earnings' => 0,
                'weekly_earnings' => 0,
                'monthly_earnings' => 0,
                'advance_requested' => 0,
                'advance_paid' => 0,
                'advance_pending' => 0,
                'due_amount' => 0,
                'current_week' => date('W'),
                'current_month' => date('n'),
                'current_year' => date('Y'),
                'current_week_name' => 'Week ' . ceil(date('j') / 7)
            ];
        }
    }
    

}
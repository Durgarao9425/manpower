-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 24, 2025 at 09:25 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `manpower_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `month` varchar(7) NOT NULL COMMENT 'Format: YYYY-MM',
  `achievement_type` enum('monthly_performance','quarterly_achievement','annual_excellence','top_performer','most_orders','best_attendance','customer_satisfaction','safety_award','long_service') NOT NULL,
  `description` text DEFAULT NULL,
  `certificate_path` varchar(255) DEFAULT NULL,
  `is_notified` tinyint(1) DEFAULT 0,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admin_permissions`
--

CREATE TABLE `admin_permissions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `page` varchar(100) NOT NULL,
  `can_view` tinyint(1) DEFAULT 0,
  `can_edit` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_permissions`
--

INSERT INTO `admin_permissions` (`id`, `user_id`, `page`, `can_view`, `can_edit`, `can_delete`) VALUES
(1, 1, 'dashboard.php', 1, 1, 1),
(2, 1, 'riders.php', 1, 1, 1),
(3, 1, 'companies.php', 1, 1, 1),
(4, 1, 'stores.php', 1, 1, 1),
(5, 1, 'manage_rider_assignments.php', 1, 1, 1),
(6, 1, 'upload_order_statement.php', 1, 1, 1),
(7, 1, 'orders.php', 1, 1, 1),
(8, 1, 'weekly_summary.php', 1, 1, 1),
(9, 1, 'earnings.php', 1, 1, 1),
(10, 1, 'daily_advances.php', 1, 1, 1),
(11, 1, 'settlements.php', 1, 1, 1),
(12, 1, 'settlement_config.php', 1, 1, 1),
(13, 1, 'invoices.php', 1, 1, 1),
(14, 1, 'reports.php', 1, 1, 1),
(15, 1, 'users.php', 1, 1, 1),
(16, 1, 'slider_images.php', 1, 1, 1),
(17, 1, 'settings.php', 1, 1, 1),
(18, 1, 'notifications.php', 1, 1, 1),
(19, 1, 'logs.php', 1, 1, 1),
(20, 1, 'backup.php', 1, 1, 1),
(21, 68, 'dashboard.php', 1, 1, 1),
(22, 68, 'riders.php', 1, 1, 1),
(23, 68, 'companies.php', 1, 1, 1),
(24, 68, 'stores.php', 1, 1, 1),
(25, 68, 'manage_rider_assignments.php', 1, 1, 1),
(26, 68, 'upload_order_statement.php', 1, 1, 1),
(27, 68, 'orders.php', 1, 1, 1),
(28, 68, 'weekly_summary.php', 1, 1, 1),
(29, 68, 'earnings.php', 1, 1, 1),
(30, 68, 'daily_advances.php', 1, 1, 1),
(31, 68, 'settlements.php', 1, 1, 1),
(32, 68, 'settlement_config.php', 1, 1, 1),
(33, 68, 'invoices.php', 1, 1, 1),
(34, 68, 'reports.php', 1, 1, 1),
(35, 68, 'users.php', 1, 1, 1),
(36, 68, 'slider_images.php', 1, 1, 1),
(37, 68, 'settings.php', 1, 1, 1),
(38, 68, 'notifications.php', 1, 1, 1),
(39, 68, 'logs.php', 1, 1, 1),
(40, 68, 'backup.php', 1, 1, 1),
(41, 1, 'role_permissions.php', 1, 1, 1),
(42, 1, 'user_management.php', 1, 1, 1),
(43, 1, 'user_types.php', 1, 1, 1),
(44, 1, 'certificates.php', 1, 1, 1),
(45, 1, 'documents.php', 1, 1, 1),
(46, 68, 'role_permissions.php', 1, 1, 1),
(47, 68, 'user_management.php', 1, 1, 1),
(48, 68, 'user_types.php', 1, 1, 1),
(49, 68, 'certificates.php', 1, 1, 1),
(50, 68, 'documents.php', 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `advance_request_settings`
--

CREATE TABLE `advance_request_settings` (
  `id` int(11) NOT NULL,
  `max_percentage` decimal(5,2) DEFAULT 70.00 COMMENT 'Maximum percentage of earnings that can be requested as advance',
  `min_days_between_requests` int(11) DEFAULT 7 COMMENT 'Minimum days between advance requests',
  `approval_required` tinyint(1) DEFAULT 1,
  `auto_approve_below_amount` decimal(10,2) DEFAULT 0.00 COMMENT 'Auto-approve requests below this amount',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `app_settings`
--

CREATE TABLE `app_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `setting_group` varchar(50) DEFAULT 'general',
  `is_public` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `store_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive','completed') NOT NULL DEFAULT 'active',
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `assigned_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `orders_completed` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificates`
--

INSERT INTO `certificates` (`id`, `rider_id`, `month`, `year`, `content`, `created_by`, `created_at`, `orders_completed`) VALUES
(31, 39, 5, 2025, 'Certificate of Achievement\n\nThis is to certify that BONDADA TARUN has achieved outstanding performance for the month of May, 2025.', 1, '2025-05-19 19:31:04', 0),
(32, 38, 5, 2025, 'Certificate of Achievement\n\nThis is to certify that Kanda Bala Gangadhar has achieved outstanding performance for the month of May, 2025.', 1, '2025-05-19 19:31:09', 0);

-- --------------------------------------------------------

--
-- Table structure for table `certificate_notifications`
--

CREATE TABLE `certificate_notifications` (
  `id` int(11) NOT NULL,
  `certificate_id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `sent_date` datetime NOT NULL,
  `sent_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `company_email` varchar(255) DEFAULT NULL,
  `company_phone` varchar(15) DEFAULT NULL,
  `company_gst` varchar(15) DEFAULT NULL,
  `company_address` varchar(255) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `payment_terms` int(11) DEFAULT 7
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `user_id`, `company_name`, `company_email`, `company_phone`, `company_gst`, `company_address`, `industry`, `logo`, `created_by`, `payment_terms`) VALUES
(21, 65, 'BIG BASKET', NULL, NULL, NULL, NULL, 'Delivery', NULL, 1, 7);

-- --------------------------------------------------------

--
-- Table structure for table `company_payments`
--

CREATE TABLE `company_payments` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `week_number` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `commission_amount` decimal(10,2) NOT NULL,
  `net_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','invoice_sent','received','processed') DEFAULT 'pending',
  `file_path` varchar(255) NOT NULL DEFAULT '',
  `notes` text DEFAULT NULL,
  `mapping_status` varchar(20) DEFAULT 'unmapped',
  `published_at` datetime DEFAULT NULL,
  `published_by` int(11) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT NULL,
  `start_date` date NOT NULL DEFAULT curdate(),
  `end_date` date NOT NULL DEFAULT curdate(),
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_reference` varchar(100) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_payments`
--

INSERT INTO `company_payments` (`id`, `company_id`, `week_number`, `year`, `total_amount`, `commission_amount`, `net_amount`, `status`, `file_path`, `notes`, `mapping_status`, `published_at`, `published_by`, `payment_date`, `start_date`, `end_date`, `amount`, `payment_reference`, `remarks`, `created_at`, `updated_at`) VALUES
(36, 21, 18, 2025, 0.00, 250.00, 4750.00, 'pending', '', NULL, 'mapped', NULL, NULL, NULL, '2025-05-01', '2025-05-07', 5000.00, NULL, NULL, '2025-05-11 20:54:41', '2025-05-11 20:54:41'),
(37, 21, 0, 0, 0.00, 0.00, 0.00, '', 'payment_21_20250521202408.xlsx', '', 'mapped', NULL, NULL, '2025-05-20 18:30:00', '2025-05-15', '2025-05-21', 5000.00, NULL, NULL, '2025-05-21 14:54:09', '2025-05-21 14:59:45');

-- --------------------------------------------------------

--
-- Table structure for table `company_stores`
--

CREATE TABLE `company_stores` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `store_name` varchar(100) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_stores`
--

INSERT INTO `company_stores` (`id`, `company_id`, `store_name`, `location`, `address`, `contact_person`, `contact_phone`, `status`, `created_at`, `updated_at`) VALUES
(26, 21, 'RAM NAGAR', 'RAM NAGAR', '', 'GANGADHAR', '9493008886', 'active', '2025-05-07 16:49:07', '2025-05-08 03:39:37'),
(27, 21, 'GURUDWARA', 'GURUDWARA', '', 'GANGADHAR', '9493008886', 'active', '2025-05-08 03:40:21', '2025-05-08 03:40:21'),
(28, 21, 'VISHALAKSHINAGAR', 'VISHALAKSHINAGAR', '', 'GANGADHAR', '9493008886', 'active', '2025-05-08 03:41:05', '2025-05-08 03:41:05'),
(29, 21, 'CHANDRAMPALAM', 'CHANDRAMPALAM', '', 'PRAVEEN', '6309774083', 'active', '2025-05-08 03:42:17', '2025-05-08 03:42:17'),
(30, 21, 'SUJATHANAGAR', 'SUJATHANAGAR', '', 'PRAVEEN', '6309774083', 'active', '2025-05-08 03:45:52', '2025-05-08 03:47:06'),
(31, 21, 'NAD', 'NAD', '', 'PRAVEEN', '6309774083', 'active', '2025-05-08 03:46:43', '2025-05-08 03:46:43'),
(32, 21, 'MADHURAWADA', 'MADHURAWADA', '', 'PRAVEEN', '6309774083', 'active', '2025-05-08 03:47:54', '2025-05-08 03:47:54'),
(33, 21, 'RAJIVNAGAR', 'RAJIVNAGAR', '', 'PRAVEEN', '6309774083', 'active', '2025-05-08 03:48:30', '2025-05-08 03:48:30');

-- --------------------------------------------------------

--
-- Table structure for table `daily_order_uploads`
--

CREATE TABLE `daily_order_uploads` (
  `id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `upload_date` datetime NOT NULL DEFAULT current_timestamp(),
  `order_date` date NOT NULL,
  `company_id` int(11) NOT NULL,
  `store_id` int(11) DEFAULT NULL,
  `total_riders` int(11) NOT NULL DEFAULT 0,
  `total_orders` int(11) NOT NULL DEFAULT 0,
  `status` varchar(20) NOT NULL DEFAULT 'processed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `daily_order_uploads`
--

INSERT INTO `daily_order_uploads` (`id`, `file_name`, `upload_date`, `order_date`, `company_id`, `store_id`, `total_riders`, `total_orders`, `status`) VALUES
(54, 'daily_orders_2025-05-17_133833.xlsx', '2025-05-17 13:38:34', '2025-05-17', 21, 30, 2, 180, 'processed'),
(55, 'daily_orders_2025-05-21_201515.xlsx', '2025-05-21 20:15:16', '2025-05-21', 21, 29, 2, 450, 'processed');

-- --------------------------------------------------------

--
-- Table structure for table `daily_rider_orders`
--

CREATE TABLE `daily_rider_orders` (
  `id` int(11) NOT NULL,
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
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `daily_rider_orders`
--

INSERT INTO `daily_rider_orders` (`id`, `upload_id`, `company_id`, `store_id`, `rider_id`, `rider_name`, `company_rider_id`, `order_count`, `per_order_amount`, `total_earning`, `order_date`, `created_at`) VALUES
(234, 54, 21, 30, 39, 'BONDADA TARUN Sri Lasya', NULL, 60, 40.00, 2400.00, '2025-05-17', '2025-05-17 13:38:34'),
(235, 54, 21, 30, 38, 'Kanda Bala Gangadhar', NULL, 120, 40.00, 4800.00, '2025-05-17', '2025-05-17 13:38:34'),
(236, 55, 21, 29, 39, 'BONDADA TARUN Sri Lasya', NULL, 300, 40.00, 12000.00, '2025-05-21', '2025-05-21 20:15:16'),
(237, 55, 21, 29, 38, 'Kanda Bala Gangadhar', NULL, 150, 40.00, 6000.00, '2025-05-21', '2025-05-21 20:15:16');

-- --------------------------------------------------------

--
-- Table structure for table `email_templates`
--

CREATE TABLE `email_templates` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `field_mappings`
--

CREATE TABLE `field_mappings` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `supplier_field_name` varchar(100) NOT NULL,
  `company_field_name` varchar(100) NOT NULL,
  `show_to_rider` tinyint(1) NOT NULL DEFAULT 0,
  `show_to_company` tinyint(1) NOT NULL DEFAULT 0,
  `show_in_invoice` tinyint(1) NOT NULL DEFAULT 0,
  `count_for_commission` tinyint(1) NOT NULL DEFAULT 0,
  `editable_by_rider` tinyint(1) NOT NULL DEFAULT 0,
  `editable_by_company` tinyint(1) NOT NULL DEFAULT 0,
  `is_required` tinyint(1) NOT NULL DEFAULT 0,
  `field_type` varchar(50) NOT NULL DEFAULT 'text',
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `field_mappings`
--

INSERT INTO `field_mappings` (`id`, `company_id`, `entity_type`, `supplier_field_name`, `company_field_name`, `show_to_rider`, `show_to_company`, `show_in_invoice`, `count_for_commission`, `editable_by_rider`, `editable_by_company`, `is_required`, `field_type`, `display_order`, `created_at`, `updated_at`) VALUES
(22, 20, NULL, 'rider_id', 'cee_id', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:19', '2025-05-04 10:52:14'),
(23, 20, NULL, 'rider_name', 'cee_name', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:19', '2025-05-04 10:36:19'),
(24, 20, NULL, 'store', 'store', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:19', '2025-05-04 10:36:19'),
(25, 20, NULL, 'delivered_orders', 'delivered_orders', 1, 0, 1, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:19', '2025-05-04 10:36:19'),
(26, 20, NULL, 'cancelled_orders', 'cancelled_orders', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:19', '2025-05-04 10:36:19'),
(27, 20, NULL, 'pickup_orders', 'pickup_orders', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:19', '2025-05-04 10:36:19'),
(28, 20, NULL, 'attendance', 'attendance', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:19', '2025-05-04 10:36:19'),
(29, 20, NULL, 'distance', 'distance', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:20', '2025-05-04 10:36:20'),
(30, 20, NULL, 'cancelled_order_payout', 'cancelled_order_payout', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:20', '2025-05-04 10:36:20'),
(31, 20, NULL, 'pickup_order_payout', 'pickup_order_payout', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:20', '2025-05-04 10:36:20'),
(32, 20, NULL, 'order_base_payout', 'order_base_payout', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:20', '2025-05-04 10:36:20'),
(33, 20, NULL, 'weight_payout', 'weight_payout', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:20', '2025-05-04 10:36:20'),
(34, 20, NULL, 'total_earnings', 'total_with_arrears_and_deductions', 1, 0, 1, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:20', '2025-05-04 10:36:20'),
(35, 20, NULL, 'commision', 'management_fee', 0, 0, 1, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:20', '2025-05-06 00:25:41'),
(36, 20, NULL, 'tax_with_deducation', 'tds', 0, 0, 1, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:20', '2025-05-06 00:29:35'),
(37, 20, NULL, 'gst', 'gst', 0, 0, 1, 0, 0, 0, 0, 'text', 0, '2025-05-04 10:36:20', '2025-05-06 00:25:06'),
(38, 21, NULL, 'Order Date', 'Date', 1, 0, 1, 0, 0, 0, 0, 'date', 0, '2025-05-11 05:10:56', '2025-05-11 05:10:56'),
(39, 21, NULL, 'Rider Name', 'Rider', 1, 0, 1, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:10:56', '2025-05-11 05:10:56'),
(40, 21, NULL, 'Order Count', 'Orders', 1, 0, 1, 1, 0, 0, 0, 'number', 0, '2025-05-11 05:10:56', '2025-05-11 05:10:56'),
(41, 21, NULL, 'Pay Rate', 'Rate', 1, 0, 1, 0, 0, 0, 0, 'currency', 0, '2025-05-11 05:10:56', '2025-05-11 05:10:56'),
(42, 21, NULL, 'Total Earnings', 'Amount', 1, 0, 1, 1, 0, 0, 0, 'currency', 0, '2025-05-11 05:10:56', '2025-05-11 05:10:56'),
(43, 21, NULL, 'rider_id', 'cee_id', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:19:58', '2025-05-11 05:19:58'),
(44, 21, NULL, 'rider_name', 'cee_name', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:19:58', '2025-05-11 05:19:58'),
(45, 21, NULL, 'store', 'store', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:19:58', '2025-05-11 05:19:58'),
(46, 21, NULL, 'delivered_orders', 'delivered_orders', 1, 0, 1, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:19:58', '2025-05-11 05:19:58'),
(47, 21, NULL, 'cancelled_orders', 'cancelled_orders', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:19:58', '2025-05-11 05:19:58'),
(48, 21, NULL, 'pickup_orders', 'pickup_orders', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:19:58', '2025-05-11 05:19:58'),
(49, 21, NULL, 'attendance', 'attendance', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:19:58', '2025-05-11 05:19:58'),
(50, 21, NULL, 'cancelled_order_payout', 'cancelled_order_payout', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:19:58', '2025-05-11 05:19:58'),
(51, 21, NULL, 'pickup_order_payout', 'pickup_order_payout', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:19:58', '2025-05-11 05:19:58'),
(52, 21, NULL, 'order_distance_payout', 'order_distance_payout', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:19:58', '2025-05-11 05:19:58'),
(53, 21, NULL, 'weight_payout', 'weight_payout', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:19:58', '2025-05-11 05:19:58'),
(54, 21, NULL, 'day_payout', 'day_payout', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:19:58', '2025-05-11 05:19:58'),
(55, 21, NULL, 'base_pay', 'base_pay', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:19:58', '2025-05-11 05:19:58'),
(56, 21, NULL, 'total_with_arrears', 'total_with_arrears', 1, 0, 0, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:19:58', '2025-05-11 05:19:58'),
(57, 21, NULL, 'total_earnings', 'total_with_arrears_and_deductions', 1, 0, 1, 0, 0, 0, 0, 'text', 0, '2025-05-11 05:19:58', '2025-05-11 05:19:58'),
(58, 21, NULL, 'order_base_payout', 'order_base_payout', 1, 0, 1, 0, 0, 0, 0, 'text', 0, '2025-05-21 20:28:30', '2025-05-21 20:28:30'),
(59, 21, NULL, 'commision', 'management_fee', 0, 0, 1, 1, 0, 0, 0, 'text', 0, '2025-05-21 20:28:30', '2025-05-21 20:28:30'),
(60, 21, NULL, 'tax_with_deducation', 'tds', 1, 0, 1, 0, 0, 0, 0, 'text', 0, '2025-05-21 20:28:30', '2025-05-21 20:28:30');

-- --------------------------------------------------------

--
-- Table structure for table `id_card_templates`
--

CREATE TABLE `id_card_templates` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `data` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `imported_report_data`
--

CREATE TABLE `imported_report_data` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `report_date` date NOT NULL,
  `uploaded_by` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `status` enum('pending','processed','error') DEFAULT 'pending',
  `processing_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`processing_details`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `company_payment_id` int(11) DEFAULT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `invoice_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `week_number` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL,
  `commission_amount` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cgst_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `cgst_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `sgst_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `sgst_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `net_amount` decimal(10,2) NOT NULL,
  `delivered_orders` int(11) NOT NULL DEFAULT 0,
  `total_earning` decimal(10,2) NOT NULL DEFAULT 0.00,
  `invoice_file_path` varchar(255) DEFAULT NULL,
  `status` enum('draft','sent','paid') DEFAULT 'draft',
  `created_by` int(11) DEFAULT NULL,
  `sent_date` timestamp NULL DEFAULT NULL,
  `paid_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `company_id`, `company_payment_id`, `invoice_number`, `invoice_date`, `due_date`, `start_date`, `end_date`, `week_number`, `year`, `subtotal`, `total_amount`, `commission_amount`, `tax_amount`, `cgst_rate`, `cgst_amount`, `sgst_rate`, `sgst_amount`, `net_amount`, `delivered_orders`, `total_earning`, `invoice_file_path`, `status`, `created_by`, `sent_date`, `paid_date`, `created_at`, `updated_at`) VALUES
(13, 21, 36, 'INV-202505-0001', '2025-05-12', '2025-05-27', '2025-05-01', '2025-05-07', 18, 2025, 5000.00, 5900.00, 0.00, 900.00, 9.00, 450.00, 9.00, 450.00, 5900.00, 0, 5000.00, NULL, 'draft', 1, NULL, NULL, '2025-05-11 20:54:44', '2025-05-11 20:54:44'),
(15, 21, 37, 'INV-202505-0002', '2025-05-22', '2025-06-06', '2025-05-15', '2025-05-21', 20, 2025, 5000.00, 5900.00, 0.00, 900.00, 9.00, 450.00, 9.00, 450.00, 5900.00, 0, 5000.00, NULL, 'draft', 1, NULL, NULL, '2025-05-22 06:02:03', '2025-05-22 06:02:03');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `description`, `quantity`, `unit_price`, `total_price`, `created_at`, `updated_at`) VALUES
(3, 13, 'Target Reached Orders', 0.00, 5000.00, 5000.00, '2025-05-11 20:54:44', '2025-05-11 20:54:44'),
(4, 13, 'Service Charge @5%', 0.00, 0.00, 0.00, '2025-05-11 20:54:44', '2025-05-11 20:54:44'),
(5, 15, 'Target Reached Orders', 0.00, 5000.00, 5000.00, '2025-05-22 06:02:03', '2025-05-22 06:02:03'),
(6, 15, 'Service Charge @5%', 0.00, 0.00, 0.00, '2025-05-22 06:02:03', '2025-05-22 06:02:03');

-- --------------------------------------------------------

--
-- Table structure for table `job_applications`
--

CREATE TABLE `job_applications` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text DEFAULT NULL,
  `experience` varchar(50) DEFAULT NULL,
  `preferred_role` varchar(100) DEFAULT NULL,
  `resume_path` varchar(255) DEFAULT NULL,
  `cover_letter` text DEFAULT NULL,
  `application_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('new','reviewed','contacted','hired','rejected') DEFAULT 'new'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `manpower_requests`
--

CREATE TABLE `manpower_requests` (
  `id` int(11) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `contact_person` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `riders_required` int(11) NOT NULL DEFAULT 1,
  `job_description` text DEFAULT NULL,
  `request_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('new','processing','fulfilled','rejected') DEFAULT 'new'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `related_entity` varchar(50) DEFAULT NULL,
  `related_entity_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `store_id` int(11) DEFAULT NULL,
  `order_date` date NOT NULL,
  `order_count` int(11) NOT NULL DEFAULT 0,
  `order_type` enum('per_order','per_km') DEFAULT 'per_order',
  `km_traveled` decimal(10,2) DEFAULT 0.00,
  `km_rate` decimal(10,2) DEFAULT 0.00,
  `pay_rate` decimal(10,2) NOT NULL,
  `total_earnings` decimal(10,2) GENERATED ALWAYS AS (case when `order_type` = 'per_order' then `order_count` * `pay_rate` else `km_traveled` * `km_rate` end) STORED,
  `week_number` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `source` enum('manual','imported') DEFAULT 'manual',
  `is_finalized` tinyint(1) DEFAULT 0,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `notes` varchar(150) NOT NULL,
  `created_by` varchar(250) NOT NULL,
  `added_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_comparisons`
--

CREATE TABLE `order_comparisons` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `manual_order_count` int(11) DEFAULT 0,
  `manual_order_amount` decimal(10,2) DEFAULT 0.00,
  `imported_order_count` int(11) DEFAULT 0,
  `imported_order_amount` decimal(10,2) DEFAULT 0.00,
  `difference_amount` decimal(10,2) DEFAULT 0.00,
  `is_finalized` tinyint(1) DEFAULT 0,
  `finalized_by` int(11) DEFAULT NULL,
  `finalized_at` timestamp NULL DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `payment_period` varchar(255) NOT NULL,
  `payment_data` text NOT NULL,
  `status` enum('pending','published','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_data`
--

CREATE TABLE `payment_data` (
  `id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `row_index` int(11) NOT NULL,
  `data` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_field_mappings`
--

CREATE TABLE `payment_field_mappings` (
  `id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `company_column` varchar(255) NOT NULL,
  `system_field` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_file_headers`
--

CREATE TABLE `payment_file_headers` (
  `id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `headers` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_file_headers`
--

INSERT INTO `payment_file_headers` (`id`, `payment_id`, `headers`, `created_at`) VALUES
(42, 34, '[\"cee_id\",\"cee_name\",\"store\",\"delivered_orders\",\"cancelled_orders\",\"pickup_orders\",\"attendance\",\"cancelled_order_payout\",\"pickup_order_payout\",\"order_distance_payout\",\"weight_payout\",\"day_payout\",\"base_pay\",\"total_with_arrears\",\"total_with_arrears_and_deductions\"]', '2025-05-11 05:07:50'),
(43, 35, '[\"cee_id\",\"cee_name\",\"store\",\"delivered_orders\",\"cancelled_orders\",\"pickup_orders\",\"attendance\",\"cancelled_order_payout\",\"pickup_order_payout\",\"order_distance_payout\",\"weight_payout\",\"day_payout\",\"base_pay\",\"total_with_arrears\",\"total_with_arrears_and_deductions\",\"Column 16\",\"Column 17\",\"Column 18\",\"Column 19\",\"Column 20\"]', '2025-05-11 05:53:51'),
(44, 37, '[\"cee_id\",\"cee_name\",\"store\",\"delivered_orders\",\"attendance\",\"order_base_payout\",\"total_with_arrears_and_deductions\",\"management_fee\",\"tds\"]', '2025-05-21 14:54:09');

-- --------------------------------------------------------

--
-- Table structure for table `payment_requests`
--

CREATE TABLE `payment_requests` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `order_date` date DEFAULT NULL,
  `total_earnings` decimal(10,2) NOT NULL DEFAULT 0.00,
  `order_id` int(11) NOT NULL,
  `amount_requested` decimal(10,2) NOT NULL,
  `request_date` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `response_date` datetime DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `is_daily_order` tinyint(1) NOT NULL DEFAULT 1,
  `daily_order_ids` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_requests`
--

INSERT INTO `payment_requests` (`id`, `rider_id`, `supplier_id`, `order_date`, `total_earnings`, `order_id`, `amount_requested`, `request_date`, `status`, `response_date`, `remarks`, `is_daily_order`, `daily_order_ids`) VALUES
(49, 39, 1, '2025-05-12', 8440.00, 0, 3000.00, '2025-05-12 18:49:27', 'pending', NULL, '', 1, '47,45,43,147,41,37,63,39'),
(50, 39, 1, '2025-05-12', 8440.00, 0, 2908.00, '2025-05-12 18:49:46', 'pending', NULL, '', 1, '47,45,43,147,41,37,63,39'),
(51, 39, 1, '2025-05-21', 14400.00, 0, 4172.00, '2025-05-21 20:18:43', 'approved', '2025-05-21 20:19:21', '\nAdmin: Approved by admin on 2025-05-21 20:19:21', 1, '236,234');

-- --------------------------------------------------------

--
-- Table structure for table `payment_settlements`
--

CREATE TABLE `payment_settlements` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `payment_request_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_settlements`
--

INSERT INTO `payment_settlements` (`id`, `rider_id`, `company_id`, `order_id`, `payment_request_id`, `amount`, `payment_date`, `status`, `payment_method`, `transaction_id`, `remarks`, `payment_reference`, `updated_at`) VALUES
(25, 38, 1, NULL, 40, 560.00, '2025-05-11 00:00:00', 'paid', 'bank_transfer', '11052025', ' (Bulk payment: 11052025)', '11052025', '2025-05-11 05:01:23'),
(26, 39, 1, NULL, 39, 978.00, '2025-05-11 00:00:00', 'paid', 'bank_transfer', '11052025', ' (Bulk payment: 11052025)', '11052025', '2025-05-11 05:01:23'),
(27, 39, 1, NULL, 38, 970.00, '2025-05-11 00:00:00', 'paid', 'bank_transfer', '11052025', ' (Bulk payment: 11052025)', '11052025', '2025-05-11 05:01:23'),
(28, 38, 1, NULL, 37, 560.00, '2025-05-11 00:00:00', 'paid', 'bank_transfer', '11052025', ' (Bulk payment: 11052025)', '11052025', '2025-05-11 05:01:23'),
(29, 38, 1, NULL, 36, 560.00, '2025-05-11 00:00:00', 'paid', 'bank_transfer', '11052025', ' (Bulk payment: 11052025)', '11052025', '2025-05-11 05:01:23'),
(30, 39, 1, NULL, 51, 4172.00, '2025-05-21 00:00:00', 'paid', 'bank_transfer', '34567890', ' (Bulk payment: 34567890)', '34567890', '2025-05-21 20:20:29');

-- --------------------------------------------------------

--
-- Table structure for table `performance_metrics`
--

CREATE TABLE `performance_metrics` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `metric_date` date NOT NULL,
  `performance_score` int(11) NOT NULL,
  `performance_level` enum('high','medium','low') NOT NULL DEFAULT 'low',
  `orders_completed` int(11) NOT NULL DEFAULT 0,
  `attendance_rate` decimal(5,2) DEFAULT NULL,
  `customer_rating` decimal(3,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `rider_name` varchar(255) DEFAULT NULL,
  `month` int(2) DEFAULT NULL,
  `year` int(4) DEFAULT NULL,
  `total_orders` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `riders`
--

CREATE TABLE `riders` (
  `id` int(11) NOT NULL,
  `rider_id` varchar(100) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `rider_code` varchar(50) DEFAULT NULL,
  `id_proof` varchar(100) DEFAULT NULL,
  `emergency_contact` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `account_holder_name` varchar(100) DEFAULT NULL,
  `upi_id` varchar(50) DEFAULT NULL,
  `id_card_path` varchar(255) DEFAULT NULL,
  `performance_tier` enum('low','medium','high') DEFAULT 'medium',
  `last_certificate_date` date DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `id_card_number` varchar(50) DEFAULT NULL,
  `id_card_issue_date` date DEFAULT NULL,
  `id_card_expiry_date` date DEFAULT NULL,
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Rider documents like license, insurance, etc.' CHECK (json_valid(`documents`)),
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Inactive',
  `vehicle_type` enum('2_wheeler','3_wheeler','4_wheeler') DEFAULT NULL,
  `vehicle_number` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `riders`
--

INSERT INTO `riders` (`id`, `rider_id`, `user_id`, `rider_code`, `id_proof`, `emergency_contact`, `date_of_birth`, `blood_group`, `joining_date`, `bank_name`, `account_number`, `ifsc_code`, `account_holder_name`, `upi_id`, `id_card_path`, `performance_tier`, `last_certificate_date`, `created_by`, `id_card_number`, `id_card_issue_date`, `id_card_expiry_date`, `documents`, `status`, `vehicle_type`, `vehicle_number`) VALUES
(38, NULL, 64, 'SLP-001', NULL, '87653331654', '1997-01-18', NULL, NULL, 'union bank of india', '031310100107948', 'UBIN0803138', 'KANDA SRI BALA GANGADHAR', '', NULL, 'medium', NULL, 1, NULL, NULL, NULL, NULL, 'Active', NULL, NULL),
(39, NULL, 66, 'SLP-002', NULL, '9865321478', '1999-02-20', NULL, NULL, 'uinoin bank of india', '031310100107948', 'UBIN0803138', 'KANDA SRI BALA GANGADHAR', '', NULL, 'medium', NULL, 1, NULL, NULL, NULL, NULL, 'Active', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rider_assignments`
--

CREATE TABLE `rider_assignments` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `store_id` int(11) DEFAULT NULL,
  `company_rider_id` varchar(100) DEFAULT NULL,
  `assigned_by` int(11) NOT NULL,
  `assigned_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `start_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rider_assignments`
--

INSERT INTO `rider_assignments` (`id`, `rider_id`, `company_id`, `store_id`, `company_rider_id`, `assigned_by`, `assigned_date`, `start_date`, `notes`, `status`) VALUES
(44, 39, 21, 29, '585609', 1, '2025-05-16 17:14:46', '2025-05-16', NULL, 'active'),
(45, 38, 21, 29, '585610', 1, '2025-05-16 17:32:56', '2025-05-16', NULL, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `rider_attendance`
--

CREATE TABLE `rider_attendance` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `store_id` int(11) DEFAULT NULL,
  `attendance_date` date NOT NULL,
  `status` enum('present','absent','half_day','leave') DEFAULT 'present',
  `marked_by` int(11) NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `check_in_time` timestamp NULL DEFAULT NULL,
  `check_out_time` timestamp NULL DEFAULT NULL,
  `check_in_latitude` decimal(10,8) DEFAULT NULL,
  `check_in_longitude` decimal(11,8) DEFAULT NULL,
  `check_in_accuracy` float DEFAULT NULL,
  `check_out_latitude` decimal(10,8) DEFAULT NULL,
  `check_out_longitude` decimal(11,8) DEFAULT NULL,
  `check_out_accuracy` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rider_attendance`
--

INSERT INTO `rider_attendance` (`id`, `rider_id`, `company_id`, `store_id`, `attendance_date`, `status`, `marked_by`, `remarks`, `created_at`, `updated_at`, `check_in_time`, `check_out_time`, `check_in_latitude`, `check_in_longitude`, `check_in_accuracy`, `check_out_latitude`, `check_out_longitude`, `check_out_accuracy`) VALUES
(17, 38, 21, NULL, '2025-05-08', 'present', 64, '', '2025-05-08 02:52:47', '2025-05-08 04:01:18', '2025-05-08 08:22:47', '2025-05-08 09:31:18', NULL, NULL, NULL, NULL, NULL, NULL),
(18, 38, 21, NULL, '2025-05-10', 'present', 64, '', '2025-05-10 08:44:50', '2025-05-10 08:44:54', '2025-05-10 14:14:50', '2025-05-10 14:14:54', NULL, NULL, NULL, NULL, NULL, NULL),
(20, 38, 21, NULL, '2025-05-11', 'present', 64, NULL, '2025-05-11 03:47:08', '2025-05-11 03:47:23', '2025-05-11 09:17:08', '2025-05-11 09:17:23', NULL, NULL, NULL, NULL, NULL, NULL),
(23, 38, 21, NULL, '2025-05-12', 'present', 64, NULL, '2025-05-12 11:03:08', '2025-05-12 11:03:08', '2025-05-12 16:33:08', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 39, 21, 29, '2025-05-21', 'present', 66, NULL, '2025-05-21 15:09:09', '2025-05-21 15:09:36', '2025-05-21 15:09:09', '2025-05-21 15:09:36', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rider_documents`
--

CREATE TABLE `rider_documents` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `document_type` enum('aadhar_card','pan_card','driving_license','insurance','bank_details','upi_id','other') NOT NULL,
  `document_number` varchar(100) DEFAULT NULL,
  `document_file` varchar(255) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `verified_by` int(11) DEFAULT NULL,
  `verification_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rider_documents`
--

INSERT INTO `rider_documents` (`id`, `rider_id`, `document_type`, `document_number`, `document_file`, `expiry_date`, `verification_status`, `remarks`, `created_at`, `updated_at`, `verified_by`, `verification_date`) VALUES
(7, 39, 'driving_license', '234567890', '1747226827_WhatsApp Image 2025-05-11 at 11.50.27_5f051ac2.jpg', '2025-12-31', 'verified', NULL, '2025-05-14 12:47:07', '2025-05-14 16:58:08', 1, '2025-05-14 22:28:08'),
(8, 39, 'aadhar_card', '234567890', 'doc_682ded67ac569.png', NULL, 'verified', NULL, '2025-05-21 15:12:39', '2025-05-21 15:13:26', 1, '2025-05-21 20:43:26');

-- --------------------------------------------------------

--
-- Table structure for table `rider_earnings`
--

CREATE TABLE `rider_earnings` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `week_number` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `estimated_amount` decimal(10,2) DEFAULT 0.00,
  `actual_amount` decimal(10,2) DEFAULT 0.00,
  `is_finalized` tinyint(1) DEFAULT 0,
  `finalized_at` timestamp NULL DEFAULT NULL,
  `finalized_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rider_insurance`
--

CREATE TABLE `rider_insurance` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `provider_name` varchar(255) NOT NULL,
  `insurance_number` varchar(100) NOT NULL,
  `activation_date` date NOT NULL,
  `status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rider_insurance`
--

INSERT INTO `rider_insurance` (`id`, `rider_id`, `provider_name`, `insurance_number`, `activation_date`, `status`, `created_at`, `updated_at`) VALUES
(3, 39, 'TATA AIIG', '123456789', '2025-05-11', 'active', '2025-05-11 05:04:28', NULL),
(4, 38, 'TATA AIIG', '123456489', '2025-05-11', 'active', '2025-05-11 05:04:54', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rider_payments`
--

CREATE TABLE `rider_payments` (
  `id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `payment_data` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rider_payments`
--

INSERT INTO `rider_payments` (`id`, `payment_id`, `rider_id`, `company_id`, `payment_data`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
(93, 37, 39, 21, '{\"company_rider_id\":\"585609\",\"rider_id\":585609,\"rider_name\":\"BONDADA TARUN\",\"store\":\"RAM NAGAR\",\"delivered_orders\":131,\"cancelled_orders\":1,\"pickup_orders\":0,\"attendance\":6,\"cancelled_order_payout\":30,\"pickup_order_payout\":0,\"order_base_payout\":3960,\"order_distance_payout\":134.25,\"weight_payout\":0,\"day_payout\":0,\"base_pay\":6059.25,\"total_with_arrears\":6059.25,\"total_earnings\":6059.25,\"commision\":302.9624938964844,\"tax_with_deducation\":0,\"_mapped_rider_identifier\":\"585609\",\"_mapped_rider_id\":39}', '2025-05-21 20:29:45', NULL, 1, NULL),
(94, 37, 38, 21, '{\"company_rider_id\":\"585610\",\"rider_id\":585610,\"rider_name\":\"Kanda Bala Gangadhar\",\"store\":\"RAM NAGAR\",\"delivered_orders\":131,\"cancelled_orders\":1,\"pickup_orders\":0,\"attendance\":6,\"cancelled_order_payout\":30,\"pickup_order_payout\":0,\"order_base_payout\":3960,\"order_distance_payout\":134.25,\"weight_payout\":0,\"day_payout\":0,\"base_pay\":6059.25,\"total_with_arrears\":6059.25,\"total_earnings\":6059.25,\"commision\":302.9624938964844,\"tax_with_deducation\":0,\"_mapped_rider_identifier\":\"585610\",\"_mapped_rider_id\":38}', '2025-05-21 20:29:45', NULL, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rider_payment_requests`
--

CREATE TABLE `rider_payment_requests` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `order_date` date NOT NULL,
  `total_earnings` decimal(10,2) NOT NULL DEFAULT 0.00,
  `amount_requested` decimal(10,2) NOT NULL DEFAULT 0.00,
  `approved_amount` decimal(10,2) DEFAULT NULL,
  `request_date` date NOT NULL,
  `status` enum('pending','approved','paid','rejected') NOT NULL DEFAULT 'pending',
  `approval_date` datetime DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `is_advance` tinyint(1) NOT NULL DEFAULT 0,
  `is_daily_order` tinyint(1) NOT NULL DEFAULT 0,
  `daily_order_id` int(11) DEFAULT NULL,
  `advance_request_id` int(11) DEFAULT NULL,
  `rider_approved` tinyint(1) DEFAULT NULL,
  `rider_approval_date` datetime DEFAULT NULL,
  `rider_remarks` text DEFAULT NULL,
  `admin_approved` tinyint(1) DEFAULT NULL,
  `admin_approval_date` datetime DEFAULT NULL,
  `admin_remarks` text DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rider_performance`
--

CREATE TABLE `rider_performance` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `total_orders` int(11) DEFAULT 0,
  `total_days_worked` int(11) DEFAULT 0,
  `avg_orders_per_day` decimal(10,2) DEFAULT 0.00,
  `total_earnings` decimal(10,2) DEFAULT 0.00,
  `performance_score` decimal(5,2) DEFAULT 0.00,
  `tier` enum('low','medium','high') DEFAULT 'medium',
  `certificate_generated` tinyint(1) DEFAULT 0,
  `certificate_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settlement_config`
--

CREATE TABLE `settlement_config` (
  `id` int(11) NOT NULL,
  `config_key` varchar(50) NOT NULL,
  `config_value` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `slider_images`
--

CREATE TABLE `slider_images` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_path` varchar(255) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_by` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `slider_images`
--

INSERT INTO `slider_images` (`id`, `title`, `description`, `image_path`, `status`, `display_order`, `created_by`, `company_id`, `created_at`, `updated_at`) VALUES
(1, 'Mothers Day', '', 'uploads/slider_images/slider_1746986295_6820e5374b409.jpg', 'inactive', 1, 1, 21, '2025-05-11 17:58:15', '2025-05-21 20:36:56'),
(2, 'Blinkit Offer', '', 'uploads/slider_images/slider_1746986311_6820e547ee6f6.jpg', 'inactive', 2, 1, 21, '2025-05-11 17:58:31', '2025-05-21 20:36:57'),
(3, 'New', '', 'uploads/slider_images/slider_1747168039_6823ab2706825.jpg', 'inactive', 0, 1, 21, '2025-05-14 01:57:19', '2025-05-21 20:36:52'),
(4, 'New IMage', '', 'uploads/slider_images/slider_1747839978_682debea9c4e8.jpg', 'active', 1, 1, 21, '2025-05-21 20:36:18', NULL),
(5, 'Top Performers', '', 'uploads/slider_images/slider_1747841371_682df15bebc84.jpg', 'active', 2, 1, 21, '2025-05-21 20:59:31', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `store_name` varchar(100) NOT NULL,
  `store_code` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_assignments`
--

CREATE TABLE `store_assignments` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `assignment_date` date NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_assignments`
--

INSERT INTO `store_assignments` (`id`, `rider_id`, `store_id`, `assignment_date`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(22, 38, 29, '2025-05-21', 'active', 1, '2025-05-07 16:49:28', '2025-05-21 14:44:40'),
(23, 39, 29, '2025-05-17', 'active', 68, '2025-05-11 04:01:07', '2025-05-17 09:31:39'),
(24, 38, 26, '2025-05-11', 'inactive', 1, '2025-05-11 04:01:50', '2025-05-16 16:59:34'),
(25, 39, 29, '2025-05-16', 'inactive', 1, '2025-05-16 16:26:00', '2025-05-16 16:59:27'),
(26, 39, 27, '2025-05-16', 'inactive', 1, '2025-05-16 16:59:27', '2025-05-16 17:00:39'),
(27, 38, 30, '2025-05-16', 'inactive', 1, '2025-05-16 16:59:34', '2025-05-16 17:32:56'),
(28, 39, 31, '2025-05-16', 'inactive', 1, '2025-05-16 17:00:39', '2025-05-16 17:23:52'),
(29, 39, 32, '2025-05-16', 'inactive', 1, '2025-05-16 17:23:52', '2025-05-16 17:24:01'),
(30, 39, 30, '2025-05-16', 'active', 1, '2025-05-16 17:24:09', '2025-05-16 17:24:09'),
(31, 38, 32, '2025-05-16', 'active', 1, '2025-05-16 17:32:56', '2025-05-16 17:32:56');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `business_license` varchar(50) DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `commission_rate` decimal(5,2) DEFAULT 5.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `user_id`, `company_name`, `business_license`, `tax_id`, `description`, `commission_rate`) VALUES
(1, 1, 'Sri Lasyapriay Manpower Supply', 'LIC123456', 'TAX123456', NULL, 5.00);

-- --------------------------------------------------------

--
-- Table structure for table `system_fields`
--

CREATE TABLE `system_fields` (
  `id` int(11) UNSIGNED NOT NULL,
  `field_key` varchar(50) NOT NULL,
  `field_label` varchar(100) NOT NULL,
  `field_type` varchar(20) NOT NULL DEFAULT 'text',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_fields`
--

INSERT INTO `system_fields` (`id`, `field_key`, `field_label`, `field_type`, `created_at`, `updated_at`) VALUES
(2, 'rider_name', 'Rider Name', 'text', '2025-04-10 19:18:34', '2025-04-10 19:18:34'),
(3, 'store', 'Store Name', 'text', '2025-04-10 20:09:43', '2025-04-10 20:09:43'),
(4, 'total_cee_earn', 'Total CEE Earn', 'text', '2025-04-10 20:10:14', '2025-04-10 20:10:14'),
(5, 'delivered_orders', 'Delivered Orders', 'number', '2025-04-11 17:40:10', '2025-04-11 17:40:10'),
(6, 'total_earnings', 'Total Earnings', 'currency', '2025-04-11 17:41:35', '2025-04-11 17:41:35'),
(7, 'commision', 'commision', 'currency', '2025-04-11 17:41:56', '2025-04-11 17:41:56'),
(8, 'gst', 'gst', 'currency', '2025-04-18 17:51:13', '2025-04-18 17:51:13'),
(9, 'weekday_orders', 'Weekday Orders', 'number', '2025-04-18 18:39:13', '2025-04-18 18:39:13'),
(10, 'weekend_orders', 'Weekend Orders', 'text', '2025-04-18 18:39:47', '2025-04-18 18:39:47'),
(11, 'attendance', 'Attendance', 'text', '2025-04-18 18:40:23', '2025-04-18 18:40:23'),
(12, 'month_attendance', 'Month Attendance', 'text', '2025-04-18 18:40:50', '2025-04-18 18:40:50'),
(13, 'distance', 'Distance', 'text', '2025-04-18 18:41:03', '2025-04-18 18:41:03'),
(14, 'cancelled_orders', 'Cancelled Orders', 'text', '2025-04-25 20:00:26', '2025-04-25 20:00:26'),
(15, 'pickup_orders', 'Pickup Orders', 'text', '2025-04-30 18:26:36', '2025-04-30 18:26:36'),
(16, 'cancelled_order_payout', 'cancelled order payout', 'text', '2025-04-30 18:27:08', '2025-04-30 18:27:08'),
(17, 'pickup_order_payout', 'Pickup Orders pay out', 'text', '2025-04-30 18:27:40', '2025-04-30 18:27:40'),
(18, 'order_base_payout', 'order base payout', 'text', '2025-04-30 18:28:14', '2025-04-30 18:28:14'),
(19, 'weight_payout', 'weight payout', 'text', '2025-04-30 18:28:34', '2025-04-30 18:28:34'),
(20, 'total_with_arrears', 'total with arrears', 'text', '2025-04-30 18:29:26', '2025-04-30 18:29:26'),
(21, 'total_with_arrears_and_deductions', 'total with arrears', 'text', '2025-04-30 18:30:16', '2025-04-30 18:30:16'),
(22, 'tax_with_deducation', 'tax Ducation', 'text', '2025-04-30 18:30:49', '2025-04-30 18:30:49'),
(23, 'order_distance_payout', 'Order distance payout', 'text', '2025-04-30 18:48:15', '2025-05-11 05:15:33'),
(25, 'rider_id', 'Rider ID', 'number', '2025-05-04 05:04:31', '2025-05-04 05:20:33'),
(27, 'day_payout', 'Day payout', 'text', '2025-05-11 05:16:15', '2025-05-11 05:16:15'),
(28, 'base_pay', 'Basepay', 'text', '2025-05-11 05:17:18', '2025-05-11 05:17:18'),
(29, 'rider_pancard', 'Rider PAN Card', 'text', '2025-05-21 14:56:55', '2025-05-21 14:56:55');

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action_type` varchar(50) NOT NULL,
  `action_description` text NOT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_logs`
--

INSERT INTO `system_logs` (`id`, `user_id`, `action_type`, `action_description`, `ip_address`, `user_agent`, `created_at`) VALUES
(38, 1, 'Created rider', 'Created rider account for BONDADA TARUN', '2401:4900:6750:a065:5c9:235:8264:911', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36', '2025-05-11 04:00:44');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `setting_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_description`, `created_at`, `updated_at`) VALUES
(1, 'per_order_amount', '40', 'Auto-created setting', '2025-04-20 04:32:27', '2025-04-30 17:57:23'),
(2, 'company_name', 'SRI LASYA PRIYA MAN POWER', 'Auto-created setting', '2025-05-01 09:50:29', '2025-05-11 20:59:44'),
(3, 'company_address', '', 'Auto-created setting', '2025-05-01 09:50:29', '2025-05-07 15:31:25'),
(4, 'company_phone', '9493008886', 'Auto-created setting', '2025-05-01 09:50:29', '2025-05-11 20:59:44'),
(5, 'company_email', 'gangadhar.k2468@gmail.com', 'Auto-created setting', '2025-05-01 09:50:29', '2025-05-11 20:59:44'),
(6, 'company_logo', 'assets/img/zdYTQ1qvC2_1747890345.jpg', 'Auto-created setting', '2025-05-01 09:50:29', '2025-05-22 05:05:45'),
(7, 'company_gst', '', 'Auto-created setting', '2025-05-01 09:50:29', '2025-05-07 15:31:40'),
(8, 'company_bank_name', '', 'Auto-created setting', '2025-05-01 09:50:29', '2025-05-07 15:31:45'),
(9, 'company_bank_account', '', 'Auto-created setting', '2025-05-01 09:50:29', '2025-05-07 15:31:49'),
(10, 'company_bank_ifsc', '', 'Auto-created setting', '2025-05-01 09:50:29', '2025-05-07 15:31:54'),
(11, 'invoice_terms', '', 'Auto-created setting', '2025-05-01 09:50:29', '2025-05-07 15:31:57'),
(12, 'invoice_prefix', 'INV-', NULL, '2025-05-01 09:50:29', '2025-05-01 09:50:29'),
(13, 'tds_percentage', '1.1', NULL, '2025-05-03 16:36:35', '2025-05-03 17:03:39'),
(14, 'watermark_image', '', 'Auto-created setting', '2025-05-03 19:26:08', '2025-05-03 19:26:08'),
(15, 'company_website', 'www.srilasyapriya.com', 'Auto-created setting', '2025-05-03 20:06:54', '2025-05-03 20:06:54'),
(16, 'tax_rate', '18', 'Auto-created setting', '2025-05-11 05:22:18', '2025-05-11 05:22:18'),
(17, 'commission_rate', '5', 'Auto-created setting', '2025-05-11 05:22:18', '2025-05-11 20:59:44'),
(18, 'advance_limit_percentage', '70', 'Auto-created setting', '2025-05-11 05:22:18', '2025-05-11 20:59:44');

-- --------------------------------------------------------

--
-- Table structure for table `upload_order_statement`
--

CREATE TABLE `upload_order_statement` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `company_id` int(11) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `user_type` enum('admin','company','rider','store_manager') NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('active','inactive','suspended') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `company_id`, `username`, `password`, `email`, `user_type`, `full_name`, `phone`, `address`, `profile_image`, `created_at`, `updated_at`, `status`) VALUES
(1, NULL, 'admin', '$2a$12$/KmybqkIHn2HiMTRNKxIX.9Y7Lsz1AtUcCgFOShWSiGmwtMqpabVG', 'admin@example.com', 'admin', 'System Administrator', '1234567890', NULL, NULL, '2025-04-06 10:37:25', '2025-04-07 12:32:19', 'active'),
(64, NULL, 'gangadhar', '$2y$10$c608BX8sZFbkTIO3AAt.keybkFnAOgUlS1Gxq6V7b7ACqDCeD.r.q', 'gangadhar.k2468@gmail.com', 'rider', 'Kanda Bala Gangadhar', '9493008886', 'Visakhapatnam', '1746677146_1000111048.jpg', '2025-05-07 22:10:23', '2025-05-11 06:00:24', 'active'),
(65, 21, 'Vaaradhi@gmail.com', '$2y$10$c608BX8sZFbkTIO3AAt.keybkFnAOgUlS1Gxq6V7b7ACqDCeD.r.q', 'Vaaradhi@gmail.com', 'company', 'gangahar', '', NULL, NULL, '2025-05-07 22:18:38', '2025-05-13 19:59:46', 'active'),
(66, NULL, 'TARUN', '$2y$10$LE4J3L.2BQT8GUHr5pbV0umkJZW/q7dAG7FhCA7xB3bhtyIqvlKDO', 'srilasyapriyamanpower@gmail.com', 'rider', 'BONDADA TARUN', '9010038886', 'Visakhapatnam', '1746944720_1000361469.jpg', '2025-05-11 09:30:44', '2025-05-11 20:26:49', 'active'),
(67, NULL, '29915kiran', '$2y$10$F2cpV31winfZryf3U3fdnuCPGlOs3.tiI0OVUOisQA5SI.U2luhxC', '29915kiran@gmail.com', 'rider', 'Andavarapu kiran kumar', '9182036839', 'Dno 53-14-25 achivariveedi maddilapalem', NULL, '2025-05-12 08:40:09', '2025-05-14 16:11:34', ''),
(68, NULL, 'Venkatesh', '$2y$10$8UFUjeUgUkzG1M.yHPjngupK.NNRuZFInTzZRSpnTCmpLOsd6I2xO', 'venki1992kv@gmail.com', 'admin', 'Venkatesh', '', '', NULL, '2025-05-16 10:32:30', '2025-05-19 10:03:22', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `weekly_settlements`
--

CREATE TABLE `weekly_settlements` (
  `id` int(11) NOT NULL,
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
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `weekly_statements`
--

CREATE TABLE `weekly_statements` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `net_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `paid_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `payment_date` datetime NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `is_paid` tinyint(1) NOT NULL DEFAULT 0,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `weekly_statements`
--

INSERT INTO `weekly_statements` (`id`, `rider_id`, `amount`, `net_amount`, `paid_amount`, `start_date`, `end_date`, `payment_date`, `status`, `is_paid`, `payment_method`, `payment_reference`, `remarks`, `created_at`, `updated_at`) VALUES
(18, 39, 6059.25, 6059.25, 0.00, '2025-05-15', '2025-05-21', '2025-05-21 20:33:12', 'paid', 1, 'bank_transfer', '', '\nPayment processed on 2025-05-21 20:33:20: Payment processed for settlement', '2025-05-21 20:33:12', '2025-05-21 20:33:20'),
(19, 38, 6059.25, 6059.25, 0.00, '2025-05-15', '2025-05-21', '2025-05-21 20:33:12', 'paid', 1, 'bank_transfer', '', '\nPayment processed on 2025-05-21 20:33:20: Payment processed for settlement', '2025-05-21 20:33:12', '2025-05-21 20:33:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_achievements_rider_month` (`rider_id`,`month`),
  ADD KEY `idx_achievements_type` (`achievement_type`);

--
-- Indexes for table `admin_permissions`
--
ALTER TABLE `admin_permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `advance_request_settings`
--
ALTER TABLE `advance_request_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `app_settings`
--
ALTER TABLE `app_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `assigned_by` (`assigned_by`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `certificate_notifications`
--
ALTER TABLE `certificate_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_certificate_id` (`certificate_id`),
  ADD KEY `idx_rider_id` (`rider_id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_companies_company_name` (`company_name`);

--
-- Indexes for table `company_payments`
--
ALTER TABLE `company_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `company_stores`
--
ALTER TABLE `company_stores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `daily_order_uploads`
--
ALTER TABLE `daily_order_uploads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `daily_rider_orders`
--
ALTER TABLE `daily_rider_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `upload_id` (`upload_id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `order_date` (`order_date`),
  ADD KEY `company_rider_id` (`company_rider_id`),
  ADD KEY `idx_company_rider_id` (`company_rider_id`);

--
-- Indexes for table `email_templates`
--
ALTER TABLE `email_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `field_mappings`
--
ALTER TABLE `field_mappings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `id_card_templates`
--
ALTER TABLE `id_card_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `imported_report_data`
--
ALTER TABLE `imported_report_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `company_payment_id` (`company_payment_id`),
  ADD KEY `idx_invoices_company_id` (`company_id`),
  ADD KEY `idx_invoices_invoice_date` (`invoice_date`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `manpower_requests`
--
ALTER TABLE `manpower_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `added_by` (`added_by`),
  ADD KEY `idx_orders_company_id` (`company_id`),
  ADD KEY `idx_orders_rider_id` (`rider_id`),
  ADD KEY `idx_orders_order_date` (`order_date`),
  ADD KEY `idx_orders_company_id_order_date` (`company_id`,`order_date`),
  ADD KEY `idx_orders_created_at` (`created_at`);

--
-- Indexes for table `order_comparisons`
--
ALTER TABLE `order_comparisons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `finalized_by` (`finalized_by`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `payment_data`
--
ALTER TABLE `payment_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_id` (`payment_id`);

--
-- Indexes for table `payment_field_mappings`
--
ALTER TABLE `payment_field_mappings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_id` (`payment_id`);

--
-- Indexes for table `payment_file_headers`
--
ALTER TABLE `payment_file_headers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_id` (`payment_id`);

--
-- Indexes for table `payment_requests`
--
ALTER TABLE `payment_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `idx_payment_requests_rider_id` (`rider_id`),
  ADD KEY `idx_payment_requests_status` (`status`);

--
-- Indexes for table `payment_settlements`
--
ALTER TABLE `payment_settlements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `payment_request_id` (`payment_request_id`);

--
-- Indexes for table `performance_metrics`
--
ALTER TABLE `performance_metrics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rider_id` (`rider_id`);

--
-- Indexes for table `riders`
--
ALTER TABLE `riders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rider_code` (`rider_code`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `rider_assignments`
--
ALTER TABLE `rider_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_company_rider_id` (`company_id`,`company_rider_id`),
  ADD KEY `idx_rider_assignments_rider_id` (`rider_id`),
  ADD KEY `idx_rider_assignments_company_id` (`company_id`);

--
-- Indexes for table `rider_attendance`
--
ALTER TABLE `rider_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rider_id` (`rider_id`,`attendance_date`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `marked_by` (`marked_by`);

--
-- Indexes for table `rider_documents`
--
ALTER TABLE `rider_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rider_id` (`rider_id`);

--
-- Indexes for table `rider_earnings`
--
ALTER TABLE `rider_earnings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `finalized_by` (`finalized_by`);

--
-- Indexes for table `rider_insurance`
--
ALTER TABLE `rider_insurance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rider_id` (`rider_id`);

--
-- Indexes for table `rider_payments`
--
ALTER TABLE `rider_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_id` (`payment_id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `rider_payment_requests`
--
ALTER TABLE `rider_payment_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `order_date` (`order_date`),
  ADD KEY `status` (`status`),
  ADD KEY `is_advance` (`is_advance`);

--
-- Indexes for table `rider_performance`
--
ALTER TABLE `rider_performance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rider_id` (`rider_id`);

--
-- Indexes for table `settlement_config`
--
ALTER TABLE `settlement_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `config_key` (`config_key`);

--
-- Indexes for table `slider_images`
--
ALTER TABLE `slider_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `store_assignments`
--
ALTER TABLE `store_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rider_id` (`rider_id`,`store_id`,`assignment_date`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `system_fields`
--
ALTER TABLE `system_fields`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `field_key` (`field_key`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `upload_order_statement`
--
ALTER TABLE `upload_order_statement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `weekly_settlements`
--
ALTER TABLE `weekly_settlements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `weekly_statements`
--
ALTER TABLE `weekly_statements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `start_date` (`start_date`),
  ADD KEY `end_date` (`end_date`),
  ADD KEY `status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `admin_permissions`
--
ALTER TABLE `admin_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `advance_request_settings`
--
ALTER TABLE `advance_request_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `app_settings`
--
ALTER TABLE `app_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `certificate_notifications`
--
ALTER TABLE `certificate_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `company_payments`
--
ALTER TABLE `company_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `company_stores`
--
ALTER TABLE `company_stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `daily_order_uploads`
--
ALTER TABLE `daily_order_uploads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `daily_rider_orders`
--
ALTER TABLE `daily_rider_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=238;

--
-- AUTO_INCREMENT for table `email_templates`
--
ALTER TABLE `email_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `field_mappings`
--
ALTER TABLE `field_mappings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `id_card_templates`
--
ALTER TABLE `id_card_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `imported_report_data`
--
ALTER TABLE `imported_report_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `job_applications`
--
ALTER TABLE `job_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `manpower_requests`
--
ALTER TABLE `manpower_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `order_comparisons`
--
ALTER TABLE `order_comparisons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `payment_data`
--
ALTER TABLE `payment_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payment_field_mappings`
--
ALTER TABLE `payment_field_mappings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payment_file_headers`
--
ALTER TABLE `payment_file_headers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `payment_requests`
--
ALTER TABLE `payment_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `payment_settlements`
--
ALTER TABLE `payment_settlements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `performance_metrics`
--
ALTER TABLE `performance_metrics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `riders`
--
ALTER TABLE `riders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `rider_assignments`
--
ALTER TABLE `rider_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `rider_attendance`
--
ALTER TABLE `rider_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `rider_documents`
--
ALTER TABLE `rider_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `rider_earnings`
--
ALTER TABLE `rider_earnings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rider_insurance`
--
ALTER TABLE `rider_insurance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `rider_payments`
--
ALTER TABLE `rider_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT for table `rider_payment_requests`
--
ALTER TABLE `rider_payment_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `rider_performance`
--
ALTER TABLE `rider_performance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settlement_config`
--
ALTER TABLE `settlement_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `slider_images`
--
ALTER TABLE `slider_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `store_assignments`
--
ALTER TABLE `store_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `system_fields`
--
ALTER TABLE `system_fields`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `upload_order_statement`
--
ALTER TABLE `upload_order_statement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `weekly_settlements`
--
ALTER TABLE `weekly_settlements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `weekly_statements`
--
ALTER TABLE `weekly_statements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `achievements`
--
ALTER TABLE `achievements`
  ADD CONSTRAINT `achievements_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `achievements_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `admin_permissions`
--
ALTER TABLE `admin_permissions`
  ADD CONSTRAINT `admin_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `company_stores` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `assignments_ibfk_4` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`),
  ADD CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `companies_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `company_payments`
--
ALTER TABLE `company_payments`
  ADD CONSTRAINT `company_payments_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `company_stores`
--
ALTER TABLE `company_stores`
  ADD CONSTRAINT `company_stores_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `imported_report_data`
--
ALTER TABLE `imported_report_data`
  ADD CONSTRAINT `imported_report_data_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `imported_report_data_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`company_payment_id`) REFERENCES `company_payments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `company_stores` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_comparisons`
--
ALTER TABLE `order_comparisons`
  ADD CONSTRAINT `order_comparisons_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_comparisons_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_comparisons_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `company_stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_comparisons_ibfk_4` FOREIGN KEY (`finalized_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `performance_metrics`
--
ALTER TABLE `performance_metrics`
  ADD CONSTRAINT `performance_metrics_rider_id_fk` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `riders`
--
ALTER TABLE `riders`
  ADD CONSTRAINT `riders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `riders_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rider_assignments`
--
ALTER TABLE `rider_assignments`
  ADD CONSTRAINT `rider_assignments_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rider_assignments_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rider_assignments_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `company_stores` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `rider_assignments_ibfk_4` FOREIGN KEY (`assigned_by`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rider_attendance`
--
ALTER TABLE `rider_attendance`
  ADD CONSTRAINT `rider_attendance_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rider_attendance_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rider_attendance_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `company_stores` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `rider_attendance_ibfk_4` FOREIGN KEY (`marked_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rider_documents`
--
ALTER TABLE `rider_documents`
  ADD CONSTRAINT `rider_documents_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rider_earnings`
--
ALTER TABLE `rider_earnings`
  ADD CONSTRAINT `rider_earnings_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rider_earnings_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rider_earnings_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `rider_earnings_ibfk_4` FOREIGN KEY (`finalized_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `rider_payments`
--
ALTER TABLE `rider_payments`
  ADD CONSTRAINT `rider_payments_ibfk_2` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rider_payments_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rider_performance`
--
ALTER TABLE `rider_performance`
  ADD CONSTRAINT `rider_performance_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stores_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `store_assignments`
--
ALTER TABLE `store_assignments`
  ADD CONSTRAINT `store_assignments_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `store_assignments_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `company_stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `store_assignments_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD CONSTRAINT `suppliers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD CONSTRAINT `system_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

-- --------------------------------------------------------

--
-- Table structure for table `field_mappings`
--

CREATE TABLE `field_mappings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `company_field_name` varchar(255) NOT NULL COMMENT 'Excel column name',
  `supplier_field_name` varchar(255) NOT NULL COMMENT 'System field name',
  `show_to_rider` tinyint(1) NOT NULL DEFAULT 0,
  `show_in_invoice` tinyint(1) NOT NULL DEFAULT 0,
  `show_to_company` tinyint(1) NOT NULL DEFAULT 0,
  `count_for_commission` tinyint(1) NOT NULL DEFAULT 0,
  `editable_by_rider` tinyint(1) NOT NULL DEFAULT 0,
  `editable_by_company` tinyint(1) NOT NULL DEFAULT 0,
  `is_required` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `company_field_name` (`company_field_name`),
  KEY `supplier_field_name` (`supplier_field_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

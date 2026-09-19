-- =====================================================================
-- RideFlow – Web-Based Vehicle Rental Management System
-- Database Schema Script (MySQL 8.0+ Compatible)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `rideflow_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `rideflow_db`;

-- Disable FK checks during recreation
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `inspection_images`;
DROP TABLE IF EXISTS `rental_inspections`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `booking_status_history`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `maintenance_records`;
DROP TABLE IF EXISTS `vehicle_images`;
DROP TABLE IF EXISTS `vehicles`;
DROP TABLE IF EXISTS `vehicle_categories`;
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `customer_profiles`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS TABLE
CREATE TABLE `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(20) NOT NULL,
    `role` ENUM('ADMIN', 'STAFF', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CUSTOMER PROFILES TABLE
CREATE TABLE `customer_profiles` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL UNIQUE,
    `nic_or_passport` VARCHAR(30) NOT NULL,
    `licence_number` VARCHAR(30) NOT NULL,
    `licence_expiry_date` DATE NOT NULL,
    `licence_image_url` VARCHAR(255),
    `address` VARCHAR(255),
    `city` VARCHAR(50),
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PASSWORD RESET TOKENS TABLE
CREATE TABLE `password_reset_tokens` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `token` VARCHAR(100) NOT NULL UNIQUE,
    `expiry_date` TIMESTAMP NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reset_token_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_reset_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. VEHICLE CATEGORIES TABLE
CREATE TABLE `vehicle_categories` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `description` VARCHAR(255),
    `base_deposit` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. VEHICLES TABLE
CREATE TABLE `vehicles` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `category_id` BIGINT NOT NULL,
    `registration_number` VARCHAR(30) NOT NULL UNIQUE,
    `make` VARCHAR(50) NOT NULL,
    `model` VARCHAR(50) NOT NULL,
    `year` INT NOT NULL,
    `colour` VARCHAR(30) NOT NULL,
    `seats` INT NOT NULL,
    `transmission` ENUM('AUTOMATIC', 'MANUAL') NOT NULL,
    `fuel_type` ENUM('PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC') NOT NULL,
    `daily_rate` DECIMAL(10,2) NOT NULL,
    `current_mileage` INT NOT NULL DEFAULT 0,
    `status` ENUM('AVAILABLE', 'RESERVED', 'RENTED', 'MAINTENANCE', 'INACTIVE') NOT NULL DEFAULT 'AVAILABLE',
    `description` TEXT,
    `primary_image_url` VARCHAR(255),
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_vehicle_category` FOREIGN KEY (`category_id`) REFERENCES `vehicle_categories` (`id`),
    INDEX `idx_vehicle_status` (`status`),
    INDEX `idx_vehicle_reg` (`registration_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. VEHICLE IMAGES TABLE
CREATE TABLE `vehicle_images` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `vehicle_id` BIGINT NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_image_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BOOKINGS TABLE
CREATE TABLE `bookings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `booking_reference` VARCHAR(30) NOT NULL UNIQUE,
    `customer_id` BIGINT NOT NULL,
    `vehicle_id` BIGINT NOT NULL,
    `pickup_date` DATE NOT NULL,
    `return_date` DATE NOT NULL,
    `rental_days` INT NOT NULL,
    `daily_rate` DECIMAL(10,2) NOT NULL,
    `rental_subtotal` DECIMAL(10,2) NOT NULL,
    `late_charges` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `damage_charges` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `additional_charges` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `final_total` DECIMAL(10,2) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `payment_method` ENUM('CASH', 'CARD', 'BANK_TRANSFER') NOT NULL DEFAULT 'CASH',
    `payment_status` ENUM('PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT,
    `rejection_reason` VARCHAR(255),
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_booking_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
    CONSTRAINT `fk_booking_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
    INDEX `idx_booking_dates` (`pickup_date`, `return_date`),
    INDEX `idx_booking_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BOOKING STATUS HISTORY TABLE
CREATE TABLE `booking_status_history` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` BIGINT NOT NULL,
    `from_status` VARCHAR(20),
    `to_status` VARCHAR(20) NOT NULL,
    `changed_by_user_id` BIGINT NOT NULL,
    `reason` VARCHAR(255),
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_history_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_history_user` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. PAYMENTS TABLE
CREATE TABLE `payments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` BIGINT NOT NULL,
    `payment_method` ENUM('CASH', 'CARD', 'BANK_TRANSFER') NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `payment_status` ENUM('PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `reference_number` VARCHAR(60) NOT NULL UNIQUE,
    `payment_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `recorded_by_user_id` BIGINT NOT NULL,
    `notes` TEXT,
    CONSTRAINT `fk_payment_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_payment_user` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users` (`id`),
    INDEX `idx_payment_ref` (`reference_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. RENTAL INSPECTIONS TABLE (Handover & Return)
CREATE TABLE `rental_inspections` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` BIGINT NOT NULL,
    `inspection_type` ENUM('HANDOVER', 'RETURN') NOT NULL,
    `inspection_datetime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `mileage` INT NOT NULL,
    `fuel_level` ENUM('EMPTY', 'QUARTER', 'HALF', 'THREE_QUARTERS', 'FULL') NOT NULL,
    `damage_notes` TEXT,
    `checklist_json` TEXT,
    `late_charges` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `damage_charges` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `fuel_charges` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `other_charges` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `total_charges` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `inspected_by_user_id` BIGINT NOT NULL,
    `customer_acknowledged` BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT `fk_inspection_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_inspection_user` FOREIGN KEY (`inspected_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. INSPECTION IMAGES TABLE
CREATE TABLE `inspection_images` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `inspection_id` BIGINT NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_insp_image` FOREIGN KEY (`inspection_id`) REFERENCES `rental_inspections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. MAINTENANCE RECORDS TABLE
CREATE TABLE `maintenance_records` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `vehicle_id` BIGINT NOT NULL,
    `maintenance_type` VARCHAR(100) NOT NULL,
    `start_date` DATE NOT NULL,
    `expected_completion_date` DATE NOT NULL,
    `actual_completion_date` DATE,
    `cost` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `service_provider` VARCHAR(100) NOT NULL,
    `notes` TEXT,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_maint_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
    INDEX `idx_maint_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. NOTIFICATIONS TABLE
CREATE TABLE `notifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(120) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_notif_user` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. AUDIT LOGS TABLE
CREATE TABLE `audit_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT,
    `action` VARCHAR(60) NOT NULL,
    `entity_type` VARCHAR(60) NOT NULL,
    `entity_id` VARCHAR(60),
    `old_value` TEXT,
    `new_value` TEXT,
    `ip_address` VARCHAR(45),
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    INDEX `idx_audit_action` (`action`),
    INDEX `idx_audit_time` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

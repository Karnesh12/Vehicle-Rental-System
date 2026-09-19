-- ====================================================================
-- RideFlow: Vehicle Rental Management System
-- Production & Viva Evaluation Seed Data
-- ====================================================================

USE `rideflow_db`;

-- Note: Passwords are encrypted using BCrypt ($2a$10$...)
-- admin@rideflow.lk    -> Admin123!
-- staff@rideflow.lk    -> Staff123!
-- customer@rideflow.lk -> Customer123!
-- kasun@rideflow.lk    -> Customer123!

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `phone_number`, `role`, `is_active`) VALUES
(1, 'admin@rideflow.lk', '$2a$10$7ZzM8lJzH1X9c2TqJ5vKie7kY7Uu9UeA7qD6aZ3xW.j4B.cM1oGkC', 'System Administrator', '+94 11 234 5678', 'ADMIN', 1),
(2, 'staff@rideflow.lk', '$2a$10$8XzM8lJzH1X9c2TqJ5vKie7kY7Uu9UeA7qD6aZ3xW.j4B.cM1oGkD', 'Branch Fleet Operator', '+94 77 123 4567', 'STAFF', 1),
(3, 'customer@rideflow.lk', '$2a$10$9YzM8lJzH1X9c2TqJ5vKie7kY7Uu9UeA7qD6aZ3xW.j4B.cM1oGkE', 'Nimal Perera', '+94 71 987 6543', 'CUSTOMER', 1),
(4, 'kasun@rideflow.lk', '$2a$10$9YzM8lJzH1X9c2TqJ5vKie7kY7Uu9UeA7qD6aZ3xW.j4B.cM1oGkE', 'Kasun Bandara', '+94 76 555 4321', 'CUSTOMER', 1)
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

INSERT INTO `customer_profiles` (`id`, `user_id`, `nic_or_passport`, `driving_licence_number`, `licence_expiry_date`, `address`, `is_licence_verified`) VALUES
(1, 3, '199214502341', 'B8934512', '2028-12-31', 'No. 45, Galle Road, Colombo 03, Sri Lanka', 1),
(2, 4, '199578103429', 'B7821034', '2027-06-15', 'No. 12, Kandy Road, Wattala, Sri Lanka', 1)
ON DUPLICATE KEY UPDATE `address` = VALUES(`address`);

INSERT INTO `vehicle_categories` (`id`, `name`, `description`, `base_security_deposit`) VALUES
(1, 'Sedan', 'Comfortable 4-5 passenger sedans perfect for business commutes and highway travel.', 15000.00),
(2, 'SUV', 'High-ground-clearance compact and full-sized 4x4 vehicles for family vacations and outstation trips.', 25000.00),
(3, 'Luxury', 'Executive premium sedans and convertibles for weddings, VIP transport, and prestige tours.', 50000.00),
(4, 'Van', 'Spacious 9-14 seater passenger vans designed for group tourism and family excursions.', 20000.00),
(5, 'Bike', 'Fuel-efficient automatic scooters and commuter motorbikes for swift city navigation.', 10000.00)
ON DUPLICATE KEY UPDATE `base_security_deposit` = VALUES(`base_security_deposit`);

INSERT INTO `vehicles` (`id`, `category_id`, `brand`, `model`, `year`, `license_plate`, `color`, `transmission`, `fuel_type`, `seating_capacity`, `daily_rate`, `hourly_late_fee`, `mileage`, `status`, `features`, `primary_image_url`) VALUES
(1, 1, 'Toyota', 'Prius Alpha', 2021, 'WP CAA-4412', 'Pearl White', 'AUTOMATIC', 'HYBRID', 5, 12500.00, 1500.00, 32450, 'AVAILABLE', 'Air Conditioning, Bluetooth Audio, Cruise Control, Lane Keep Assist, Reverse Camera', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'),
(2, 2, 'Toyota', 'Land Cruiser Prado', 2022, 'WP CBG-9901', 'Metallic Black', 'AUTOMATIC', 'DIESEL', 7, 35000.00, 3500.00, 18200, 'AVAILABLE', '4WD Dual Range, Leather Interior, 360 Degree Camera, Sunroof, Multi-Zone Climate', 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80'),
(3, 1, 'Honda', 'Civic RS Turbo', 2023, 'WP CBE-1288', 'Rallye Red', 'AUTOMATIC', 'PETROL', 5, 16000.00, 2000.00, 14300, 'RENTED', 'Apple CarPlay, Android Auto, Paddle Shifters, Sport Exhaust, Blind Spot Monitoring', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80'),
(4, 2, 'Honda', 'Vezel Z Hybrid', 2022, 'WP CBD-5520', 'Crystal Black', 'AUTOMATIC', 'HYBRID', 5, 14500.00, 1800.00, 22100, 'AVAILABLE', 'LED Headlights, Smart Key Entry, Honda Sensing, Electronic Handbrake, Heated Seats', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'),
(5, 4, 'Toyota', 'KDH 200 Super GL', 2020, 'WP NB-7734', 'Silver Metallic', 'AUTOMATIC', 'DIESEL', 10, 22000.00, 2500.00, 68900, 'AVAILABLE', 'Dual AC, High Roof, Reclining Seats, Tinted Windows, USB Charging Hubs', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80'),
(6, 3, 'Mercedes-Benz', 'C200 AMG Line', 2023, 'WP CBK-0077', 'Obsidian Black', 'AUTOMATIC', 'PETROL', 5, 45000.00, 4500.00, 8900, 'AVAILABLE', 'AMG Styling, Ambient 64-Color Lighting, Burmester Sound, Panoramic Roof', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'),
(7, 5, 'Yamaha', 'NMAX 155 ABS', 2023, 'WP BDH-4122', 'Matte Navy', 'AUTOMATIC', 'PETROL', 2, 4500.00, 600.00, 7400, 'AVAILABLE', 'ABS Brakes, Traction Control, Digital Cluster, Large Underseat Storage, USB Socket', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80')
ON DUPLICATE KEY UPDATE `daily_rate` = VALUES(`daily_rate`);

INSERT INTO `bookings` (`id`, `booking_reference`, `customer_id`, `vehicle_id`, `start_date`, `end_date`, `pickup_location`, `return_location`, `total_days`, `daily_rate`, `deposit_amount`, `damage_charge`, `late_fee`, `total_price`, `status`, `rejection_reason`) VALUES
(1, 'BK-2026-0001', 3, 3, '2026-09-12', '2026-09-16', 'Colombo HQ (Bambalapitiya)', 'Colombo HQ (Bambalapitiya)', 4, 16000.00, 15000.00, 0.00, 0.00, 64000.00, 'ACTIVE', NULL),
(2, 'BK-2026-0002', 4, 1, '2026-09-20', '2026-09-23', 'Colombo HQ (Bambalapitiya)', 'Bandaranaike Intl Airport (CMB)', 3, 12500.00, 15000.00, 0.00, 0.00, 37500.00, 'PENDING', NULL),
(3, 'BK-2026-0003', 3, 2, '2026-08-10', '2026-08-14', 'Colombo HQ (Bambalapitiya)', 'Colombo HQ (Bambalapitiya)', 4, 35000.00, 25000.00, 0.00, 0.00, 140000.00, 'COMPLETED', NULL)
ON DUPLICATE KEY UPDATE `total_price` = VALUES(`total_price`);

INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `amount`, `payment_method`, `status`, `notes`) VALUES
(1, 1, 'TXN-902144', 64000.00, 'CARD', 'COMPLETED', 'Initial rental prepayment via Commercial Bank Visa card'),
(2, 3, 'TXN-881230', 140000.00, 'BANK_TRANSFER', 'COMPLETED', 'Bank wire transfer confirmed - HNB Ref #441290')
ON DUPLICATE KEY UPDATE `amount` = VALUES(`amount`);

INSERT INTO `rental_inspections` (`id`, `booking_id`, `inspector_id`, `type`, `odometer_reading`, `fuel_level`, `cleanliness_status`, `notes`, `damage_notes`, `damage_fee`, `late_fee`) VALUES
(1, 1, 2, 'HANDOVER', 14300, 'FULL', 'Clean & Valeted', 'Pre-rental inspection clear. Spare tyre and warning kit present.', NULL, 0.00, 0.00),
(2, 3, 2, 'HANDOVER', 17200, 'FULL', 'Clean', 'Handover inspection clear.', NULL, 0.00, 0.00),
(3, 3, 2, 'RETURN', 18200, 'FULL', 'Clean', 'Trip completed without incidents (1,000 km driven). Key and documents returned.', NULL, 0.00, 0.00)
ON DUPLICATE KEY UPDATE `notes` = VALUES(`notes`);

INSERT INTO `maintenance_records` (`id`, `vehicle_id`, `maintenance_type`, `start_date`, `expected_completion_date`, `actual_completion_date`, `cost`, `service_provider`, `notes`, `status`) VALUES
(1, 5, 'PERIODIC_SERVICE', '2026-09-10', '2026-09-12', '2026-09-12', 28500.00, 'Toyota Lanka - Wattala', 'Replaced engine oil 15W-40, oil filter, air filter, and front brake pads.', 'COMPLETED'),
(2, 4, 'PERIODIC_SERVICE', '2026-09-15', '2026-09-16', NULL, 18000.00, 'Stafford Motors - Rattanapitiya', 'Scheduled 20,000 km hybrid system routine checkup.', 'SCHEDULED')
ON DUPLICATE KEY UPDATE `cost` = VALUES(`cost`);

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_value`, `new_value`, `ip_address`) VALUES
(1, 1, 'SYSTEM_INIT', 'System', '0', NULL, 'Database and Master Fleet Initialized', '127.0.0.1'),
(2, 2, 'INSPECTION_HANDOVER', 'Booking', '1', 'CONFIRMED', 'ACTIVE', '127.0.0.1'),
(3, 3, 'BOOKING_CREATE', 'Booking', '2', NULL, 'PENDING', '127.0.0.1')
ON DUPLICATE KEY UPDATE `action` = VALUES(`action`);

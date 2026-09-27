package com.rideflow.config;

import com.rideflow.entity.*;
import com.rideflow.enums.*;
import com.rideflow.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final VehicleCategoryRepository categoryRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleImageRepository vehicleImageRepository;
    private final BookingRepository bookingRepository;
    private final BookingStatusHistoryRepository historyRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CustomerProfileRepository customerProfileRepository,
                           VehicleCategoryRepository categoryRepository,
                           VehicleRepository vehicleRepository,
                           VehicleImageRepository vehicleImageRepository,
                           BookingRepository bookingRepository,
                           BookingStatusHistoryRepository historyRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.categoryRepository = categoryRepository;
        this.vehicleRepository = vehicleRepository;
        this.vehicleImageRepository = vehicleImageRepository;
        this.bookingRepository = bookingRepository;
        this.historyRepository = historyRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        log.info("Starting RideFlow initial data verification and seeding...");

        // 1. Seed Categories
        VehicleCategory carCat = categoryRepository.findByNameIgnoreCase("CAR")
                .orElseGet(() -> categoryRepository.save(new VehicleCategory("CAR", "Comfortable sedans, hatchbacks, and compact SUVs", new BigDecimal("25000.00"))));

        VehicleCategory vanCat = categoryRepository.findByNameIgnoreCase("VAN")
                .orElseGet(() -> categoryRepository.save(new VehicleCategory("VAN", "Spacious passenger and touring vans", new BigDecimal("40000.00"))));

        VehicleCategory bikeCat = categoryRepository.findByNameIgnoreCase("BIKE")
                .orElseGet(() -> categoryRepository.save(new VehicleCategory("BIKE", "Fuel-efficient scooters and touring motorcycles", new BigDecimal("10000.00"))));

        // 2. Seed Default Users
        // Admin
        User admin = userRepository.findByEmail("admin@rideflow.lk").orElseGet(() -> {
            User u = new User("admin@rideflow.lk", passwordEncoder.encode("Admin123!"), "System Administrator", "+94771234567", Role.ADMIN);
            return userRepository.save(u);
        });

        // Staff
        User staff = userRepository.findByEmail("staff@rideflow.lk").orElseGet(() -> {
            User u = new User("staff@rideflow.lk", passwordEncoder.encode("Staff123!"), "Chaminda Perera (Fleet Officer)", "+94772345678", Role.STAFF);
            return userRepository.save(u);
        });

        // Customer
        User customer = userRepository.findByEmail("customer@rideflow.lk").orElseGet(() -> {
            User u = new User("customer@rideflow.lk", passwordEncoder.encode("Customer123!"), "Kasun Jayasuriya", "+94773456789", Role.CUSTOMER);
            u = userRepository.save(u);

            CustomerProfile profile = new CustomerProfile(
                    u, "199423401234", "B4592031", LocalDate.now().plusYears(4), "45 Galle Road, Bambalapitiya", "Colombo"
            );
            customerProfileRepository.save(profile);
            return u;
        });

        // 3. Seed Fleet of Vehicles if empty
        if (vehicleRepository.count() == 0) {
            log.info("Seeding initial fleet of vehicles...");

            // Car 1: Toyota Prius
            Vehicle car1 = new Vehicle();
            car1.setCategory(carCat);
            car1.setRegistrationNumber("WP CAK-4512");
            car1.setMake("Toyota");
            car1.setModel("Prius 4th Gen");
            car1.setYear(2021);
            car1.setColour("Pearl White");
            car1.setSeats(5);
            car1.setTransmission(Transmission.AUTOMATIC);
            car1.setFuelType(FuelType.HYBRID);
            car1.setDailyRate(new BigDecimal("14500.00"));
            car1.setCurrentMileage(42500);
            car1.setStatus(VehicleStatus.AVAILABLE);
            car1.setDescription("Premium hybrid sedan featuring exceptional fuel efficiency, spacious boot, and advanced safety features. Ideal for family trips across Sri Lanka.");
            car1.setPrimaryImageUrl("https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=800&q=80");
            car1 = vehicleRepository.save(car1);

            vehicleImageRepository.save(new VehicleImage(car1, "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80", false));
            vehicleImageRepository.save(new VehicleImage(car1, "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80", false));

            // Car 2: Honda Vezel
            Vehicle car2 = new Vehicle();
            car2.setCategory(carCat);
            car2.setRegistrationNumber("WP CAD-8821");
            car2.setMake("Honda");
            car2.setModel("Vezel RS Hybrid");
            car2.setYear(2022);
            car2.setColour("Crystal Black");
            car2.setSeats(5);
            car2.setTransmission(Transmission.AUTOMATIC);
            car2.setFuelType(FuelType.HYBRID);
            car2.setDailyRate(new BigDecimal("18500.00"));
            car2.setCurrentMileage(28300);
            car2.setStatus(VehicleStatus.AVAILABLE);
            car2.setDescription("Sporty compact SUV with paddle shifters, leather interior, panoramic view, and high ground clearance for outstation travel.");
            car2.setPrimaryImageUrl("https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80");
            vehicleRepository.save(car2);

            // Car 3: Suzuki Wagon R
            Vehicle car3 = new Vehicle();
            car3.setCategory(carCat);
            car3.setRegistrationNumber("WP CBH-1245");
            car3.setMake("Suzuki");
            car3.setModel("Wagon R Stingray");
            car3.setYear(2020);
            car3.setColour("Silver Metallic");
            car3.setSeats(4);
            car3.setTransmission(Transmission.AUTOMATIC);
            car3.setFuelType(FuelType.PETROL);
            car3.setDailyRate(new BigDecimal("9500.00"));
            car3.setCurrentMileage(61200);
            car3.setStatus(VehicleStatus.AVAILABLE);
            car3.setDescription("Budget-friendly city hatchback with excellent fuel economy and effortless parking. Perfect for Colombo errands and airport transfers.");
            car3.setPrimaryImageUrl("https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80");
            vehicleRepository.save(car3);

            // Van 1: Toyota KDH HiAce
            Vehicle van1 = new Vehicle();
            van1.setCategory(vanCat);
            van1.setRegistrationNumber("WP PH-6789");
            van1.setMake("Toyota");
            van1.setModel("HiAce KDH Super GL");
            van1.setYear(2021);
            van1.setColour("Glossy Silver");
            van1.setSeats(10);
            van1.setTransmission(Transmission.AUTOMATIC);
            van1.setFuelType(FuelType.DIESEL);
            van1.setDailyRate(new BigDecimal("26000.00"));
            van1.setCurrentMileage(54000);
            van1.setStatus(VehicleStatus.AVAILABLE);
            van1.setDescription("Luxury passenger van with dual A/C, reclining bucket seats, luggage space, and Bluetooth audio. Best choice for wedding hires and hill country tours.");
            van1.setPrimaryImageUrl("https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80");
            vehicleRepository.save(van1);

            // Van 2: Nissan Caravan
            Vehicle van2 = new Vehicle();
            van2.setCategory(vanCat);
            van2.setRegistrationNumber("CP NA-3412");
            van2.setMake("Nissan");
            van2.setModel("Caravan NV350");
            van2.setYear(2019);
            van2.setColour("Pure White");
            van2.setSeats(12);
            van2.setTransmission(Transmission.MANUAL);
            van2.setFuelType(FuelType.DIESEL);
            van2.setDailyRate(new BigDecimal("22500.00"));
            van2.setCurrentMileage(82000);
            van2.setStatus(VehicleStatus.AVAILABLE);
            van2.setDescription("Robust 12-seater long wheelbase van suitable for corporate excursions and long distance travel across provinces.");
            van2.setPrimaryImageUrl("https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=800&q=80");
            vehicleRepository.save(van2);

            // Bike 1: Honda PCX 160
            Vehicle bike1 = new Vehicle();
            bike1.setCategory(bikeCat);
            bike1.setRegistrationNumber("SP BCD-7744");
            bike1.setMake("Honda");
            bike1.setModel("PCX 160 ABS");
            bike1.setYear(2023);
            bike1.setColour("Matte Blue");
            bike1.setSeats(2);
            bike1.setTransmission(Transmission.AUTOMATIC);
            bike1.setFuelType(FuelType.PETROL);
            bike1.setDailyRate(new BigDecimal("4500.00"));
            bike1.setCurrentMileage(11200);
            bike1.setStatus(VehicleStatus.AVAILABLE);
            bike1.setDescription("Premium maxi-scooter with smart key, ABS disc brakes, spacious under-seat storage, and smooth highway cruising.");
            bike1.setPrimaryImageUrl("https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80");
            vehicleRepository.save(bike1);

            // Bike 2: Yamaha FZ-S Version 3.0
            Vehicle bike2 = new Vehicle();
            bike2.setCategory(bikeCat);
            bike2.setRegistrationNumber("WP BF-9912");
            bike2.setMake("Yamaha");
            bike2.setModel("FZ-S FI V3");
            bike2.setYear(2022);
            bike2.setColour("Dark Knight");
            bike2.setSeats(2);
            bike2.setTransmission(Transmission.MANUAL);
            bike2.setFuelType(FuelType.PETROL);
            bike2.setDailyRate(new BigDecimal("4000.00"));
            bike2.setCurrentMileage(18700);
            bike2.setStatus(VehicleStatus.AVAILABLE);
            bike2.setDescription("Agile street bike with single-channel ABS, LED headlight, and muscular ergonomics for comfortable city commuting.");
            bike2.setPrimaryImageUrl("https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80");
            vehicleRepository.save(bike2);
        }

        // 4. Seed initial completed booking & notification if none exist
        if (bookingRepository.count() == 0) {
            List<Vehicle> vehicles = vehicleRepository.findAll();
            if (!vehicles.isEmpty()) {
                Vehicle car = vehicles.get(0);
                Booking sampleBooking = new Booking();
                sampleBooking.setBookingReference("RF-20260901-1001");
                sampleBooking.setCustomer(customer);
                sampleBooking.setVehicle(car);
                sampleBooking.setPickupDate(LocalDate.now().plusDays(2));
                sampleBooking.setReturnDate(LocalDate.now().plusDays(5));
                sampleBooking.setRentalDays(3);
                sampleBooking.setDailyRate(car.getDailyRate());
                sampleBooking.setRentalSubtotal(car.getDailyRate().multiply(BigDecimal.valueOf(3)));
                sampleBooking.setFinalTotal(sampleBooking.getRentalSubtotal());
                sampleBooking.setStatus(BookingStatus.CONFIRMED);
                sampleBooking.setPaymentMethod(PaymentMethod.CARD);
                sampleBooking.setPaymentStatus(PaymentStatus.PAID);
                sampleBooking.setNotes("Airport pickup request at 9:00 AM.");
                sampleBooking = bookingRepository.save(sampleBooking);

                historyRepository.save(new BookingStatusHistory(
                        sampleBooking, BookingStatus.PENDING.name(), BookingStatus.CONFIRMED.name(), staff, "Confirmed by staff after document verification."
                ));

                notificationRepository.save(new Notification(
                        customer, "Booking Confirmed", "Your booking RF-20260901-1001 has been confirmed for " + sampleBooking.getPickupDate(), "SUCCESS"
                ));
            }
        }

        log.info("RideFlow initial data seeding completed successfully.");
    }
}

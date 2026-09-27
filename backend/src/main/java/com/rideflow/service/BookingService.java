package com.rideflow.service;

import com.rideflow.dto.BookingApprovalRequest;
import com.rideflow.dto.BookingCreateRequest;
import com.rideflow.dto.BookingDto;
import com.rideflow.entity.Booking;
import com.rideflow.entity.BookingStatusHistory;
import com.rideflow.entity.User;
import com.rideflow.entity.Vehicle;
import com.rideflow.enums.BookingStatus;
import com.rideflow.enums.PaymentStatus;
import com.rideflow.enums.VehicleStatus;
import com.rideflow.exception.BadRequestException;
import com.rideflow.exception.ConflictException;
import com.rideflow.exception.ResourceNotFoundException;
import com.rideflow.mapper.BookingMapper;
import com.rideflow.repository.BookingRepository;
import com.rideflow.repository.BookingStatusHistoryRepository;
import com.rideflow.repository.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingStatusHistoryRepository historyRepository;
    private final VehicleRepository vehicleRepository;
    private final AvailabilityService availabilityService;
    private final BookingMapper bookingMapper;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
                          BookingStatusHistoryRepository historyRepository,
                          VehicleRepository vehicleRepository,
                          AvailabilityService availabilityService,
                          BookingMapper bookingMapper,
                          AuditLogService auditLogService,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.historyRepository = historyRepository;
        this.vehicleRepository = vehicleRepository;
        this.availabilityService = availabilityService;
        this.bookingMapper = bookingMapper;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    private String generateBookingReference() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomSuffix = 1000 + new Random().nextInt(9000);
        return "RF-" + timestamp + "-" + randomSuffix;
    }

    @Transactional
    public BookingDto createBooking(BookingCreateRequest request, User customer) {
        availabilityService.validateBookingDates(request.getPickupDate(), request.getReturnDate());

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + request.getVehicleId()));

        if (vehicle.getStatus() == VehicleStatus.INACTIVE || vehicle.getStatus() == VehicleStatus.MAINTENANCE) {
            throw new BadRequestException("Vehicle is currently unavailable for bookings (" + vehicle.getStatus() + ").");
        }

        // Strict double-booking check
        boolean booked = vehicleRepository.isVehicleBookedForDates(
                vehicle.getId(), request.getPickupDate(), request.getReturnDate()
        );
        if (booked) {
            throw new ConflictException("Vehicle is already booked or reserved for the selected dates.");
        }

        // Backend-only price calculation
        int rentalDays = availabilityService.calculateRentalDays(request.getPickupDate(), request.getReturnDate());
        BigDecimal dailyRate = vehicle.getDailyRate();
        BigDecimal rentalSubtotal = dailyRate.multiply(BigDecimal.valueOf(rentalDays));
        BigDecimal finalTotal = rentalSubtotal;

        Booking booking = new Booking();
        booking.setBookingReference(generateBookingReference());
        booking.setCustomer(customer);
        booking.setVehicle(vehicle);
        booking.setPickupDate(request.getPickupDate());
        booking.setReturnDate(request.getReturnDate());
        booking.setRentalDays(rentalDays);
        booking.setDailyRate(dailyRate);
        booking.setRentalSubtotal(rentalSubtotal);
        booking.setLateCharges(BigDecimal.ZERO);
        booking.setDamageCharges(BigDecimal.ZERO);
        booking.setAdditionalCharges(BigDecimal.ZERO);
        booking.setFinalTotal(finalTotal);
        booking.setStatus(BookingStatus.PENDING);
        booking.setPaymentMethod(request.getPaymentMethod());
        booking.setPaymentStatus(PaymentStatus.PENDING);
        booking.setNotes(request.getNotes());

        booking = bookingRepository.save(booking);

        // Status history
        BookingStatusHistory history = new BookingStatusHistory(
                booking, null, BookingStatus.PENDING.name(), customer, "Initial booking created by customer."
        );
        historyRepository.save(history);

        // Audit log
        auditLogService.log(customer, "BOOKING_CREATED", "Booking", booking.getId().toString(), null,
                booking.getBookingReference() + " (LKR " + finalTotal + ")", null);

        // In-system notifications
        notificationService.createNotification(customer, "Booking Received",
                "Your booking request (" + booking.getBookingReference() + ") has been placed and is pending staff verification.", "INFO");

        notificationService.notifyStaffAndAdmin("New Booking Request",
                "New booking " + booking.getBookingReference() + " for " + vehicle.getMake() + " " + vehicle.getModel() + " is awaiting review.", "BOOKING");

        return bookingMapper.toDto(booking);
    }

    public Booking getBookingEntity(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
    }

    public BookingDto getBookingById(Long id) {
        return bookingMapper.toDto(getBookingEntity(id));
    }

    public BookingDto getBookingByReference(String reference) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with reference: " + reference));
        return bookingMapper.toDto(booking);
    }

    public Page<BookingDto> getAllBookings(BookingStatus status, Pageable pageable) {
        if (status != null) {
            return bookingRepository.findByStatusOrderByCreatedAtDesc(status, pageable).map(bookingMapper::toDto);
        }
        return bookingRepository.findAllByOrderByCreatedAtDesc(pageable).map(bookingMapper::toDto);
    }

    public Page<BookingDto> getCustomerBookings(Long customerId, Pageable pageable) {
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable).map(bookingMapper::toDto);
    }

    public List<BookingDto> getCustomerBookingsList(Long customerId) {
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(bookingMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingDto reviewBooking(Long bookingId, BookingApprovalRequest request, User staffUser) {
        Booking booking = getBookingEntity(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only bookings in PENDING status can be approved or rejected. Current status: " + booking.getStatus());
        }

        String oldStatus = booking.getStatus().name();
        BookingStatus newStatus;

        if (request.getApproved()) {
            newStatus = BookingStatus.CONFIRMED;
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.getVehicle().setStatus(VehicleStatus.RESERVED);
            vehicleRepository.save(booking.getVehicle());
        } else {
            newStatus = BookingStatus.REJECTED;
            booking.setStatus(BookingStatus.REJECTED);
            booking.setRejectionReason(request.getReason() != null ? request.getReason() : "Rejected by staff.");
        }

        booking = bookingRepository.save(booking);

        BookingStatusHistory history = new BookingStatusHistory(
                booking, oldStatus, newStatus.name(), staffUser, request.getReason() != null ? request.getReason() : "Reviewed by staff"
        );
        historyRepository.save(history);

        auditLogService.log(staffUser, "BOOKING_REVIEW", "Booking", booking.getId().toString(), oldStatus, newStatus.name(), null);

        notificationService.createNotification(booking.getCustomer(),
                request.getApproved() ? "Booking Confirmed!" : "Booking Request Declined",
                request.getApproved() ?
                        "Your booking " + booking.getBookingReference() + " has been approved! Please visit for vehicle handover on " + booking.getPickupDate() + "." :
                        "Your booking " + booking.getBookingReference() + " was declined. Reason: " + booking.getRejectionReason(),
                request.getApproved() ? "SUCCESS" : "ERROR");

        return bookingMapper.toDto(booking);
    }

    @Transactional
    public BookingDto cancelBooking(Long bookingId, String reason, User user) {
        Booking booking = getBookingEntity(bookingId);

        if (booking.getStatus() == BookingStatus.ACTIVE || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Active or Completed rentals cannot be cancelled.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REJECTED) {
            throw new BadRequestException("Booking is already " + booking.getStatus());
        }

        String oldStatus = booking.getStatus().name();
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setNotes((booking.getNotes() != null ? booking.getNotes() + " | " : "") + "Cancelled: " + reason);

        // If vehicle was marked RESERVED, restore to AVAILABLE
        if (booking.getVehicle().getStatus() == VehicleStatus.RESERVED) {
            booking.getVehicle().setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(booking.getVehicle());
        }

        booking = bookingRepository.save(booking);

        BookingStatusHistory history = new BookingStatusHistory(
                booking, oldStatus, BookingStatus.CANCELLED.name(), user, reason
        );
        historyRepository.save(history);

        auditLogService.log(user, "BOOKING_CANCELLED", "Booking", booking.getId().toString(), oldStatus, BookingStatus.CANCELLED.name(), null);

        notificationService.createNotification(booking.getCustomer(), "Booking Cancelled",
                "Booking " + booking.getBookingReference() + " has been cancelled.", "WARNING");

        return bookingMapper.toDto(booking);
    }
}

package com.rideflow.service;

import com.rideflow.dto.HandoverInspectionRequest;
import com.rideflow.dto.InspectionDto;
import com.rideflow.dto.ReturnInspectionRequest;
import com.rideflow.entity.*;
import com.rideflow.enums.BookingStatus;
import com.rideflow.enums.InspectionType;
import com.rideflow.enums.VehicleStatus;
import com.rideflow.exception.BadRequestException;
import com.rideflow.exception.ResourceNotFoundException;
import com.rideflow.mapper.InspectionMapper;
import com.rideflow.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InspectionService {

    private final RentalInspectionRepository inspectionRepository;
    private final InspectionImageRepository imageRepository;
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingStatusHistoryRepository historyRepository;
    private final InspectionMapper inspectionMapper;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public InspectionService(RentalInspectionRepository inspectionRepository,
                             InspectionImageRepository imageRepository,
                             BookingRepository bookingRepository,
                             VehicleRepository vehicleRepository,
                             BookingStatusHistoryRepository historyRepository,
                             InspectionMapper inspectionMapper,
                             AuditLogService auditLogService,
                             NotificationService notificationService) {
        this.inspectionRepository = inspectionRepository;
        this.imageRepository = imageRepository;
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.historyRepository = historyRepository;
        this.inspectionMapper = inspectionMapper;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    @Transactional
    public InspectionDto performHandover(HandoverInspectionRequest request, User staffUser) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + request.getBookingId()));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BadRequestException("Only CONFIRMED bookings can undergo vehicle handover. Current status: " + booking.getStatus());
        }

        if (inspectionRepository.existsByBookingIdAndInspectionType(booking.getId(), InspectionType.HANDOVER)) {
            throw new BadRequestException("Handover inspection already recorded for this booking.");
        }

        Vehicle vehicle = booking.getVehicle();
        if (request.getMileage() < vehicle.getCurrentMileage()) {
            throw new BadRequestException("Handover mileage (" + request.getMileage() + ") cannot be less than vehicle's current recorded mileage (" + vehicle.getCurrentMileage() + ").");
        }

        // Update vehicle
        vehicle.setCurrentMileage(request.getMileage());
        vehicle.setStatus(VehicleStatus.RENTED);
        vehicleRepository.save(vehicle);

        // Update booking status
        String oldStatus = booking.getStatus().name();
        booking.setStatus(BookingStatus.ACTIVE);
        booking = bookingRepository.save(booking);

        // Record Inspection
        RentalInspection inspection = new RentalInspection();
        inspection.setBooking(booking);
        inspection.setInspectionType(InspectionType.HANDOVER);
        inspection.setInspectionDatetime(LocalDateTime.now());
        inspection.setMileage(request.getMileage());
        inspection.setFuelLevel(request.getFuelLevel());
        inspection.setDamageNotes(request.getDamageNotes());
        inspection.setChecklistJson(request.getChecklistJson());
        inspection.setInspectedBy(staffUser);
        inspection.setCustomerAcknowledged(request.getCustomerAcknowledged() != null ? request.getCustomerAcknowledged() : true);
        inspection = inspectionRepository.save(inspection);

        if (request.getImageUrls() != null) {
            for (String url : request.getImageUrls()) {
                InspectionImage img = new InspectionImage(inspection, url);
                imageRepository.save(img);
            }
        }

        // History
        BookingStatusHistory history = new BookingStatusHistory(
                booking, oldStatus, BookingStatus.ACTIVE.name(), staffUser, "Vehicle handed over to customer. Mileage: " + request.getMileage()
        );
        historyRepository.save(history);

        auditLogService.log(staffUser, "VEHICLE_HANDOVER", "Booking", booking.getId().toString(), oldStatus, "ACTIVE", null);
        notificationService.createNotification(booking.getCustomer(), "Rental Started!",
                "Vehicle " + vehicle.getMake() + " " + vehicle.getModel() + " handed over. Have a safe drive!", "SUCCESS");

        return inspectionMapper.toDto(inspection);
    }

    @Transactional
    public InspectionDto performReturn(ReturnInspectionRequest request, User staffUser) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + request.getBookingId()));

        if (booking.getStatus() != BookingStatus.ACTIVE) {
            throw new BadRequestException("Only ACTIVE rentals can be returned. Current status: " + booking.getStatus());
        }

        if (inspectionRepository.existsByBookingIdAndInspectionType(booking.getId(), InspectionType.RETURN)) {
            throw new BadRequestException("Return inspection already recorded for this booking.");
        }

        Vehicle vehicle = booking.getVehicle();
        if (request.getReturnMileage() < vehicle.getCurrentMileage()) {
            throw new BadRequestException("Return mileage (" + request.getReturnMileage() + ") cannot be less than handover mileage (" + vehicle.getCurrentMileage() + ").");
        }

        // Update vehicle status back to AVAILABLE and update mileage
        vehicle.setCurrentMileage(request.getReturnMileage());
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepository.save(vehicle);

        BigDecimal late = request.getLateCharges() != null ? request.getLateCharges() : BigDecimal.ZERO;
        BigDecimal damage = request.getDamageCharges() != null ? request.getDamageCharges() : BigDecimal.ZERO;
        BigDecimal fuel = request.getFuelCharges() != null ? request.getFuelCharges() : BigDecimal.ZERO;
        BigDecimal other = request.getOtherCharges() != null ? request.getOtherCharges() : BigDecimal.ZERO;
        BigDecimal additional = fuel.add(other);

        // Update booking totals
        booking.setLateCharges(late);
        booking.setDamageCharges(damage);
        booking.setAdditionalCharges(additional);
        BigDecimal newFinalTotal = booking.getRentalSubtotal().add(late).add(damage).add(additional);
        booking.setFinalTotal(newFinalTotal);

        String oldStatus = booking.getStatus().name();
        booking.setStatus(BookingStatus.COMPLETED);
        booking = bookingRepository.save(booking);

        // Record return inspection
        RentalInspection inspection = new RentalInspection();
        inspection.setBooking(booking);
        inspection.setInspectionType(InspectionType.RETURN);
        inspection.setInspectionDatetime(LocalDateTime.now());
        inspection.setMileage(request.getReturnMileage());
        inspection.setFuelLevel(request.getFuelLevel());
        inspection.setDamageNotes(request.getDamageNotes());
        inspection.setChecklistJson(request.getChecklistJson());
        inspection.setLateCharges(late);
        inspection.setDamageCharges(damage);
        inspection.setFuelCharges(fuel);
        inspection.setOtherCharges(other);
        inspection.setTotalCharges(late.add(damage).add(fuel).add(other));
        inspection.setInspectedBy(staffUser);
        inspection.setCustomerAcknowledged(true);
        inspection = inspectionRepository.save(inspection);

        if (request.getImageUrls() != null) {
            for (String url : request.getImageUrls()) {
                InspectionImage img = new InspectionImage(inspection, url);
                imageRepository.save(img);
            }
        }

        // History
        BookingStatusHistory history = new BookingStatusHistory(
                booking, oldStatus, BookingStatus.COMPLETED.name(), staffUser, "Vehicle returned and inspected. Final Total: LKR " + newFinalTotal
        );
        historyRepository.save(history);

        auditLogService.log(staffUser, "VEHICLE_RETURN", "Booking", booking.getId().toString(), oldStatus, "COMPLETED", null);
        notificationService.createNotification(booking.getCustomer(), "Rental Completed",
                "Vehicle returned successfully. Total billed: LKR " + newFinalTotal + ". Thank you for choosing RideFlow!", "SUCCESS");

        return inspectionMapper.toDto(inspection);
    }

    public List<InspectionDto> getBookingInspections(Long bookingId) {
        return inspectionRepository.findByBookingId(bookingId).stream()
                .map(inspectionMapper::toDto)
                .collect(Collectors.toList());
    }
}

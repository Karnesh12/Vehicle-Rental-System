package com.rideflow.service;

import com.rideflow.dto.AvailabilityCheckRequest;
import com.rideflow.dto.AvailabilityResponse;
import com.rideflow.dto.VehicleDto;
import com.rideflow.entity.Vehicle;
import com.rideflow.enums.VehicleStatus;
import com.rideflow.exception.BadRequestException;
import com.rideflow.mapper.VehicleMapper;
import com.rideflow.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AvailabilityService {

    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;

    public AvailabilityService(VehicleRepository vehicleRepository, VehicleMapper vehicleMapper) {
        this.vehicleRepository = vehicleRepository;
        this.vehicleMapper = vehicleMapper;
    }

    public void validateBookingDates(LocalDate pickupDate, LocalDate returnDate) {
        if (pickupDate == null || returnDate == null) {
            throw new BadRequestException("Both pickup and return dates are required.");
        }
        LocalDate today = LocalDate.now();
        if (pickupDate.isBefore(today)) {
            throw new BadRequestException("Pickup date cannot be in the past.");
        }
        if (!returnDate.isAfter(pickupDate)) {
            throw new BadRequestException("Return date must be strictly after the pickup date.");
        }
    }

    public int calculateRentalDays(LocalDate pickupDate, LocalDate returnDate) {
        validateBookingDates(pickupDate, returnDate);
        long days = ChronoUnit.DAYS.between(pickupDate, returnDate);
        return (int) Math.max(days, 1);
    }

    public AvailabilityResponse checkVehicleAvailability(AvailabilityCheckRequest request) {
        validateBookingDates(request.getPickupDate(), request.getReturnDate());

        if (request.getVehicleId() == null) {
            throw new BadRequestException("Vehicle ID must be specified to check availability.");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new BadRequestException("Vehicle not found with ID: " + request.getVehicleId()));

        boolean isAvailable = true;
        String message = "Vehicle is available for selected dates.";

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            isAvailable = false;
            message = "Vehicle is currently " + vehicle.getStatus().name() + " and not available for hire.";
        } else {
            boolean hasOverlap = vehicleRepository.isVehicleBookedForDates(
                    vehicle.getId(), request.getPickupDate(), request.getReturnDate()
            );
            if (hasOverlap) {
                isAvailable = false;
                message = "Vehicle already has a pending, confirmed, or active booking during these dates.";
            }
        }

        int rentalDays = calculateRentalDays(request.getPickupDate(), request.getReturnDate());
        BigDecimal rentalSubtotal = vehicle.getDailyRate().multiply(BigDecimal.valueOf(rentalDays));

        AvailabilityResponse response = new AvailabilityResponse();
        response.setVehicle(vehicleMapper.toDto(vehicle));
        response.setIsAvailable(isAvailable);
        response.setRentalDays(rentalDays);
        response.setDailyRate(vehicle.getDailyRate());
        response.setRentalSubtotal(rentalSubtotal);
        response.setFinalTotal(rentalSubtotal);
        response.setMessage(message);

        return response;
    }

    public List<VehicleDto> searchAvailableVehicles(LocalDate pickupDate, LocalDate returnDate, Long categoryId) {
        validateBookingDates(pickupDate, returnDate);

        List<Vehicle> available = vehicleRepository.findAvailableVehiclesForDates(pickupDate, returnDate);

        if (categoryId != null) {
            available = available.stream()
                    .filter(v -> v.getCategory() != null && v.getCategory().getId().equals(categoryId))
                    .collect(Collectors.toList());
        }

        return available.stream().map(vehicleMapper::toDto).collect(Collectors.toList());
    }
}

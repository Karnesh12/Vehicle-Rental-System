package com.rideflow.controller;

import com.rideflow.dto.ApiResponse;
import com.rideflow.dto.AvailabilityCheckRequest;
import com.rideflow.dto.AvailabilityResponse;
import com.rideflow.dto.VehicleDto;
import com.rideflow.service.AvailabilityService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @PostMapping("/check")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> checkVehicleAvailability(
            @Valid @RequestBody AvailabilityCheckRequest request) {
        AvailabilityResponse response = availabilityService.checkVehicleAvailability(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/vehicles")
    public ResponseEntity<ApiResponse<List<VehicleDto>>> searchAvailableVehicles(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate pickupDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate returnDate,
            @RequestParam(required = false) Long categoryId) {
        List<VehicleDto> vehicles = availabilityService.searchAvailableVehicles(pickupDate, returnDate, categoryId);
        return ResponseEntity.ok(ApiResponse.ok(vehicles));
    }
}

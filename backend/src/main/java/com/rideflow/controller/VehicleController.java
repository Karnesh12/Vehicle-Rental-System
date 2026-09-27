package com.rideflow.controller;

import com.rideflow.dto.ApiResponse;
import com.rideflow.dto.VehicleCreateUpdateRequest;
import com.rideflow.dto.VehicleDto;
import com.rideflow.enums.FuelType;
import com.rideflow.enums.Transmission;
import com.rideflow.enums.VehicleStatus;
import com.rideflow.security.CustomUserDetails;
import com.rideflow.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VehicleDto>>> searchVehicles(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Transmission transmission,
            @RequestParam(required = false) FuelType fuelType,
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) VehicleStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate pickupDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate returnDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(defaultValue = "dailyRate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<VehicleDto> results = vehicleService.searchVehicles(
                categoryId, keyword, minPrice, maxPrice, transmission, fuelType, seats, status,
                pickupDate, returnDate, PageRequest.of(page, size, sort)
        );

        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleDto>> getVehicle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(vehicleService.getVehicleById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<VehicleDto>> createVehicle(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody VehicleCreateUpdateRequest request) {
        VehicleDto created = vehicleService.createVehicle(request, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Vehicle successfully added to fleet.", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<VehicleDto>> updateVehicle(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody VehicleCreateUpdateRequest request) {
        VehicleDto updated = vehicleService.updateVehicle(id, request, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Vehicle successfully updated.", updated));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<VehicleDto>> updateStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestParam VehicleStatus status) {
        VehicleDto updated = vehicleService.updateStatus(id, status, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Vehicle status updated to " + status, updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        vehicleService.deleteVehicle(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Vehicle successfully deactivated.", null));
    }

    @PostMapping("/{id}/images")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadVehicleImage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean isPrimary) {
        String url = vehicleService.uploadVehicleImage(id, file, isPrimary, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Image uploaded successfully.", Map.of("imageUrl", url)));
    }

    @PostMapping("/upload-image")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        String url = vehicleService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.ok("Image uploaded successfully.", Map.of("imageUrl", url)));
    }
}

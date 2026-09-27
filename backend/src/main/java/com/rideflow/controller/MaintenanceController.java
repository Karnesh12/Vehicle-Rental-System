package com.rideflow.controller;

import com.rideflow.dto.ApiResponse;
import com.rideflow.dto.MaintenanceRecordDto;
import com.rideflow.dto.MaintenanceRecordRequest;
import com.rideflow.enums.MaintenanceStatus;
import com.rideflow.security.CustomUserDetails;
import com.rideflow.service.MaintenanceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<MaintenanceRecordDto>> createMaintenance(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody MaintenanceRecordRequest request) {
        MaintenanceRecordDto dto = maintenanceService.createMaintenance(request, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Maintenance record scheduled.", dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<MaintenanceRecordDto>> updateStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestParam MaintenanceStatus status) {
        MaintenanceRecordDto dto = maintenanceService.updateStatus(id, status, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Maintenance status updated.", dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Page<MaintenanceRecordDto>>> getAllMaintenance(
            @RequestParam(required = false) MaintenanceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<MaintenanceRecordDto> records = maintenanceService.getAllMaintenance(status, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startDate")));
        return ResponseEntity.ok(ApiResponse.ok(records));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<ApiResponse<List<MaintenanceRecordDto>>> getVehicleMaintenance(@PathVariable Long vehicleId) {
        List<MaintenanceRecordDto> records = maintenanceService.getVehicleMaintenance(vehicleId);
        return ResponseEntity.ok(ApiResponse.ok(records));
    }
}

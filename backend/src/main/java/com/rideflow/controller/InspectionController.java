package com.rideflow.controller;

import com.rideflow.dto.ApiResponse;
import com.rideflow.dto.HandoverInspectionRequest;
import com.rideflow.dto.InspectionDto;
import com.rideflow.dto.ReturnInspectionRequest;
import com.rideflow.security.CustomUserDetails;
import com.rideflow.service.InspectionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inspections")
public class InspectionController {

    private final InspectionService inspectionService;

    public InspectionController(InspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @PostMapping("/handover")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<InspectionDto>> performHandover(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody HandoverInspectionRequest request) {
        InspectionDto inspection = inspectionService.performHandover(request, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Vehicle handover recorded and rental activated.", inspection));
    }

    @PostMapping("/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<InspectionDto>> performReturn(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ReturnInspectionRequest request) {
        InspectionDto inspection = inspectionService.performReturn(request, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Vehicle return inspection completed and rental closed.", inspection));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<List<InspectionDto>>> getBookingInspections(@PathVariable Long bookingId) {
        List<InspectionDto> list = inspectionService.getBookingInspections(bookingId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}

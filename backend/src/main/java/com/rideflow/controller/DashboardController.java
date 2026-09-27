package com.rideflow.controller;

import com.rideflow.dto.ApiResponse;
import com.rideflow.dto.DashboardMetricsDto;
import com.rideflow.security.CustomUserDetails;
import com.rideflow.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping({"/reports/admin", "/dashboards/admin"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardMetricsDto>> getAdminDashboard() {
        DashboardMetricsDto metrics = dashboardService.getAdminMetrics();
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }

    @GetMapping("/dashboards/staff")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<DashboardMetricsDto>> getStaffDashboard() {
        DashboardMetricsDto metrics = dashboardService.getStaffMetrics();
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }

    @GetMapping("/dashboards/customer")
    public ResponseEntity<ApiResponse<DashboardMetricsDto>> getCustomerDashboard(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DashboardMetricsDto metrics = dashboardService.getCustomerMetrics(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }
}

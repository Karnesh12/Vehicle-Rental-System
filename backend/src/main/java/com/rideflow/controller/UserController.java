package com.rideflow.controller;

import com.rideflow.dto.ApiResponse;
import com.rideflow.dto.CustomerProfileDto;
import com.rideflow.dto.RegisterRequest;
import com.rideflow.dto.UpdateProfileRequest;
import com.rideflow.entity.User;
import com.rideflow.security.CustomUserDetails;
import com.rideflow.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Customer profile endpoints
    @GetMapping("/customers/profile")
    public ResponseEntity<ApiResponse<CustomerProfileDto>> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        CustomerProfileDto profile = userService.getCustomerProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PutMapping("/customers/profile")
    public ResponseEntity<ApiResponse<CustomerProfileDto>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        CustomerProfileDto updated = userService.updateProfile(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully.", updated));
    }

    @PostMapping("/customers/licence")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadLicence(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        String url = userService.uploadLicenceImage(userDetails.getId(), file);
        return ResponseEntity.ok(ApiResponse.ok("Licence image uploaded successfully.", Map.of("licenceImageUrl", url)));
    }

    // Admin user management endpoints
    @GetMapping("/admin/customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<User>>> getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<User> customers = userService.getCustomers(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok(customers));
    }

    @GetMapping("/admin/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<User>>> getStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<User> staff = userService.getStaff(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok(staff));
    }

    @PostMapping("/admin/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> createStaff(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @Valid @RequestBody RegisterRequest request) {
        User staff = userService.createStaff(request, adminDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Staff account created successfully.", staff));
    }

    @PatchMapping("/admin/users/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> toggleUserStatus(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @PathVariable Long userId) {
        User updated = userService.toggleUserStatus(userId, adminDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("User status changed.", updated));
    }
}

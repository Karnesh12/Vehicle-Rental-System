package com.rideflow.controller;

import com.rideflow.dto.ApiResponse;
import com.rideflow.dto.BookingApprovalRequest;
import com.rideflow.dto.BookingCreateRequest;
import com.rideflow.dto.BookingDto;
import com.rideflow.enums.BookingStatus;
import com.rideflow.security.CustomUserDetails;
import com.rideflow.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingDto>> createBooking(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BookingCreateRequest request) {
        BookingDto booking = bookingService.createBooking(request, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Booking placed successfully. Awaiting verification.", booking));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingDto>>> getMyBookings(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<BookingDto> list = bookingService.getCustomerBookingsList(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Page<BookingDto>>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<BookingDto> paged = bookingService.getAllBookings(status, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok(paged));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingDto>> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getBookingById(id)));
    }

    @GetMapping("/ref/{ref}")
    public ResponseEntity<ApiResponse<BookingDto>> getBookingByRef(@PathVariable String ref) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getBookingByReference(ref)));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<BookingDto>> reviewBooking(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody BookingApprovalRequest request) {
        BookingDto reviewed = bookingService.reviewBooking(id, request, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Booking " + (request.getApproved() ? "Confirmed" : "Rejected"), reviewed));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingDto>> cancelBooking(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Cancelled by user";
        BookingDto cancelled = bookingService.cancelBooking(id, reason, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Booking successfully cancelled.", cancelled));
    }
}

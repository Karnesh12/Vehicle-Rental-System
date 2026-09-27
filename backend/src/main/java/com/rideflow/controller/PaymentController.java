package com.rideflow.controller;

import com.rideflow.dto.ApiResponse;
import com.rideflow.dto.PaymentDto;
import com.rideflow.dto.PaymentRecordRequest;
import com.rideflow.security.CustomUserDetails;
import com.rideflow.service.PaymentService;
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
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PaymentDto>> recordPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PaymentRecordRequest request) {
        PaymentDto payment = paymentService.recordPayment(request, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Payment recorded successfully.", payment));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getBookingPayments(@PathVariable Long bookingId) {
        List<PaymentDto> payments = paymentService.getBookingPayments(bookingId);
        return ResponseEntity.ok(ApiResponse.ok(payments));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Page<PaymentDto>>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PaymentDto> payments = paymentService.getAllPayments(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "paymentDate")));
        return ResponseEntity.ok(ApiResponse.ok(payments));
    }
}

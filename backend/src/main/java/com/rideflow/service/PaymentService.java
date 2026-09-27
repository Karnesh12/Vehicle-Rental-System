package com.rideflow.service;

import com.rideflow.dto.PaymentDto;
import com.rideflow.dto.PaymentRecordRequest;
import com.rideflow.entity.Booking;
import com.rideflow.entity.Payment;
import com.rideflow.entity.User;
import com.rideflow.exception.ResourceNotFoundException;
import com.rideflow.mapper.PaymentMapper;
import com.rideflow.repository.BookingRepository;
import com.rideflow.repository.PaymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentMapper paymentMapper;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public PaymentService(PaymentRepository paymentRepository,
                          BookingRepository bookingRepository,
                          PaymentMapper paymentMapper,
                          AuditLogService auditLogService,
                          NotificationService notificationService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.paymentMapper = paymentMapper;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    @Transactional
    public PaymentDto recordPayment(PaymentRecordRequest request, User staffUser) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + request.getBookingId()));

        Payment payment = new Payment(
                booking,
                request.getPaymentMethod(),
                request.getAmount(),
                request.getPaymentStatus(),
                request.getReferenceNumber(),
                staffUser,
                request.getNotes()
        );
        payment = paymentRepository.save(payment);

        // Update booking's overall payment status
        booking.setPaymentStatus(request.getPaymentStatus());
        booking.setPaymentMethod(request.getPaymentMethod());
        bookingRepository.save(booking);

        auditLogService.log(staffUser, "RECORD_PAYMENT", "Payment", payment.getId().toString(), null,
                "Amount: LKR " + payment.getAmount() + " (" + payment.getPaymentStatus() + ")", null);

        notificationService.createNotification(booking.getCustomer(), "Payment Recorded",
                "A payment of LKR " + payment.getAmount() + " has been recorded for booking " + booking.getBookingReference() + ". Status: " + payment.getPaymentStatus(),
                "INFO");

        return paymentMapper.toDto(payment);
    }

    public List<PaymentDto> getBookingPayments(Long bookingId) {
        return paymentRepository.findByBookingIdOrderByPaymentDateDesc(bookingId).stream()
                .map(paymentMapper::toDto)
                .collect(Collectors.toList());
    }

    public Page<PaymentDto> getAllPayments(Pageable pageable) {
        return paymentRepository.findAllByOrderByPaymentDateDesc(pageable).map(paymentMapper::toDto);
    }
}

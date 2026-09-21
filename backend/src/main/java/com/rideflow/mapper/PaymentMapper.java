package com.rideflow.mapper;

import com.rideflow.dto.PaymentDto;
import com.rideflow.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentDto toDto(Payment payment) {
        if (payment == null) return null;

        PaymentDto dto = new PaymentDto();
        dto.setId(payment.getId());
        if (payment.getBooking() != null) {
            dto.setBookingId(payment.getBooking().getId());
            dto.setBookingReference(payment.getBooking().getBookingReference());
        }
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setAmount(payment.getAmount());
        dto.setPaymentStatus(payment.getPaymentStatus());
        dto.setReferenceNumber(payment.getReferenceNumber());
        dto.setPaymentDate(payment.getPaymentDate());
        if (payment.getRecordedBy() != null) {
            dto.setRecordedByUserId(payment.getRecordedBy().getId());
            dto.setRecordedByUserName(payment.getRecordedBy().getFullName());
        }
        dto.setNotes(payment.getNotes());

        return dto;
    }
}

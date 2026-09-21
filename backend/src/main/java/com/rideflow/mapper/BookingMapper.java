package com.rideflow.mapper;

import com.rideflow.dto.BookingDto;
import com.rideflow.entity.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingDto toDto(Booking booking) {
        if (booking == null) return null;

        BookingDto dto = new BookingDto();
        dto.setId(booking.getId());
        dto.setBookingReference(booking.getBookingReference());

        if (booking.getCustomer() != null) {
            dto.setCustomerId(booking.getCustomer().getId());
            dto.setCustomerName(booking.getCustomer().getFullName());
            dto.setCustomerEmail(booking.getCustomer().getEmail());
            dto.setCustomerPhone(booking.getCustomer().getPhoneNumber());
        }

        if (booking.getVehicle() != null) {
            dto.setVehicleId(booking.getVehicle().getId());
            dto.setVehicleRegistration(booking.getVehicle().getRegistrationNumber());
            dto.setVehicleMake(booking.getVehicle().getMake());
            dto.setVehicleModel(booking.getVehicle().getModel());
            if (booking.getVehicle().getCategory() != null) {
                dto.setVehicleCategoryName(booking.getVehicle().getCategory().getName());
            }
            dto.setVehiclePrimaryImage(booking.getVehicle().getPrimaryImageUrl());
        }

        dto.setPickupDate(booking.getPickupDate());
        dto.setReturnDate(booking.getReturnDate());
        dto.setRentalDays(booking.getRentalDays());
        dto.setDailyRate(booking.getDailyRate());
        dto.setRentalSubtotal(booking.getRentalSubtotal());
        dto.setLateCharges(booking.getLateCharges());
        dto.setDamageCharges(booking.getDamageCharges());
        dto.setAdditionalCharges(booking.getAdditionalCharges());
        dto.setFinalTotal(booking.getFinalTotal());
        dto.setStatus(booking.getStatus());
        dto.setPaymentMethod(booking.getPaymentMethod());
        dto.setPaymentStatus(booking.getPaymentStatus());
        dto.setNotes(booking.getNotes());
        dto.setRejectionReason(booking.getRejectionReason());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());

        return dto;
    }
}

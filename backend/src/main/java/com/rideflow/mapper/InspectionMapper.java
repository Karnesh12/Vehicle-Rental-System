package com.rideflow.mapper;

import com.rideflow.dto.InspectionDto;
import com.rideflow.entity.InspectionImage;
import com.rideflow.entity.RentalInspection;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class InspectionMapper {

    public InspectionDto toDto(RentalInspection inspection) {
        if (inspection == null) return null;

        InspectionDto dto = new InspectionDto();
        dto.setId(inspection.getId());
        if (inspection.getBooking() != null) {
            dto.setBookingId(inspection.getBooking().getId());
            dto.setBookingReference(inspection.getBooking().getBookingReference());
        }
        dto.setInspectionType(inspection.getInspectionType());
        dto.setInspectionDatetime(inspection.getInspectionDatetime());
        dto.setMileage(inspection.getMileage());
        dto.setFuelLevel(inspection.getFuelLevel());
        dto.setDamageNotes(inspection.getDamageNotes());
        dto.setChecklistJson(inspection.getChecklistJson());
        dto.setLateCharges(inspection.getLateCharges());
        dto.setDamageCharges(inspection.getDamageCharges());
        dto.setFuelCharges(inspection.getFuelCharges());
        dto.setOtherCharges(inspection.getOtherCharges());
        dto.setTotalCharges(inspection.getTotalCharges());

        if (inspection.getInspectedBy() != null) {
            dto.setInspectedByUserId(inspection.getInspectedBy().getId());
            dto.setInspectedByUserName(inspection.getInspectedBy().getFullName());
        }

        dto.setCustomerAcknowledged(inspection.getCustomerAcknowledged());

        if (inspection.getImages() != null) {
            dto.setImageUrls(inspection.getImages().stream()
                    .map(InspectionImage::getImageUrl)
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}

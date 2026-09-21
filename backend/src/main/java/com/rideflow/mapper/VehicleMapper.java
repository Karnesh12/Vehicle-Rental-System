package com.rideflow.mapper;

import com.rideflow.dto.VehicleDto;
import com.rideflow.entity.Vehicle;
import com.rideflow.entity.VehicleImage;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class VehicleMapper {

    public VehicleDto toDto(Vehicle vehicle) {
        if (vehicle == null) return null;

        VehicleDto dto = new VehicleDto();
        dto.setId(vehicle.getId());
        if (vehicle.getCategory() != null) {
            dto.setCategoryId(vehicle.getCategory().getId());
            dto.setCategoryName(vehicle.getCategory().getName());
        }
        dto.setRegistrationNumber(vehicle.getRegistrationNumber());
        dto.setMake(vehicle.getMake());
        dto.setModel(vehicle.getModel());
        dto.setYear(vehicle.getYear());
        dto.setColour(vehicle.getColour());
        dto.setSeats(vehicle.getSeats());
        dto.setTransmission(vehicle.getTransmission());
        dto.setFuelType(vehicle.getFuelType());
        dto.setDailyRate(vehicle.getDailyRate());
        dto.setCurrentMileage(vehicle.getCurrentMileage());
        dto.setStatus(vehicle.getStatus());
        dto.setDescription(vehicle.getDescription());
        dto.setPrimaryImageUrl(vehicle.getPrimaryImageUrl());

        if (vehicle.getImages() != null && org.hibernate.Hibernate.isInitialized(vehicle.getImages())) {
            dto.setAdditionalImages(vehicle.getImages().stream()
                    .map(VehicleImage::getImageUrl)
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}

package com.rideflow.mapper;

import com.rideflow.dto.MaintenanceRecordDto;
import com.rideflow.entity.MaintenanceRecord;
import org.springframework.stereotype.Component;

@Component
public class MaintenanceMapper {

    public MaintenanceRecordDto toDto(MaintenanceRecord record) {
        if (record == null) return null;

        MaintenanceRecordDto dto = new MaintenanceRecordDto();
        dto.setId(record.getId());
        if (record.getVehicle() != null) {
            dto.setVehicleId(record.getVehicle().getId());
            dto.setVehicleRegistration(record.getVehicle().getRegistrationNumber());
            dto.setVehicleMake(record.getVehicle().getMake());
            dto.setVehicleModel(record.getVehicle().getModel());
        }
        dto.setMaintenanceType(record.getMaintenanceType());
        dto.setStartDate(record.getStartDate());
        dto.setExpectedCompletionDate(record.getExpectedCompletionDate());
        dto.setActualCompletionDate(record.getActualCompletionDate());
        dto.setCost(record.getCost());
        dto.setServiceProvider(record.getServiceProvider());
        dto.setNotes(record.getNotes());
        dto.setStatus(record.getStatus());
        dto.setCreatedAt(record.getCreatedAt());

        return dto;
    }
}

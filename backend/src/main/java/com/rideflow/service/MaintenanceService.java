package com.rideflow.service;

import com.rideflow.dto.MaintenanceRecordDto;
import com.rideflow.dto.MaintenanceRecordRequest;
import com.rideflow.entity.MaintenanceRecord;
import com.rideflow.entity.User;
import com.rideflow.entity.Vehicle;
import com.rideflow.enums.MaintenanceStatus;
import com.rideflow.enums.VehicleStatus;
import com.rideflow.exception.ResourceNotFoundException;
import com.rideflow.mapper.MaintenanceMapper;
import com.rideflow.repository.MaintenanceRecordRepository;
import com.rideflow.repository.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaintenanceService {

    private final MaintenanceRecordRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;
    private final MaintenanceMapper maintenanceMapper;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public MaintenanceService(MaintenanceRecordRepository maintenanceRepository,
                              VehicleRepository vehicleRepository,
                              MaintenanceMapper maintenanceMapper,
                              AuditLogService auditLogService,
                              NotificationService notificationService) {
        this.maintenanceRepository = maintenanceRepository;
        this.vehicleRepository = vehicleRepository;
        this.maintenanceMapper = maintenanceMapper;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    @Transactional
    public MaintenanceRecordDto createMaintenance(MaintenanceRecordRequest request, User staffUser) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + request.getVehicleId()));

        MaintenanceRecord record = new MaintenanceRecord();
        record.setVehicle(vehicle);
        record.setMaintenanceType(request.getMaintenanceType());
        record.setStartDate(request.getStartDate());
        record.setExpectedCompletionDate(request.getExpectedCompletionDate());
        record.setActualCompletionDate(request.getActualCompletionDate());
        record.setCost(request.getCost());
        record.setServiceProvider(request.getServiceProvider());
        record.setNotes(request.getNotes());
        record.setStatus(request.getStatus() != null ? request.getStatus() : MaintenanceStatus.SCHEDULED);

        // If in progress immediately, set vehicle to MAINTENANCE
        if (record.getStatus() == MaintenanceStatus.IN_PROGRESS) {
            vehicle.setStatus(VehicleStatus.MAINTENANCE);
            vehicleRepository.save(vehicle);
        }

        record = maintenanceRepository.save(record);

        auditLogService.log(staffUser, "SCHEDULE_MAINTENANCE", "MaintenanceRecord", record.getId().toString(), null,
                vehicle.getRegistrationNumber() + " - " + record.getMaintenanceType(), null);

        notificationService.notifyStaffAndAdmin("Vehicle Maintenance Scheduled",
                "Maintenance for " + vehicle.getRegistrationNumber() + " scheduled on " + record.getStartDate(), "MAINTENANCE");

        return maintenanceMapper.toDto(record);
    }

    @Transactional
    public MaintenanceRecordDto updateStatus(Long id, MaintenanceStatus newStatus, User staffUser) {
        MaintenanceRecord record = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found with ID: " + id));

        MaintenanceStatus oldStatus = record.getStatus();
        record.setStatus(newStatus);
        Vehicle vehicle = record.getVehicle();

        if (newStatus == MaintenanceStatus.IN_PROGRESS) {
            vehicle.setStatus(VehicleStatus.MAINTENANCE);
            vehicleRepository.save(vehicle);
        } else if (newStatus == MaintenanceStatus.COMPLETED || newStatus == MaintenanceStatus.CANCELLED) {
            if (record.getActualCompletionDate() == null && newStatus == MaintenanceStatus.COMPLETED) {
                record.setActualCompletionDate(LocalDate.now());
            }
            if (vehicle.getStatus() == VehicleStatus.MAINTENANCE) {
                vehicle.setStatus(VehicleStatus.AVAILABLE);
                vehicleRepository.save(vehicle);
            }
        }

        record = maintenanceRepository.save(record);

        auditLogService.log(staffUser, "UPDATE_MAINTENANCE_STATUS", "MaintenanceRecord", id.toString(),
                oldStatus.name(), newStatus.name(), null);

        return maintenanceMapper.toDto(record);
    }

    public Page<MaintenanceRecordDto> getAllMaintenance(MaintenanceStatus status, Pageable pageable) {
        if (status != null) {
            return maintenanceRepository.findByStatus(status, pageable).map(maintenanceMapper::toDto);
        }
        return maintenanceRepository.findAllByOrderByStartDateDesc(pageable).map(maintenanceMapper::toDto);
    }

    public List<MaintenanceRecordDto> getVehicleMaintenance(Long vehicleId) {
        return maintenanceRepository.findByVehicleIdOrderByStartDateDesc(vehicleId).stream()
                .map(maintenanceMapper::toDto)
                .collect(Collectors.toList());
    }
}

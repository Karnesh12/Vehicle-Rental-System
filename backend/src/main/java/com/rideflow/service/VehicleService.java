package com.rideflow.service;

import com.rideflow.dto.VehicleCreateUpdateRequest;
import com.rideflow.dto.VehicleDto;
import com.rideflow.entity.Vehicle;
import com.rideflow.entity.VehicleCategory;
import com.rideflow.entity.VehicleImage;
import com.rideflow.entity.User;
import com.rideflow.enums.FuelType;
import com.rideflow.enums.Transmission;
import com.rideflow.enums.VehicleStatus;
import com.rideflow.exception.ConflictException;
import com.rideflow.exception.ResourceNotFoundException;
import com.rideflow.mapper.VehicleMapper;
import com.rideflow.repository.VehicleCategoryRepository;
import com.rideflow.repository.VehicleImageRepository;
import com.rideflow.repository.VehicleRepository;
import com.rideflow.specification.VehicleSpecification;
import com.rideflow.util.FileStorageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleCategoryRepository categoryRepository;
    private final VehicleImageRepository vehicleImageRepository;
    private final VehicleMapper vehicleMapper;
    private final FileStorageService fileStorageService;
    private final AuditLogService auditLogService;

    public VehicleService(VehicleRepository vehicleRepository,
                          VehicleCategoryRepository categoryRepository,
                          VehicleImageRepository vehicleImageRepository,
                          VehicleMapper vehicleMapper,
                          FileStorageService fileStorageService,
                          AuditLogService auditLogService) {
        this.vehicleRepository = vehicleRepository;
        this.categoryRepository = categoryRepository;
        this.vehicleImageRepository = vehicleImageRepository;
        this.vehicleMapper = vehicleMapper;
        this.fileStorageService = fileStorageService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<VehicleDto> searchVehicles(
            Long categoryId,
            String keyword,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Transmission transmission,
            FuelType fuelType,
            Integer seats,
            VehicleStatus status,
            LocalDate pickupDate,
            LocalDate returnDate,
            Pageable pageable) {

        Specification<Vehicle> spec = VehicleSpecification.filterVehicles(
                categoryId, keyword, minPrice, maxPrice, transmission, fuelType, seats, status, pickupDate, returnDate
        );

        return vehicleRepository.findAll(spec, pageable).map(vehicleMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<VehicleDto> getAllVehiclesList() {
        return vehicleRepository.findAll().stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Vehicle getVehicleEntity(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public VehicleDto getVehicleById(Long id) {
        return vehicleMapper.toDto(getVehicleEntity(id));
    }

    @Transactional
    public VehicleDto createVehicle(VehicleCreateUpdateRequest request, User user) {
        if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new ConflictException("Vehicle with registration number " + request.getRegistrationNumber() + " already exists.");
        }

        VehicleCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        Vehicle vehicle = new Vehicle();
        vehicle.setCategory(category);
        vehicle.setRegistrationNumber(request.getRegistrationNumber().trim().toUpperCase());
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setColour(request.getColour());
        vehicle.setSeats(request.getSeats());
        vehicle.setTransmission(request.getTransmission());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setDailyRate(request.getDailyRate());
        vehicle.setCurrentMileage(request.getCurrentMileage() != null ? request.getCurrentMileage() : 0);
        vehicle.setStatus(request.getStatus() != null ? request.getStatus() : VehicleStatus.AVAILABLE);
        vehicle.setDescription(request.getDescription());
        vehicle.setPrimaryImageUrl(request.getPrimaryImageUrl());

        vehicle = vehicleRepository.save(vehicle);

        if (request.getAdditionalImageUrls() != null) {
            for (String url : request.getAdditionalImageUrls()) {
                VehicleImage img = new VehicleImage(vehicle, url, false);
                vehicleImageRepository.save(img);
            }
        }

        auditLogService.log(user, "CREATE_VEHICLE", "Vehicle", vehicle.getId().toString(), null, vehicle.getRegistrationNumber(), null);

        return vehicleMapper.toDto(vehicle);
    }

    @Transactional
    public VehicleDto updateVehicle(Long id, VehicleCreateUpdateRequest request, User user) {
        Vehicle vehicle = getVehicleEntity(id);

        if (vehicleRepository.existsByRegistrationNumberAndIdNot(request.getRegistrationNumber(), id)) {
            throw new ConflictException("Vehicle with registration number " + request.getRegistrationNumber() + " already exists.");
        }

        VehicleCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        vehicle.setCategory(category);
        vehicle.setRegistrationNumber(request.getRegistrationNumber().trim().toUpperCase());
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setColour(request.getColour());
        vehicle.setSeats(request.getSeats());
        vehicle.setTransmission(request.getTransmission());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setDailyRate(request.getDailyRate());
        if (request.getCurrentMileage() != null) vehicle.setCurrentMileage(request.getCurrentMileage());
        if (request.getStatus() != null) vehicle.setStatus(request.getStatus());
        vehicle.setDescription(request.getDescription());
        if (request.getPrimaryImageUrl() != null && !request.getPrimaryImageUrl().isEmpty()) {
            vehicle.setPrimaryImageUrl(request.getPrimaryImageUrl());
        }

        vehicle = vehicleRepository.save(vehicle);

        auditLogService.log(user, "UPDATE_VEHICLE", "Vehicle", id.toString(), null, vehicle.getRegistrationNumber(), null);

        return vehicleMapper.toDto(vehicle);
    }

    @Transactional
    public VehicleDto updateStatus(Long id, VehicleStatus status, User user) {
        Vehicle vehicle = getVehicleEntity(id);
        String old = vehicle.getStatus().name();
        vehicle.setStatus(status);
        vehicle = vehicleRepository.save(vehicle);

        auditLogService.log(user, "UPDATE_VEHICLE_STATUS", "Vehicle", id.toString(), old, status.name(), null);

        return vehicleMapper.toDto(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long id, User user) {
        Vehicle vehicle = getVehicleEntity(id);
        // Soft deactivate to avoid breaking existing bookings
        vehicle.setStatus(VehicleStatus.INACTIVE);
        vehicleRepository.save(vehicle);

        auditLogService.log(user, "DEACTIVATE_VEHICLE", "Vehicle", id.toString(), "ACTIVE", "INACTIVE", null);
    }

    @Transactional
    public String uploadVehicleImage(Long vehicleId, MultipartFile file, boolean isPrimary, User user) {
        Vehicle vehicle = getVehicleEntity(vehicleId);
        String imageUrl = fileStorageService.storeFile(file);

        if (isPrimary || vehicle.getPrimaryImageUrl() == null) {
            vehicle.setPrimaryImageUrl(imageUrl);
            vehicleRepository.save(vehicle);
        }

        VehicleImage img = new VehicleImage(vehicle, imageUrl, isPrimary);
        vehicleImageRepository.save(img);

        auditLogService.log(user, "UPLOAD_VEHICLE_IMAGE", "Vehicle", vehicleId.toString(), null, imageUrl, null);

        return imageUrl;
    }

    public String uploadImage(MultipartFile file) {
        return fileStorageService.storeFile(file);
    }
}

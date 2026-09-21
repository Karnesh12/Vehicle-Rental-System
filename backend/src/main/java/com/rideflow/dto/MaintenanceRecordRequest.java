package com.rideflow.dto;

import com.rideflow.enums.MaintenanceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;

public class MaintenanceRecordRequest {
    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotBlank(message = "Maintenance type is required")
    private String maintenanceType;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Expected completion date is required")
    private LocalDate expectedCompletionDate;

    private LocalDate actualCompletionDate;

    @PositiveOrZero(message = "Cost cannot be negative")
    private BigDecimal cost = BigDecimal.ZERO;

    @NotBlank(message = "Service provider is required")
    private String serviceProvider;

    private String notes;
    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;

    public MaintenanceRecordRequest() {}

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public String getMaintenanceType() { return maintenanceType; }
    public void setMaintenanceType(String maintenanceType) { this.maintenanceType = maintenanceType; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getExpectedCompletionDate() { return expectedCompletionDate; }
    public void setExpectedCompletionDate(LocalDate expectedCompletionDate) { this.expectedCompletionDate = expectedCompletionDate; }

    public LocalDate getActualCompletionDate() { return actualCompletionDate; }
    public void setActualCompletionDate(LocalDate actualCompletionDate) { this.actualCompletionDate = actualCompletionDate; }

    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }

    public String getServiceProvider() { return serviceProvider; }
    public void setServiceProvider(String serviceProvider) { this.serviceProvider = serviceProvider; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public MaintenanceStatus getStatus() { return status; }
    public void setStatus(MaintenanceStatus status) { this.status = status; }
}

package com.rideflow.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AvailabilityCheckRequest {
    @NotNull(message = "Pickup date is required")
    private LocalDate pickupDate;

    @NotNull(message = "Return date is required")
    private LocalDate returnDate;

    private Long categoryId;
    private Long vehicleId;

    public AvailabilityCheckRequest() {}

    public AvailabilityCheckRequest(LocalDate pickupDate, LocalDate returnDate, Long categoryId, Long vehicleId) {
        this.pickupDate = pickupDate;
        this.returnDate = returnDate;
        this.categoryId = categoryId;
        this.vehicleId = vehicleId;
    }

    public LocalDate getPickupDate() { return pickupDate; }
    public void setPickupDate(LocalDate pickupDate) { this.pickupDate = pickupDate; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
}

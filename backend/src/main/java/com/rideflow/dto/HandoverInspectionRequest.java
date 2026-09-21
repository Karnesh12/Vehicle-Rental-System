package com.rideflow.dto;

import com.rideflow.enums.FuelLevel;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;

public class HandoverInspectionRequest {
    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "Mileage is required")
    @PositiveOrZero(message = "Mileage cannot be negative")
    private Integer mileage;

    @NotNull(message = "Fuel level is required")
    private FuelLevel fuelLevel;

    private String damageNotes;
    private String checklistJson;
    private Boolean customerAcknowledged = true;
    private List<String> imageUrls;

    public HandoverInspectionRequest() {}

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Integer getMileage() { return mileage; }
    public void setMileage(Integer mileage) { this.mileage = mileage; }

    public FuelLevel getFuelLevel() { return fuelLevel; }
    public void setFuelLevel(FuelLevel fuelLevel) { this.fuelLevel = fuelLevel; }

    public String getDamageNotes() { return damageNotes; }
    public void setDamageNotes(String damageNotes) { this.damageNotes = damageNotes; }

    public String getChecklistJson() { return checklistJson; }
    public void setChecklistJson(String checklistJson) { this.checklistJson = checklistJson; }

    public Boolean getCustomerAcknowledged() { return customerAcknowledged; }
    public void setCustomerAcknowledged(Boolean customerAcknowledged) { this.customerAcknowledged = customerAcknowledged; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
}

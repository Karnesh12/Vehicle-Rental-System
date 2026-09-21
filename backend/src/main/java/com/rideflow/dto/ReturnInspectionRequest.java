package com.rideflow.dto;

import com.rideflow.enums.FuelLevel;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;

public class ReturnInspectionRequest {
    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "Return mileage is required")
    @PositiveOrZero(message = "Return mileage cannot be negative")
    private Integer returnMileage;

    @NotNull(message = "Fuel level is required")
    private FuelLevel fuelLevel;

    private String damageNotes;
    private String checklistJson;

    private BigDecimal lateCharges = BigDecimal.ZERO;
    private BigDecimal damageCharges = BigDecimal.ZERO;
    private BigDecimal fuelCharges = BigDecimal.ZERO;
    private BigDecimal otherCharges = BigDecimal.ZERO;

    private List<String> imageUrls;

    public ReturnInspectionRequest() {}

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Integer getReturnMileage() { return returnMileage; }
    public void setReturnMileage(Integer returnMileage) { this.returnMileage = returnMileage; }

    public FuelLevel getFuelLevel() { return fuelLevel; }
    public void setFuelLevel(FuelLevel fuelLevel) { this.fuelLevel = fuelLevel; }

    public String getDamageNotes() { return damageNotes; }
    public void setDamageNotes(String damageNotes) { this.damageNotes = damageNotes; }

    public String getChecklistJson() { return checklistJson; }
    public void setChecklistJson(String checklistJson) { this.checklistJson = checklistJson; }

    public BigDecimal getLateCharges() { return lateCharges; }
    public void setLateCharges(BigDecimal lateCharges) { this.lateCharges = lateCharges; }

    public BigDecimal getDamageCharges() { return damageCharges; }
    public void setDamageCharges(BigDecimal damageCharges) { this.damageCharges = damageCharges; }

    public BigDecimal getFuelCharges() { return fuelCharges; }
    public void setFuelCharges(BigDecimal fuelCharges) { this.fuelCharges = fuelCharges; }

    public BigDecimal getOtherCharges() { return otherCharges; }
    public void setOtherCharges(BigDecimal otherCharges) { this.otherCharges = otherCharges; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
}

package com.rideflow.dto;

import java.math.BigDecimal;

public class AvailabilityResponse {
    private VehicleDto vehicle;
    private Boolean isAvailable;
    private Integer rentalDays;
    private BigDecimal dailyRate;
    private BigDecimal rentalSubtotal;
    private BigDecimal finalTotal;
    private String message;

    public AvailabilityResponse() {}

    public VehicleDto getVehicle() { return vehicle; }
    public void setVehicle(VehicleDto vehicle) { this.vehicle = vehicle; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public Integer getRentalDays() { return rentalDays; }
    public void setRentalDays(Integer rentalDays) { this.rentalDays = rentalDays; }

    public BigDecimal getDailyRate() { return dailyRate; }
    public void setDailyRate(BigDecimal dailyRate) { this.dailyRate = dailyRate; }

    public BigDecimal getRentalSubtotal() { return rentalSubtotal; }
    public void setRentalSubtotal(BigDecimal rentalSubtotal) { this.rentalSubtotal = rentalSubtotal; }

    public BigDecimal getFinalTotal() { return finalTotal; }
    public void setFinalTotal(BigDecimal finalTotal) { this.finalTotal = finalTotal; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

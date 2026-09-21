package com.rideflow.dto;

import com.rideflow.enums.FuelLevel;
import com.rideflow.enums.InspectionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class InspectionDto {
    private Long id;
    private Long bookingId;
    private String bookingReference;
    private InspectionType inspectionType;
    private LocalDateTime inspectionDatetime;
    private Integer mileage;
    private FuelLevel fuelLevel;
    private String damageNotes;
    private String checklistJson;
    private BigDecimal lateCharges;
    private BigDecimal damageCharges;
    private BigDecimal fuelCharges;
    private BigDecimal otherCharges;
    private BigDecimal totalCharges;
    private Long inspectedByUserId;
    private String inspectedByUserName;
    private Boolean customerAcknowledged;
    private List<String> imageUrls = new ArrayList<>();

    public InspectionDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }

    public InspectionType getInspectionType() { return inspectionType; }
    public void setInspectionType(InspectionType inspectionType) { this.inspectionType = inspectionType; }

    public LocalDateTime getInspectionDatetime() { return inspectionDatetime; }
    public void setInspectionDatetime(LocalDateTime inspectionDatetime) { this.inspectionDatetime = inspectionDatetime; }

    public Integer getMileage() { return mileage; }
    public void setMileage(Integer mileage) { this.mileage = mileage; }

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

    public BigDecimal getTotalCharges() { return totalCharges; }
    public void setTotalCharges(BigDecimal totalCharges) { this.totalCharges = totalCharges; }

    public Long getInspectedByUserId() { return inspectedByUserId; }
    public void setInspectedByUserId(Long inspectedByUserId) { this.inspectedByUserId = inspectedByUserId; }

    public String getInspectedByUserName() { return inspectedByUserName; }
    public void setInspectedByUserName(String inspectedByUserName) { this.inspectedByUserName = inspectedByUserName; }

    public Boolean getCustomerAcknowledged() { return customerAcknowledged; }
    public void setCustomerAcknowledged(Boolean customerAcknowledged) { this.customerAcknowledged = customerAcknowledged; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
}

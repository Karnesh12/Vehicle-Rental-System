package com.rideflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.rideflow.enums.FuelLevel;
import com.rideflow.enums.InspectionType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rental_inspections")
public class RentalInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Enumerated(EnumType.STRING)
    @Column(name = "inspection_type", nullable = false, length = 20)
    private InspectionType inspectionType;

    @Column(name = "inspection_datetime", nullable = false)
    private LocalDateTime inspectionDatetime = LocalDateTime.now();

    @Column(nullable = false)
    private Integer mileage;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_level", nullable = false, length = 20)
    private FuelLevel fuelLevel;

    @Column(columnDefinition = "TEXT")
    private String damageNotes;

    @Column(columnDefinition = "TEXT")
    private String checklistJson;

    @Column(name = "late_charges", nullable = false, precision = 10, scale = 2)
    private BigDecimal lateCharges = BigDecimal.ZERO;

    @Column(name = "damage_charges", nullable = false, precision = 10, scale = 2)
    private BigDecimal damageCharges = BigDecimal.ZERO;

    @Column(name = "fuel_charges", nullable = false, precision = 10, scale = 2)
    private BigDecimal fuelCharges = BigDecimal.ZERO;

    @Column(name = "other_charges", nullable = false, precision = 10, scale = 2)
    private BigDecimal otherCharges = BigDecimal.ZERO;

    @Column(name = "total_charges", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCharges = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inspected_by_user_id", nullable = false)
    private User inspectedBy;

    @Column(name = "customer_acknowledged", nullable = false)
    private Boolean customerAcknowledged = true;

    @OneToMany(mappedBy = "inspection", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<InspectionImage> images = new ArrayList<>();

    public RentalInspection() {}

    @PrePersist
    public void prePersist() {
        if (inspectionDatetime == null) inspectionDatetime = LocalDateTime.now();
        if (lateCharges == null) lateCharges = BigDecimal.ZERO;
        if (damageCharges == null) damageCharges = BigDecimal.ZERO;
        if (fuelCharges == null) fuelCharges = BigDecimal.ZERO;
        if (otherCharges == null) otherCharges = BigDecimal.ZERO;
        if (totalCharges == null) {
            totalCharges = lateCharges.add(damageCharges).add(fuelCharges).add(otherCharges);
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

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

    public User getInspectedBy() { return inspectedBy; }
    public void setInspectedBy(User inspectedBy) { this.inspectedBy = inspectedBy; }

    public Boolean getCustomerAcknowledged() { return customerAcknowledged; }
    public void setCustomerAcknowledged(Boolean customerAcknowledged) { this.customerAcknowledged = customerAcknowledged; }

    public List<InspectionImage> getImages() { return images; }
    public void setImages(List<InspectionImage> images) { this.images = images; }
}

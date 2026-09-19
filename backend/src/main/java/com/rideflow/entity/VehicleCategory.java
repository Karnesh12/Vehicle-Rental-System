package com.rideflow.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_categories")
public class VehicleCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(name = "base_deposit", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseDeposit = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public VehicleCategory() {}

    public VehicleCategory(String name, String description, BigDecimal baseDeposit) {
        this.name = name;
        this.description = description;
        this.baseDeposit = baseDeposit != null ? baseDeposit : BigDecimal.ZERO;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getBaseDeposit() { return baseDeposit; }
    public void setBaseDeposit(BigDecimal baseDeposit) { this.baseDeposit = baseDeposit; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

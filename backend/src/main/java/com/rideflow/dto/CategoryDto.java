package com.rideflow.dto;

import java.math.BigDecimal;

public class CategoryDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal baseDeposit;

    public CategoryDto() {}

    public CategoryDto(Long id, String name, String description, BigDecimal baseDeposit) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.baseDeposit = baseDeposit;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getBaseDeposit() { return baseDeposit; }
    public void setBaseDeposit(BigDecimal baseDeposit) { this.baseDeposit = baseDeposit; }
}

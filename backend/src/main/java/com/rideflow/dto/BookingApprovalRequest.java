package com.rideflow.dto;

import jakarta.validation.constraints.NotNull;

public class BookingApprovalRequest {
    @NotNull(message = "Approval decision is required")
    private Boolean approved;

    private String reason;

    public BookingApprovalRequest() {}

    public BookingApprovalRequest(Boolean approved, String reason) {
        this.approved = approved;
        this.reason = reason;
    }

    public Boolean getApproved() { return approved; }
    public void setApproved(Boolean approved) { this.approved = approved; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}

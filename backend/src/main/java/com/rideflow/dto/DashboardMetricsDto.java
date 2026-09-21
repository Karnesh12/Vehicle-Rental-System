package com.rideflow.dto;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DashboardMetricsDto {
    // Shared / Admin
    private long totalVehicles;
    private long availableVehicles;
    private long reservedVehicles;
    private long rentedVehicles;
    private long maintenanceVehicles;
    private long totalCustomers;
    private long totalStaff;
    private long pendingBookings;
    private long activeRentals;
    private long completedRentals;
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private BigDecimal monthlyRevenue = BigDecimal.ZERO;

    // Staff Specific
    private long todayHandovers;
    private long todayReturns;
    private long pendingApprovals;

    // Customer Specific
    private long customerTotalBookings;
    private long customerCompletedBookings;
    private long customerPendingRequests;
    private BookingDto upcomingBooking;
    private BookingDto activeBooking;
    private long unreadNotificationsCount;

    // Charts & Lists
    private Map<String, Long> vehicleCategoryDistribution = new HashMap<>();
    private Map<String, Long> vehicleStatusDistribution = new HashMap<>();
    private List<BookingDto> recentBookings;

    public DashboardMetricsDto() {}

    public long getTotalVehicles() { return totalVehicles; }
    public void setTotalVehicles(long totalVehicles) { this.totalVehicles = totalVehicles; }

    public long getAvailableVehicles() { return availableVehicles; }
    public void setAvailableVehicles(long availableVehicles) { this.availableVehicles = availableVehicles; }

    public long getReservedVehicles() { return reservedVehicles; }
    public void setReservedVehicles(long reservedVehicles) { this.reservedVehicles = reservedVehicles; }

    public long getRentedVehicles() { return rentedVehicles; }
    public void setRentedVehicles(long rentedVehicles) { this.rentedVehicles = rentedVehicles; }

    public long getMaintenanceVehicles() { return maintenanceVehicles; }
    public void setMaintenanceVehicles(long maintenanceVehicles) { this.maintenanceVehicles = maintenanceVehicles; }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getTotalStaff() { return totalStaff; }
    public void setTotalStaff(long totalStaff) { this.totalStaff = totalStaff; }

    public long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(long pendingBookings) { this.pendingBookings = pendingBookings; }

    public long getActiveRentals() { return activeRentals; }
    public void setActiveRentals(long activeRentals) { this.activeRentals = activeRentals; }

    public long getCompletedRentals() { return completedRentals; }
    public void setCompletedRentals(long completedRentals) { this.completedRentals = completedRentals; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(BigDecimal monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }

    public long getTodayHandovers() { return todayHandovers; }
    public void setTodayHandovers(long todayHandovers) { this.todayHandovers = todayHandovers; }

    public long getTodayReturns() { return todayReturns; }
    public void setTodayReturns(long todayReturns) { this.todayReturns = todayReturns; }

    public long getPendingApprovals() { return pendingApprovals; }
    public void setPendingApprovals(long pendingApprovals) { this.pendingApprovals = pendingApprovals; }

    public long getCustomerTotalBookings() { return customerTotalBookings; }
    public void setCustomerTotalBookings(long customerTotalBookings) { this.customerTotalBookings = customerTotalBookings; }

    public long getCustomerCompletedBookings() { return customerCompletedBookings; }
    public void setCustomerCompletedBookings(long customerCompletedBookings) { this.customerCompletedBookings = customerCompletedBookings; }

    public long getCustomerPendingRequests() { return customerPendingRequests; }
    public void setCustomerPendingRequests(long customerPendingRequests) { this.customerPendingRequests = customerPendingRequests; }

    public BookingDto getUpcomingBooking() { return upcomingBooking; }
    public void setUpcomingBooking(BookingDto upcomingBooking) { this.upcomingBooking = upcomingBooking; }

    public BookingDto getActiveBooking() { return activeBooking; }
    public void setActiveBooking(BookingDto activeBooking) { this.activeBooking = activeBooking; }

    public long getUnreadNotificationsCount() { return unreadNotificationsCount; }
    public void setUnreadNotificationsCount(long unreadNotificationsCount) { this.unreadNotificationsCount = unreadNotificationsCount; }

    public Map<String, Long> getVehicleCategoryDistribution() { return vehicleCategoryDistribution; }
    public void setVehicleCategoryDistribution(Map<String, Long> vehicleCategoryDistribution) { this.vehicleCategoryDistribution = vehicleCategoryDistribution; }

    public Map<String, Long> getVehicleStatusDistribution() { return vehicleStatusDistribution; }
    public void setVehicleStatusDistribution(Map<String, Long> vehicleStatusDistribution) { this.vehicleStatusDistribution = vehicleStatusDistribution; }

    public List<BookingDto> getRecentBookings() { return recentBookings; }
    public void setRecentBookings(List<BookingDto> recentBookings) { this.recentBookings = recentBookings; }
}

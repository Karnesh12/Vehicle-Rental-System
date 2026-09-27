package com.rideflow.service;

import com.rideflow.dto.BookingDto;
import com.rideflow.dto.DashboardMetricsDto;
import com.rideflow.entity.Booking;
import com.rideflow.entity.Vehicle;
import com.rideflow.enums.BookingStatus;
import com.rideflow.enums.Role;
import com.rideflow.enums.VehicleStatus;
import com.rideflow.mapper.BookingMapper;
import com.rideflow.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;
    private final BookingMapper bookingMapper;

    public DashboardService(VehicleRepository vehicleRepository,
                            UserRepository userRepository,
                            BookingRepository bookingRepository,
                            NotificationRepository notificationRepository,
                            BookingMapper bookingMapper) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.notificationRepository = notificationRepository;
        this.bookingMapper = bookingMapper;
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public DashboardMetricsDto getAdminMetrics() {
        DashboardMetricsDto dto = new DashboardMetricsDto();

        dto.setTotalVehicles(vehicleRepository.count());
        dto.setAvailableVehicles(vehicleRepository.countByStatus(VehicleStatus.AVAILABLE));
        dto.setReservedVehicles(vehicleRepository.countByStatus(VehicleStatus.RESERVED));
        dto.setRentedVehicles(vehicleRepository.countByStatus(VehicleStatus.RENTED));
        dto.setMaintenanceVehicles(vehicleRepository.countByStatus(VehicleStatus.MAINTENANCE));

        dto.setTotalCustomers(userRepository.countByRole(Role.CUSTOMER));
        dto.setTotalStaff(userRepository.countByRole(Role.STAFF));

        dto.setPendingBookings(bookingRepository.countByStatus(BookingStatus.PENDING));
        dto.setActiveRentals(bookingRepository.countByStatus(BookingStatus.ACTIVE));
        dto.setCompletedRentals(bookingRepository.countByStatus(BookingStatus.COMPLETED));

        BigDecimal totalRev = bookingRepository.calculateTotalRevenue();
        dto.setTotalRevenue(totalRev != null ? totalRev : BigDecimal.ZERO);

        LocalDate now = LocalDate.now();
        BigDecimal monthRev = bookingRepository.calculateMonthlyRevenue(now.getYear(), now.getMonthValue());
        dto.setMonthlyRevenue(monthRev != null ? monthRev : BigDecimal.ZERO);

        // Category distribution
        Map<String, Long> categoryMap = new HashMap<>();
        for (Vehicle v : vehicleRepository.findAll()) {
            if (v.getCategory() != null) {
                categoryMap.put(v.getCategory().getName(), categoryMap.getOrDefault(v.getCategory().getName(), 0L) + 1);
            }
        }
        dto.setVehicleCategoryDistribution(categoryMap);

        // Status distribution
        Map<String, Long> statusMap = new HashMap<>();
        for (VehicleStatus s : VehicleStatus.values()) {
            statusMap.put(s.name(), vehicleRepository.countByStatus(s));
        }
        dto.setVehicleStatusDistribution(statusMap);

        // Recent 5 bookings
        List<BookingDto> recent = bookingRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5))
                .getContent().stream()
                .map(bookingMapper::toDto)
                .collect(Collectors.toList());
        dto.setRecentBookings(recent);

        return dto;
    }

    public DashboardMetricsDto getStaffMetrics() {
        DashboardMetricsDto dto = new DashboardMetricsDto();

        dto.setPendingApprovals(bookingRepository.countByStatus(BookingStatus.PENDING));
        dto.setActiveRentals(bookingRepository.countByStatus(BookingStatus.ACTIVE));
        dto.setMaintenanceVehicles(vehicleRepository.countByStatus(VehicleStatus.MAINTENANCE));
        dto.setAvailableVehicles(vehicleRepository.countByStatus(VehicleStatus.AVAILABLE));

        LocalDate today = LocalDate.now();
        dto.setTodayHandovers(bookingRepository.findTodayHandovers(today).size());
        dto.setTodayReturns(bookingRepository.findTodayReturns(today).size());

        List<BookingDto> recent = bookingRepository.findActiveAndPendingRecentBookings(PageRequest.of(0, 8))
                .getContent().stream()
                .map(bookingMapper::toDto)
                .collect(Collectors.toList());
        dto.setRecentBookings(recent);

        return dto;
    }

    public DashboardMetricsDto getCustomerMetrics(Long customerId) {
        DashboardMetricsDto dto = new DashboardMetricsDto();

        dto.setCustomerTotalBookings(bookingRepository.countByCustomerId(customerId));
        dto.setCustomerCompletedBookings(bookingRepository.countByCustomerIdAndStatus(customerId, BookingStatus.COMPLETED));
        dto.setCustomerPendingRequests(bookingRepository.countByCustomerIdAndStatus(customerId, BookingStatus.PENDING));
        dto.setUnreadNotificationsCount(notificationRepository.countByUserIdAndIsReadFalse(customerId));

        List<Booking> activeOrUpcoming = bookingRepository.findUpcomingOrActiveByCustomerId(customerId);
        for (Booking b : activeOrUpcoming) {
            if (b.getStatus() == BookingStatus.ACTIVE && dto.getActiveBooking() == null) {
                dto.setActiveBooking(bookingMapper.toDto(b));
            } else if ((b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.PENDING) && dto.getUpcomingBooking() == null) {
                dto.setUpcomingBooking(bookingMapper.toDto(b));
            }
        }

        return dto;
    }
}

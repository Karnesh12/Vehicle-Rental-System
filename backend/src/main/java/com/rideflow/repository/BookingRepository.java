package com.rideflow.repository;

import com.rideflow.entity.Booking;
import com.rideflow.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingReference(String bookingReference);
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    Page<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);
    List<Booking> findByVehicleIdOrderByCreatedAtDesc(Long vehicleId);
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);
    Page<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status, Pageable pageable);
    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.status IN ('PENDING', 'CONFIRMED', 'ACTIVE') ORDER BY b.createdAt DESC")
    Page<Booking> findActiveAndPendingRecentBookings(Pageable pageable);

    long countByStatus(BookingStatus status);
    long countByCustomerId(Long customerId);
    long countByCustomerIdAndStatus(Long customerId, BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.customer.id = :customerId AND b.status IN ('PENDING', 'CONFIRMED', 'ACTIVE') ORDER BY b.pickupDate ASC")
    List<Booking> findUpcomingOrActiveByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT b FROM Booking b WHERE b.status = 'CONFIRMED' AND b.pickupDate = :today")
    List<Booking> findTodayHandovers(@Param("today") LocalDate today);

    @Query("SELECT b FROM Booking b WHERE b.status = 'ACTIVE' AND b.returnDate = :today")
    List<Booking> findTodayReturns(@Param("today") LocalDate today);

    @Query("SELECT COALESCE(SUM(b.finalTotal), 0) FROM Booking b WHERE b.status IN ('ACTIVE', 'COMPLETED')")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COALESCE(SUM(b.finalTotal), 0) FROM Booking b WHERE b.status IN ('ACTIVE', 'COMPLETED') AND YEAR(b.createdAt) = :year AND MONTH(b.createdAt) = :month")
    BigDecimal calculateMonthlyRevenue(@Param("year") int year, @Param("month") int month);
}

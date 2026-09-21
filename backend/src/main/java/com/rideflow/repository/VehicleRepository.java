package com.rideflow.repository;

import com.rideflow.entity.Vehicle;
import com.rideflow.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long>, JpaSpecificationExecutor<Vehicle> {
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);
    boolean existsByRegistrationNumber(String registrationNumber);
    boolean existsByRegistrationNumberAndIdNot(String registrationNumber, Long id);
    long countByStatus(VehicleStatus status);

    @Query("SELECT v FROM Vehicle v WHERE v.status = 'AVAILABLE' AND v.id NOT IN (" +
           "  SELECT b.vehicle.id FROM Booking b WHERE b.status IN ('PENDING', 'CONFIRMED', 'ACTIVE') " +
           "  AND b.pickupDate <= :returnDate AND b.returnDate >= :pickupDate" +
           ")")
    List<Vehicle> findAvailableVehiclesForDates(
            @Param("pickupDate") LocalDate pickupDate,
            @Param("returnDate") LocalDate returnDate);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicle.id = :vehicleId " +
           "AND b.status IN ('PENDING', 'CONFIRMED', 'ACTIVE') " +
           "AND b.pickupDate <= :returnDate AND b.returnDate >= :pickupDate")
    boolean isVehicleBookedForDates(
            @Param("vehicleId") Long vehicleId,
            @Param("pickupDate") LocalDate pickupDate,
            @Param("returnDate") LocalDate returnDate);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicle.id = :vehicleId " +
           "AND b.id <> :excludeBookingId " +
           "AND b.status IN ('PENDING', 'CONFIRMED', 'ACTIVE') " +
           "AND b.pickupDate <= :returnDate AND b.returnDate >= :pickupDate")
    boolean isVehicleBookedForDatesExcludingBooking(
            @Param("vehicleId") Long vehicleId,
            @Param("pickupDate") LocalDate pickupDate,
            @Param("returnDate") LocalDate returnDate,
            @Param("excludeBookingId") Long excludeBookingId);
}

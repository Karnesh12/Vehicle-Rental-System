package com.rideflow.repository;

import com.rideflow.entity.RentalInspection;
import com.rideflow.enums.InspectionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RentalInspectionRepository extends JpaRepository<RentalInspection, Long> {
    List<RentalInspection> findByBookingId(Long bookingId);
    Optional<RentalInspection> findByBookingIdAndInspectionType(Long bookingId, InspectionType inspectionType);
    boolean existsByBookingIdAndInspectionType(Long bookingId, InspectionType inspectionType);
}

package com.rideflow.repository;

import com.rideflow.entity.MaintenanceRecord;
import com.rideflow.enums.MaintenanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {
    List<MaintenanceRecord> findByVehicleIdOrderByStartDateDesc(Long vehicleId);
    Page<MaintenanceRecord> findByStatus(MaintenanceStatus status, Pageable pageable);
    Page<MaintenanceRecord> findAllByOrderByStartDateDesc(Pageable pageable);
    long countByStatus(MaintenanceStatus status);
}

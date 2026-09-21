package com.rideflow.repository;

import com.rideflow.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBookingIdOrderByPaymentDateDesc(Long bookingId);
    Optional<Payment> findByReferenceNumber(String referenceNumber);
    Page<Payment> findAllByOrderByPaymentDateDesc(Pageable pageable);
}

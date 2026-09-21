package com.rideflow.repository;

import com.rideflow.entity.CustomerProfile;
import com.rideflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, Long> {
    Optional<CustomerProfile> findByUser(User user);
    Optional<CustomerProfile> findByUserId(Long userId);
    Optional<CustomerProfile> findByLicenceNumber(String licenceNumber);
    @org.springframework.data.jpa.repository.Query("SELECT c FROM CustomerProfile c WHERE c.nicOrPassport = :nicOrPassport")
    Optional<CustomerProfile> findByNicOrPassport(String nicOrPassport);
}

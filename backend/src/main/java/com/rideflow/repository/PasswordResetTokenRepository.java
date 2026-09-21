package com.rideflow.repository;

import com.rideflow.entity.PasswordResetToken;
import com.rideflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenAndUsedFalseAndExpiryDateAfter(String token, LocalDateTime now);
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUser(User user);
}

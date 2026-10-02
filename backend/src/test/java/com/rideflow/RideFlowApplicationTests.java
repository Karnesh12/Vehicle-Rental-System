package com.rideflow;

import com.rideflow.dto.AvailabilityCheckRequest;
import com.rideflow.dto.AvailabilityResponse;
import com.rideflow.service.AvailabilityService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class RideFlowApplicationTests {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AvailabilityService availabilityService;

    @Test
    void contextLoads() {
        assertNotNull(passwordEncoder);
        assertNotNull(availabilityService);
    }

    @Test
    void testPasswordEncoding() {
        String raw = "Admin123!";
        String encoded = passwordEncoder.encode(raw);
        assertTrue(passwordEncoder.matches(raw, encoded));
        assertFalse(passwordEncoder.matches("WrongPassword", encoded));
    }

    @Test
    void testCalculateRentalDays() {
        LocalDate pickup = LocalDate.now().plusDays(1);
        LocalDate returnDate = LocalDate.now().plusDays(4);
        int days = availabilityService.calculateRentalDays(pickup, returnDate);
        assertEquals(3, days);
    }
}

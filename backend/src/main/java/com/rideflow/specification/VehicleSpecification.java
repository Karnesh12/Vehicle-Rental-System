package com.rideflow.specification;

import com.rideflow.entity.Booking;
import com.rideflow.entity.Vehicle;
import com.rideflow.enums.BookingStatus;
import com.rideflow.enums.FuelType;
import com.rideflow.enums.Transmission;
import com.rideflow.enums.VehicleStatus;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class VehicleSpecification {

    public static Specification<Vehicle> filterVehicles(
            Long categoryId,
            String keyword,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Transmission transmission,
            FuelType fuelType,
            Integer seats,
            VehicleStatus status,
            LocalDate pickupDate,
            LocalDate returnDate) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchPattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate makeMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("make")), searchPattern);
                Predicate modelMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("model")), searchPattern);
                Predicate regMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("registrationNumber")), searchPattern);
                predicates.add(criteriaBuilder.or(makeMatch, modelMatch, regMatch));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("dailyRate"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("dailyRate"), maxPrice));
            }

            if (transmission != null) {
                predicates.add(criteriaBuilder.equal(root.get("transmission"), transmission));
            }

            if (fuelType != null) {
                predicates.add(criteriaBuilder.equal(root.get("fuelType"), fuelType));
            }

            if (seats != null && seats > 0) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("seats"), seats));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            } else {
                // Never return INACTIVE (deleted/retired) vehicles in general search or catalogue
                predicates.add(criteriaBuilder.notEqual(root.get("status"), VehicleStatus.INACTIVE));
            }

            // Availability Date Range check: exclude any vehicles that have overlapping bookings in PENDING, CONFIRMED, ACTIVE
            if (pickupDate != null && returnDate != null && query != null) {
                // Must be AVAILABLE status
                predicates.add(criteriaBuilder.equal(root.get("status"), VehicleStatus.AVAILABLE));

                Subquery<Long> bookingSubquery = query.subquery(Long.class);
                Root<Booking> bookingRoot = bookingSubquery.from(Booking.class);

                Predicate sameVehicle = criteriaBuilder.equal(bookingRoot.get("vehicle").get("id"), root.get("id"));
                Predicate activeStatus = bookingRoot.get("status").in(
                        BookingStatus.PENDING,
                        BookingStatus.CONFIRMED,
                        BookingStatus.ACTIVE
                );
                // Overlap condition: booking.pickupDate <= returnDate AND booking.returnDate >= pickupDate
                Predicate dateOverlap = criteriaBuilder.and(
                        criteriaBuilder.lessThanOrEqualTo(bookingRoot.get("pickupDate"), returnDate),
                        criteriaBuilder.greaterThanOrEqualTo(bookingRoot.get("returnDate"), pickupDate)
                );

                bookingSubquery.select(bookingRoot.get("vehicle").get("id"))
                        .where(criteriaBuilder.and(sameVehicle, activeStatus, dateOverlap));

                predicates.add(criteriaBuilder.not(criteriaBuilder.exists(bookingSubquery)));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}

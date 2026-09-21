package com.rideflow.mapper;

import com.rideflow.dto.CustomerProfileDto;
import com.rideflow.entity.CustomerProfile;
import com.rideflow.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public CustomerProfileDto toProfileDto(User user, CustomerProfile profile) {
        CustomerProfileDto dto = new CustomerProfileDto();
        dto.setUserId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());

        if (profile != null) {
            dto.setId(profile.getId());
            dto.setNicOrPassport(profile.getNicOrPassport());
            dto.setLicenceNumber(profile.getLicenceNumber());
            dto.setLicenceExpiryDate(profile.getLicenceExpiryDate());
            dto.setLicenceImageUrl(profile.getLicenceImageUrl());
            dto.setAddress(profile.getAddress());
            dto.setCity(profile.getCity());
        }
        return dto;
    }
}

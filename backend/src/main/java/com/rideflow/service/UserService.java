package com.rideflow.service;

import com.rideflow.dto.CustomerProfileDto;
import com.rideflow.dto.RegisterRequest;
import com.rideflow.dto.UpdateProfileRequest;
import com.rideflow.entity.CustomerProfile;
import com.rideflow.entity.User;
import com.rideflow.enums.Role;
import com.rideflow.exception.ConflictException;
import com.rideflow.exception.ResourceNotFoundException;
import com.rideflow.mapper.UserMapper;
import com.rideflow.repository.CustomerProfileRepository;
import com.rideflow.repository.UserRepository;
import com.rideflow.util.FileStorageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final UserMapper userMapper;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public UserService(UserRepository userRepository,
                       CustomerProfileRepository customerProfileRepository,
                       UserMapper userMapper,
                       FileStorageService fileStorageService,
                       PasswordEncoder passwordEncoder,
                       AuditLogService auditLogService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.userMapper = userMapper;
        this.fileStorageService = fileStorageService;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }

    public CustomerProfileDto getCustomerProfile(Long userId) {
        User user = getUserById(userId);
        CustomerProfile profile = customerProfileRepository.findByUserId(userId).orElse(null);
        return userMapper.toProfileDto(user, profile);
    }

    @Transactional
    public CustomerProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserById(userId);
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        userRepository.save(user);

        CustomerProfile profile = customerProfileRepository.findByUserId(userId)
                .orElseGet(() -> new CustomerProfile(user, request.getNicOrPassport(), request.getLicenceNumber(), request.getLicenceExpiryDate(), request.getAddress(), request.getCity()));

        profile.setNicOrPassport(request.getNicOrPassport());
        profile.setLicenceNumber(request.getLicenceNumber());
        profile.setLicenceExpiryDate(request.getLicenceExpiryDate());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());

        profile = customerProfileRepository.save(profile);
        auditLogService.log(user, "PROFILE_UPDATED", "User", userId.toString(), null, "Profile details updated", null);

        return userMapper.toProfileDto(user, profile);
    }

    @Transactional
    public String uploadLicenceImage(Long userId, MultipartFile file) {
        User user = getUserById(userId);
        String imageUrl = fileStorageService.storeFile(file);

        CustomerProfile profile = customerProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CustomerProfile cp = new CustomerProfile();
                    cp.setUser(user);
                    cp.setNicOrPassport("PENDING");
                    cp.setLicenceNumber("PENDING");
                    cp.setLicenceExpiryDate(LocalDate.now().plusYears(1));
                    return cp;
                });

        profile.setLicenceImageUrl(imageUrl);
        customerProfileRepository.save(profile);

        auditLogService.log(user, "LICENCE_IMAGE_UPLOADED", "CustomerProfile", profile.getId() != null ? profile.getId().toString() : "new", null, imageUrl, null);
        notificationService.createNotification(user, "Licence Image Uploaded", "Your driving licence image has been successfully uploaded and saved.", "INFO");

        return imageUrl;
    }

    @Transactional
    public User createStaff(RegisterRequest request, User adminUser) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered: " + request.getEmail());
        }

        User staff = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getPhoneNumber(),
                Role.STAFF
        );
        staff = userRepository.save(staff);

        auditLogService.log(adminUser, "CREATE_STAFF", "User", staff.getId().toString(), null, "Created staff " + staff.getEmail(), null);
        notificationService.createNotification(staff, "Welcome to RideFlow Staff Team", "Your staff account has been created by the Administrator.", "INFO");

        return staff;
    }

    public Page<User> getCustomers(Pageable pageable) {
        return userRepository.findByRole(Role.CUSTOMER, pageable);
    }

    public Page<User> getStaff(Pageable pageable) {
        return userRepository.findByRole(Role.STAFF, pageable);
    }

    @Transactional
    public User toggleUserStatus(Long userId, User adminUser) {
        User user = getUserById(userId);
        boolean newStatus = !user.getIsActive();
        user.setIsActive(newStatus);
        user = userRepository.save(user);

        auditLogService.log(adminUser, "TOGGLE_USER_STATUS", "User", userId.toString(), String.valueOf(!newStatus), String.valueOf(newStatus), null);
        notificationService.createNotification(user, "Account Status Updated",
                "Your account has been " + (newStatus ? "activated" : "deactivated") + " by an administrator.", "WARNING");

        return user;
    }
}

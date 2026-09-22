package com.rideflow.service;

import com.rideflow.dto.*;
import com.rideflow.entity.CustomerProfile;
import com.rideflow.entity.PasswordResetToken;
import com.rideflow.entity.User;
import com.rideflow.enums.Role;
import com.rideflow.exception.BadRequestException;
import com.rideflow.exception.ConflictException;
import com.rideflow.exception.ResourceNotFoundException;
import com.rideflow.exception.UnauthorizedException;
import com.rideflow.repository.CustomerProfileRepository;
import com.rideflow.repository.PasswordResetTokenRepository;
import com.rideflow.repository.UserRepository;
import com.rideflow.security.CustomUserDetails;
import com.rideflow.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository,
                       CustomerProfileRepository customerProfileRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuthenticationManager authenticationManager,
                       AuditLogService auditLogService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered: " + request.getEmail());
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getPhoneNumber(),
                Role.CUSTOMER
        );
        user = userRepository.save(user);

        CustomerProfile profile = new CustomerProfile(
                user,
                request.getNicOrPassport(),
                request.getLicenceNumber(),
                request.getLicenceExpiryDate(),
                request.getAddress(),
                request.getCity()
        );
        customerProfileRepository.save(profile);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtTokenProvider.generateToken(userDetails);

        auditLogService.log(user, "USER_REGISTER", "User", user.getId().toString(), null, "Role: CUSTOMER", null);
        notificationService.createNotification(user, "Welcome to RideFlow!", "Your customer account has been successfully created. Explore our fleet today.", "INFO");

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getPhoneNumber(), user.getRole(), true);
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!user.getIsActive()) {
            throw new UnauthorizedException("Your account is deactivated. Please contact RideFlow support.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(userDetails);

        auditLogService.log(user, "USER_LOGIN", "User", user.getId().toString(), null, "SUCCESS", null);

        boolean licenceVerified = false;
        if (user.getRole() == Role.CUSTOMER) {
            licenceVerified = customerProfileRepository.findByUserId(user.getId()).isPresent();
        } else {
            licenceVerified = true;
        }

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getPhoneNumber(), user.getRole(), licenceVerified);
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email: " + request.getEmail()));

        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusHours(2);

        PasswordResetToken resetToken = new PasswordResetToken(user, token, expiry);
        passwordResetTokenRepository.save(resetToken);

        auditLogService.log(user, "FORGOT_PASSWORD_REQUEST", "User", user.getId().toString(), null, "Token generated", null);
        notificationService.createNotification(user, "Password Reset Request",
                "Password reset token requested. Token: " + token + " (Valid for 2 hours)", "WARNING");

        return token;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUsedFalseAndExpiryDateAfter(
                request.getToken(), LocalDateTime.now())
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token."));

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        auditLogService.log(user, "PASSWORD_RESET_SUCCESS", "User", user.getId().toString(), null, "Password updated", null);
        notificationService.createNotification(user, "Password Changed Successfully", "Your account password has been updated.", "INFO");
    }
}

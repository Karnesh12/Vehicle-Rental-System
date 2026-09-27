package com.rideflow.service;

import com.rideflow.entity.Notification;
import com.rideflow.entity.User;
import com.rideflow.exception.ResourceNotFoundException;
import com.rideflow.repository.NotificationRepository;
import com.rideflow.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createNotification(User user, String title, String message, String type) {
        Notification notification = new Notification(user, title, message, type);
        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyStaffAndAdmin(String title, String message, String type) {
        List<User> staffAndAdmins = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && (u.getRole().name().equals("STAFF") || u.getRole().name().equals("ADMIN")))
                .toList();
        for (User u : staffAndAdmins) {
            notificationRepository.save(new Notification(u, title, message, type));
        }
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Page<Notification> getUserNotificationsPaged(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));
        if (notification.getUser().getId().equals(userId)) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : notifications) {
            if (!n.getIsRead()) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        }
    }
}

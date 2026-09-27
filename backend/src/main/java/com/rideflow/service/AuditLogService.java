package com.rideflow.service;

import com.rideflow.entity.AuditLog;
import com.rideflow.entity.User;
import com.rideflow.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void log(User user, String action, String entityType, String entityId, String oldValue, String newValue, String ipAddress) {
        AuditLog auditLog = new AuditLog(user, action, entityType, entityId, oldValue, newValue, ipAddress);
        auditLogRepository.save(auditLog);
    }

    public Page<AuditLog> getLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop10ByOrderByCreatedAtDesc();
    }
}

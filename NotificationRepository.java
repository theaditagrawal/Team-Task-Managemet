package com.teamproject.repository;

import com.teamproject.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByProjectId(String projectId);
    List<Notification> findByProjectIdOrderByCreatedAtDesc(String projectId);
    void deleteByProjectId(String projectId);
} 
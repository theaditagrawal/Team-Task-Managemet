package com.teamproject.controller;

import com.teamproject.model.Notification;
import com.teamproject.repository.NotificationRepository;
import com.teamproject.repository.ProjectRepository;
import com.teamproject.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Date;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) {
        // Verify that the sender is either admin or team leader
        String sender = notification.getSender();
        String projectId = notification.getProjectId();
        
        // Get user role
        String userRole = userRepository.findByUsername(sender).getRole();
        
        // Get project team leader
        String projectTeamLeader = projectRepository.findById(projectId)
            .map(project -> project.getTeamLeader())
            .orElse(null);
        
        // Only allow admin or team leader of the project to create notifications
        if ("admin".equals(userRole) || sender.equals(projectTeamLeader)) {
            notification.setCreatedAt(new Date());
            return notificationRepository.save(notification);
        }
        return null;
    }

    @GetMapping("/project/{projectId}")
    public List<Notification> getProjectNotifications(@PathVariable String projectId) {
        return notificationRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    }
} 
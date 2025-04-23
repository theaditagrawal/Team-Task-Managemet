package com.teamproject.controller;

import com.teamproject.model.Project;
import com.teamproject.repository.ProjectRepository;
import com.teamproject.repository.NotificationRepository;
import com.teamproject.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {
    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private TaskRepository taskRepository;

    @PostMapping
    public Project createProject(@RequestBody Project project) {
        if (project.getStatus() == null || project.getStatus().isEmpty()) {
            project.setStatus("Not Started");
        }
        return projectRepository.save(project);
    }

    @GetMapping("/admin")
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @GetMapping("/team-leader/{username}")
    public List<Project> getProjectsByTeamLeader(@PathVariable String username) {
        return projectRepository.findByTeamLeader(username);
    }

    @GetMapping("/team-member/{username}")
    public List<Project> getProjectsByTeamMember(@PathVariable String username) {
        return projectRepository.findByTeamMembersContaining(username);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteProject(@PathVariable String id) {
        if (!projectRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        notificationRepository.deleteByProjectId(id);
        taskRepository.deleteByProjectId(id);
        projectRepository.deleteById(id);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Project> updateProjectStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Project project = projectRepository.findById(id).orElse(null);
        if (project == null) {
            return ResponseEntity.notFound().build();
        }

        project.setStatus(newStatus);
        Project updatedProject = projectRepository.save(project);
        return ResponseEntity.ok(updatedProject);
    }
} 
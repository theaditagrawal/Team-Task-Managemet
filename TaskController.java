package com.teamproject.controller;

import com.teamproject.model.Project;
import com.teamproject.model.Task;
import com.teamproject.model.User;
import com.teamproject.repository.ProjectRepository;
import com.teamproject.repository.TaskRepository;
import com.teamproject.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

// Assume SecurityContextHolder is available for user details (replace with actual security mechanism)
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository; // Needed for checking assigned members

    // POST /api/tasks - Create a new task
    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Task task, @RequestHeader(name = "X-User-Username", required = false) String creatorUsername) {
        // Get the project to verify the creator is the team leader
        Project project = projectRepository.findById(task.getProjectId()).orElse(null);
        if (project == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Project not found for the task.");
        }

        // --- Authorization Check: Only Team Leader --- 
        // Replace X-User-Username header with actual authenticated user from Security Context
        if (creatorUsername == null || !project.getTeamLeader().equals(creatorUsername)) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only the project team leader can create tasks.");
        }
        // --- End Authorization Check --- 

        // Validate assigned members (optional: check if they exist in the project/system)
        if (task.getAssignedMembers() == null || task.getAssignedMembers().isEmpty()) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("At least one member must be assigned.");
        }
        // Ensure assigned members are part of the project team
        List<String> projectMembers = project.getTeamMembers();
        for (String assignedMember : task.getAssignedMembers()) {
            if (!projectMembers.contains(assignedMember)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                       .body("Assigned member " + assignedMember + " is not part of the project team.");
            }
        }

        task.setStatus("Not Started"); // Default status
        task.setCreatedAt(new Date());
        Task savedTask = taskRepository.save(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);
    }

    // GET /api/tasks/project/{projectId} - Get tasks for a project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProjectId(@PathVariable String projectId) {
        // Optional: Check if user has access to this project
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        return ResponseEntity.ok(tasks);
    }

    // PUT /api/tasks/{taskId}/status - Update task status
    @PutMapping("/{taskId}/status")
    public ResponseEntity<?> updateTaskStatus(
        @PathVariable String taskId,
        @RequestBody Map<String, String> payload,
        @RequestHeader(name = "X-User-Username", required = false) String updaterUsername
    ) {
        String newStatus = payload.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().body("Status is required in payload.");
        }

        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        // --- Authorization Check: Only Assigned Member --- 
        // Replace X-User-Username header with actual authenticated user
        if (updaterUsername == null || !task.getAssignedMembers().contains(updaterUsername)) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only assigned members can update task status.");
        }
         // --- End Authorization Check --- 

        // Optional: Validate status value
        // List<String> allowedStatuses = List.of("Not Started", "In Progress", "Completed");
        // if (!allowedStatuses.contains(newStatus)) { ... }

        task.setStatus(newStatus);
        Task updatedTask = taskRepository.save(task);
        return ResponseEntity.ok(updatedTask);
    }
} 
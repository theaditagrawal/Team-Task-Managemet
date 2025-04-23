package com.teamproject.repository;

import com.teamproject.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByProjectId(String projectId);
    List<Task> findByProjectIdOrderByCreatedAtDesc(String projectId);
    void deleteByProjectId(String projectId); // Needed for project deletion cascade
} 
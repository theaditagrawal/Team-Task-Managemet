package com.teamproject.repository;

import com.teamproject.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
 
public interface ProjectRepository extends MongoRepository<Project, String> {
    List<Project> findByTeamLeader(String teamLeader);
    List<Project> findByTeamMembersContaining(String teamMember);
} 
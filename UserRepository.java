package com.teamproject.repository;

import com.teamproject.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {
    User findByUsername(String username);
    List<User> findByRole(String role);
    List<User> findByDepartment(String department);
} 
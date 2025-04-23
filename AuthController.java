package com.teamproject.controller;

import com.teamproject.model.User;
import com.teamproject.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        
        logger.info("Login attempt for user: {}", username);
        User user = userRepository.findByUsername(username);
        
        if (user != null) {
            logger.info("User found: {}", user.getUsername());
            if (user.getPassword().equals(password)) {
                logger.info("Password matches for user: {}", username);
                // Create a new user object without password
                User responseUser = new User();
                responseUser.setId(user.getId());
                responseUser.setUsername(user.getUsername());
                responseUser.setFirstName(user.getFirstName());
                responseUser.setLastName(user.getLastName());
                responseUser.setGender(user.getGender());
                responseUser.setRole(user.getRole());
                responseUser.setEmail(user.getEmail());
                responseUser.setPhone(user.getPhone());
                responseUser.setDepartment(user.getDepartment());
                logger.info("Returning user data for: {}", username);
                return responseUser;
            } else {
                logger.warn("Invalid password for user: {}", username);
            }
        } else {
            logger.warn("User not found: {}", username);
        }
        return null;
    }

    @PostMapping("/register")
    public User register(@RequestBody User newUser) {
        // Check if username already exists
        if (userRepository.findByUsername(newUser.getUsername()) != null) {
            return null;
        }
        return userRepository.save(newUser);
    }

    @GetMapping("/users")
    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/users/role/{role}")
    public java.util.List<User> getUsersByRole(@PathVariable String role) {
        return userRepository.findByRole(role);
    }
} 
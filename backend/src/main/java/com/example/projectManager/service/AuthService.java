package com.example.projectManager.service;

import com.example.projectManager.dtos.LoginRequest;
import com.example.projectManager.dtos.SignupRequest;
import com.example.projectManager.dtos.UserResponse;
import com.example.projectManager.enums.Role;
import com.example.projectManager.model.User;
import com.example.projectManager.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class AuthService {

    @Autowired
    private UserRepo userRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    public UserResponse signup(SignupRequest request, MultipartFile image) throws IOException {

        if(userRepo.findByEmail(request.email()).isPresent()){
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));

        if(userRepo.count() == 0){
            user.setRole(Role.ROLE_ADMIN);
        }
        else{
            user.setRole(Role.ROLE_USER);
        }

        user.setImageName(image.getOriginalFilename());
        user.setImageType(image.getContentType());
        user.setImageData(image.getBytes());

        User saved = userRepo.save(user);

        return new UserResponse(
                saved.getId(), saved.getName(), saved.getEmail(), saved.getRole(),
                "/users/" + saved.getId() + "/image"
        );
    }

    public String login(LoginRequest request){

        User user = userRepo.findByEmail(request.email()).orElseThrow(() ->
                new RuntimeException("Invalid Email or Password"));

        boolean isMatch = passwordEncoder.matches(request.password(), user.getPassword());

        if(!isMatch){
            throw new RuntimeException("Invalid Email or Password");
        }

        return jwtUtil.generateToken(user.getEmail(), user.getName());
    }
}

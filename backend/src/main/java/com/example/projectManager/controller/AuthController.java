package com.example.projectManager.controller;

import com.example.projectManager.dtos.LoginRequest;
import com.example.projectManager.dtos.SignupRequest;
import com.example.projectManager.dtos.UserResponse;
import com.example.projectManager.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<UserResponse> signup(@RequestPart SignupRequest request, @RequestPart MultipartFile imageFile) throws IOException {

        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request, imageFile));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request){

        return ResponseEntity.ok(authService.login(request));
    }

}

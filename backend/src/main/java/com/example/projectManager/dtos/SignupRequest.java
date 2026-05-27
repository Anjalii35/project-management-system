package com.example.projectManager.dtos;

public record SignupRequest(
        String name,
        String email,
        String password
) {}
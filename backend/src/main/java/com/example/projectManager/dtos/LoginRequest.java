package com.example.projectManager.dtos;

public record LoginRequest(
        String email,
        String password
) {
}

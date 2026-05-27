package com.example.projectManager.dtos;

public record UserRequest(
        String name,
        String email,
        String password
) {
}

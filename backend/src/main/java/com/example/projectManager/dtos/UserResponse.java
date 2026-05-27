package com.example.projectManager.dtos;

import com.example.projectManager.enums.Role;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role,
        String imageUrl
) {
}

package com.example.projectManager.dtos;

import com.example.projectManager.enums.ProjectStatus;

import java.time.LocalDate;

public record ProjectResponse(
        Long id,
        String title,
        String description,
        Long createdById,
        ProjectStatus status,
        LocalDate deadline,
        String imageUrl

) {
}

package com.example.projectManager.dtos;

import com.example.projectManager.enums.Priority;
import com.example.projectManager.enums.TaskStatus;

import java.time.LocalDate;

public record TaskRequest(
        String title,
        String description,
        TaskStatus status,
        LocalDate deadline,
        Priority priority,
        Long projectId,
        Long assignedToId
) {
}

package com.example.projectManager.model;

import com.example.projectManager.enums.Priority;
import com.example.projectManager.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;
    private LocalDate deadline;

    @ManyToOne
    private Project project;
    @ManyToOne
    private User assignedTo;

    @Enumerated(EnumType.STRING)
    private Priority priority;
}

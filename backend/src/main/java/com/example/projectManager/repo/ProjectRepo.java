package com.example.projectManager.repo;

import com.example.projectManager.model.Project;
import com.example.projectManager.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepo extends JpaRepository<Project, Long> {

    Page<Project> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Project> findByTitleContainingIgnoreCaseAndCreatedBy_EmailOrTitleContainingIgnoreCaseAndTasks_AssignedTo_Email(String title, String creatorEmail, String title1, String assignedEmail, Pageable pageable);

    Page<Project> findByCreatedBy_EmailOrTasks_AssignedTo_Email(String email, String email1, Pageable pageable);
}

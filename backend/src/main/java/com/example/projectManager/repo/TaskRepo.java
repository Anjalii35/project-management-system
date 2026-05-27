package com.example.projectManager.repo;

import com.example.projectManager.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepo extends JpaRepository<Task, Long> {

    Page<Task> findByProjectId(Long projectId, Pageable pageable);

    Page<Task> findByAssignedToId(Long userId, Pageable pageable);

    Boolean existsByProject_IdAndAssignedTo_Email(Long projectId, String email);

    Page<Task> findByProjectIdAndProject_CreatedBy_EmailOrProjectIdAndAssignedTo_Email(Long userId, String email,Long userId1, String email1, Pageable pageable);

    Page<Task> findByProject_CreatedBy_EmailOrAssignedTo_Email(String creatorEmail, String assignedEmail, Pageable pageable);
}

package com.example.projectManager.service;

import com.example.projectManager.dtos.ProjectRequest;
import com.example.projectManager.dtos.ProjectResponse;
import com.example.projectManager.enums.ProjectStatus;
import com.example.projectManager.enums.Role;
import com.example.projectManager.model.Project;
import com.example.projectManager.model.User;
import com.example.projectManager.repo.ProjectRepo;
import com.example.projectManager.repo.TaskRepo;
import com.example.projectManager.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepo projectRepo;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private TaskRepo taskRepo;

    public ProjectResponse saveProject(ProjectRequest projReq, MultipartFile image) throws IOException {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        Project project = new Project();
        project.setTitle(projReq.title());
        project.setDescription(projReq.description());
        project.setCreatedBy(user);
        project.setStatus(projReq.status());
        project.setDeadline(projReq.deadline());

        project.setImageName(image.getOriginalFilename());
        project.setImageType(image.getContentType());
        project.setImageData(image.getBytes());

        Project savedProj = projectRepo.save(project);

        return new ProjectResponse(
                savedProj.getId(), savedProj.getTitle(), savedProj.getDescription(), user.getId(),
                savedProj.getStatus(), savedProj.getDeadline(), "/projects/" + savedProj.getId() + "/image"
        );
    }

    public List<ProjectResponse> getAllProjects(int pageNo, int pageSize){

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        Pageable pageable = PageRequest.of(pageNo, pageSize);

        Page<Project> projects;
        if(user.getRole() == Role.ROLE_ADMIN){
            projects = projectRepo.findAll(pageable);
        }
        else{
            projects = projectRepo.findByCreatedBy_EmailOrTasks_AssignedTo_Email(email, email, pageable);
        }

        return projects.getContent()
                .stream()
                .map(project -> new ProjectResponse(
                        project.getId(), project.getTitle(), project.getDescription(), project.getCreatedBy().getId(),
                        project.getStatus(), project.getDeadline(), "/projects/" + project.getId() + "/image"
                ))
                .toList();
    }

    public ProjectResponse getProjectById(Long id){

        Project project = projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project Not Found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User Not Found"));

        if(user.getRole() != Role.ROLE_ADMIN && !project.getCreatedBy().getEmail().equals(email) &&
                !taskRepo.existsByProject_IdAndAssignedTo_Email(project.getId(), email)){
            throw new RuntimeException("Not Allowed");
        }

        return new ProjectResponse(
                project.getId(), project.getTitle(), project.getDescription(), project.getCreatedBy().getId(),
                project.getStatus(), project.getDeadline(), "/projects/" + project.getId() + "/image"
        );
    }

    public Project getEntityById(Long id){

        return projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project Not Found"));
    }

    public ProjectResponse updateProject(Long id, ProjectRequest request, MultipartFile image) throws IOException {

        Project project = projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project Not Found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        // Role-based authorization
        if(user.getRole() != Role.ROLE_ADMIN && !project.getCreatedBy().getEmail().equals(email)){
            throw new RuntimeException("You are not allowed to update this project");
        }

        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setStatus(request.status());
        project.setDeadline(request.deadline());

        if(image != null && !image.isEmpty()){
            project.setImageName(image.getOriginalFilename());
            project.setImageType(image.getContentType());
            project.setImageData(image.getBytes());
        }

        Project updated = projectRepo.save(project);

        return new ProjectResponse(
                updated.getId(), updated.getTitle(), updated.getDescription(), updated.getCreatedBy().getId(),
                updated.getStatus(), updated.getDeadline(), "/projects/" + updated.getId() + "/image"
        );
    }

    public void deleteProject(Long id){

        Project project = projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project Not Found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ROLE_ADMIN && !project.getCreatedBy().getEmail().equals(email)) {
            throw new RuntimeException("You are not allowed to delete this project");
        }

        projectRepo.delete(project);
    }

    public List<ProjectResponse> searchProjects(String title, int pageNo, int pageSize){

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(pageNo, pageSize);

        Page<Project> projects;

        if(user.getRole() == Role.ROLE_ADMIN){
            projects = projectRepo.findByTitleContainingIgnoreCase(title, pageable);
        }
        else{
            projects = projectRepo.findByTitleContainingIgnoreCaseAndCreatedBy_EmailOrTitleContainingIgnoreCaseAndTasks_AssignedTo_Email(title, email, title, email, pageable);
        }

        return projects.getContent()
                .stream()
                .map(project -> new ProjectResponse(
                        project.getId(), project.getTitle(), project.getDescription(), project.getCreatedBy().getId(),
                        project.getStatus(), project.getDeadline(), "/projects/" + project.getId() + "/image"
                ))
                .toList();
    }

    public ProjectResponse updateStatus(Long id, ProjectStatus status){

        Project project = projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project Not Found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ROLE_ADMIN && !project.getCreatedBy().getEmail().equals(email)) {
            throw new RuntimeException("You are not allowed to update status");
        }

        project.setStatus(status);
        Project updated = projectRepo.save(project);

        return new ProjectResponse(
                updated.getId(), updated.getTitle(), updated.getDescription(), updated.getCreatedBy().getId(),
                updated.getStatus(), updated.getDeadline(), "/projects/" + updated.getId() + "/image"
        );
    }

}

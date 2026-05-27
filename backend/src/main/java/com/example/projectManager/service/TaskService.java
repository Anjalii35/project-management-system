package com.example.projectManager.service;

import com.example.projectManager.dtos.TaskRequest;
import com.example.projectManager.dtos.TaskResponse;
import com.example.projectManager.enums.Role;
import com.example.projectManager.enums.TaskStatus;
import com.example.projectManager.model.Project;
import com.example.projectManager.model.Task;
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

import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepo taskRepo;
    @Autowired
    private ProjectRepo projectRepo;
    @Autowired
    private UserRepo userRepo;

    public TaskResponse createTask(TaskRequest taskRequest){

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepo.findById(taskRequest.projectId())
                .orElseThrow(() -> new RuntimeException("Project Not Found"));

        if (currentUser.getRole() != Role.ROLE_ADMIN &&
                !project.getCreatedBy().getEmail().equals(email)) {

            throw new RuntimeException("Not allowed to create task in this project");
        }

        User user = userRepo.findById(taskRequest.assignedToId())
                .orElseThrow(() -> new RuntimeException("Assigned User Not Found"));

        Task task = new Task();
        task.setTitle(taskRequest.title());
        task.setDescription(taskRequest.description());
        task.setStatus(taskRequest.status());
        task.setDeadline(taskRequest.deadline());
        task.setPriority(taskRequest.priority());
        task.setProject(project);
        task.setAssignedTo(user);

        Task saved = taskRepo.save(task);

        return new TaskResponse(
                saved.getId(), saved.getTitle(), saved.getDescription(), saved.getStatus(), saved.getDeadline(),
                saved.getPriority(),  saved.getProject().getId(), saved.getAssignedTo().getId()
        );
    }

    public List<TaskResponse> getAllTasks(int pageNo, int pageSize){

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User Not Found"));

        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<Task> tasks;

        if(user.getRole() == Role.ROLE_ADMIN){
            tasks = taskRepo.findAll(pageable);
        }
        else{
            tasks = taskRepo.findByProject_CreatedBy_EmailOrAssignedTo_Email(email, email, pageable);
        }

        return tasks.getContent()
                .stream()
                .map(task -> new TaskResponse(
                        task.getId(), task.getTitle(), task.getDescription(), task.getStatus(), task.getDeadline(),
                        task.getPriority(), task.getProject().getId(), task.getAssignedTo().getId()
                ))
                .toList();
    }

    public TaskResponse getTaskById(Long id){

        Task task = taskRepo.findById(id).orElseThrow(() -> new RuntimeException("Task Not Found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(user.getRole() != Role.ROLE_ADMIN &&
                !task.getProject().getCreatedBy().getEmail().equals(email) &&
                !task.getAssignedTo().getEmail().equals(email)) {

            throw new RuntimeException("Not allowed");
        }

        return new TaskResponse(
                task.getId(), task.getTitle(), task.getDescription(), task.getStatus(), task.getDeadline(),
                task.getPriority(), task.getProject().getId(), task.getAssignedTo().getId()
        );
    }

    public TaskResponse updateTask(Long id, TaskRequest request){

        Task task = taskRepo.findById(id).orElseThrow(() -> new RuntimeException("Task Not Found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User currUser = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User Not Found"));

        if(currUser.getRole() != Role.ROLE_ADMIN && !task.getProject().getCreatedBy().getEmail().equals(email)){
            throw new RuntimeException("Not allowed to update task");
        }

        Project project = projectRepo.findById(request.projectId())
                .orElseThrow(() -> new RuntimeException("Project Not Found"));

        User user = userRepo.findById(request.assignedToId())
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setDeadline(request.deadline());
        task.setPriority(request.priority());
        task.setProject(project);
        task.setAssignedTo(user);

        Task updated = taskRepo.save(task);

        return new TaskResponse(
                updated.getId(), updated.getTitle(), updated.getDescription(), updated.getStatus(), updated.getDeadline(),
                updated.getPriority(), updated.getProject().getId(), updated.getAssignedTo().getId()
        );

    }

    public void deleteTask(Long id){

        Task task = taskRepo.findById(id).orElseThrow(() -> new RuntimeException("Task Not Found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User currUser = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User Not Found"));
        if(currUser.getRole() != Role.ROLE_ADMIN && !task.getProject().getCreatedBy().getEmail().equals(email)){
            throw new RuntimeException("Not allowed to delete task");
        }

        taskRepo.delete(task);

    }

    public List<TaskResponse> getTasksByProject(Long projectId, int pageNo, int pageSize){

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<Task> tasks;

        if (user.getRole() == Role.ROLE_ADMIN) {
            tasks = taskRepo.findByProjectId(projectId, pageable);
        } else {
            tasks = taskRepo.findByProjectIdAndProject_CreatedBy_EmailOrProjectIdAndAssignedTo_Email(projectId, email,projectId, email, pageable);
        }

        return tasks.getContent()
                .stream()
                .map(task -> new TaskResponse(
                        task.getId(), task.getTitle(), task.getDescription(), task.getStatus(), task.getDeadline(),
                        task.getPriority(), task.getProject().getId(), task.getAssignedTo().getId()
                ))
                .toList();
    }

    public List<TaskResponse> getTasksByUser(Long userId, int pageNo, int pageSize){

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<Task> tasks;

        if (currentUser.getRole() == Role.ROLE_ADMIN ||
                currentUser.getId().equals(userId)) {

            tasks = taskRepo.findByAssignedToId(userId, pageable);
        } else {
            throw new RuntimeException("Not allowed");
        }

        return tasks.getContent()
                .stream()
                .map(task -> new TaskResponse(
                        task.getId(), task.getTitle(), task.getDescription(), task.getStatus(), task.getDeadline(),
                        task.getPriority(), task.getProject().getId(), task.getAssignedTo().getId()
                ))
                .toList();
    }

    public TaskResponse updateStatus(Long id, TaskStatus status){

        Task task = taskRepo.findById(id).orElseThrow(() -> new RuntimeException("Task Not Found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.ROLE_ADMIN &&
                !task.getProject().getCreatedBy().getEmail().equals(email) &&
                !task.getAssignedTo().getEmail().equals(email)) {

            throw new RuntimeException("Not allowed");
        }

        task.setStatus(status);
        Task updated = taskRepo.save(task);

        return new TaskResponse(
                updated.getId(), updated.getTitle(), updated.getDescription(), updated.getStatus(), updated.getDeadline(),
                updated.getPriority(), updated.getProject().getId(), updated.getAssignedTo().getId()
        );
    }

}

package com.example.projectManager.controller;

import com.example.projectManager.dtos.TaskRequest;
import com.example.projectManager.dtos.TaskResponse;
import com.example.projectManager.enums.TaskStatus;
import com.example.projectManager.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@RequestBody TaskRequest taskRequest){

        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(taskRequest));
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(@RequestParam(defaultValue = "0") int pageNo,
                                                          @RequestParam(defaultValue = "5") int pageSize){

        return ResponseEntity.ok(taskService.getAllTasks(pageNo, pageSize));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id){

        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id, @RequestBody TaskRequest request){

        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTask(@PathVariable Long id){

        taskService.deleteTask(id);
        return ResponseEntity.ok("Task Deleted Successfully !!");
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<List<TaskResponse>> getTasksByProject(@PathVariable Long projectId, @RequestParam(defaultValue = "0") int pageNo,
                                                                @RequestParam(defaultValue = "5") int pageSize){
        return ResponseEntity.ok(taskService.getTasksByProject(projectId, pageNo, pageSize));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<TaskResponse>> getTasksByUser(@PathVariable Long userId, @RequestParam(defaultValue = "0") int pageNo,
                                                             @RequestParam(defaultValue = "5") int pageSize){
        return ResponseEntity.ok(taskService.getTasksByUser(userId, pageNo, pageSize));
    }

    // update status only
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateStatus(@PathVariable Long id, @RequestParam TaskStatus status){

        return ResponseEntity.ok(taskService.updateStatus(id, status));
    }

}

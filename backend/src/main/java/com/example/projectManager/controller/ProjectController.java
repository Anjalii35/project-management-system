package com.example.projectManager.controller;

import com.example.projectManager.dtos.ProjectRequest;
import com.example.projectManager.dtos.ProjectResponse;
import com.example.projectManager.enums.ProjectStatus;
import com.example.projectManager.model.Project;
import com.example.projectManager.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> saveProject(@RequestPart ProjectRequest projectRequest,
                                                       @RequestPart MultipartFile imageFile) throws IOException {
        ProjectResponse projRes = projectService.saveProject(projectRequest, imageFile);

        return ResponseEntity.status(HttpStatus.CREATED).body(projRes);
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects(@RequestParam(defaultValue = "0") int pageNo,
                                                                @RequestParam(defaultValue = "5") int pageSize){

        return ResponseEntity.status(HttpStatus.OK).body(projectService.getAllProjects(pageNo, pageSize));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long id){

        return ResponseEntity.status(HttpStatus.OK).body(projectService.getProjectById(id));
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getProjectImage(@PathVariable Long id){

        Project project = projectService.getEntityById(id);

        return ResponseEntity.status(HttpStatus.OK).body(project.getImageData());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable Long id, @RequestPart ProjectRequest projectRequest,
                                                         @RequestPart(required = false) MultipartFile imageFile) throws IOException {

        return ResponseEntity.status(HttpStatus.OK).body(projectService.updateProject(id, projectRequest, imageFile));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProject(@PathVariable Long id){

        projectService.deleteProject(id);
        return ResponseEntity.status(HttpStatus.OK).body("Project Deleted Successfully !!");
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProjectResponse>> searchProjects(@RequestParam String title, @RequestParam(defaultValue = "0") int pageNo,
                                                                @RequestParam(defaultValue = "5") int pageSize){

        return ResponseEntity.status(HttpStatus.OK).body(projectService.searchProjects(title, pageNo, pageSize));
    }

    // update status only
    @PatchMapping("/{id}/status")
    public ResponseEntity<ProjectResponse> updateStatus(@PathVariable Long id, @RequestParam ProjectStatus status){

        return ResponseEntity.ok(projectService.updateStatus(id, status));
    }
}

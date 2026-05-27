package com.example.projectManager.controller;

import com.example.projectManager.dtos.UserRequest;
import com.example.projectManager.dtos.UserResponse;
import com.example.projectManager.model.User;
import com.example.projectManager.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestPart UserRequest userRequest, @RequestPart MultipartFile imageFile) throws IOException {

        UserResponse userRes = userService.saveUser(userRequest, imageFile);

        return ResponseEntity.status(HttpStatus.CREATED).body(userRes);
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers(@RequestParam(defaultValue = "0") int pageNo,
                                                          @RequestParam(defaultValue = "5") int pageSize){

        return ResponseEntity.status(HttpStatus.OK).body(userService.getAllUsers(pageNo, pageSize));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable("id") Long id){

        return ResponseEntity.status(HttpStatus.OK).body(userService.getUserById(id));
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImageByUserId(@PathVariable Long id){

        User user = userService.getUserEntityById(id);
        return ResponseEntity.status(HttpStatus.OK)
                .header("Content-Type", user.getImageType())
                .body(user.getImageData());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestPart UserRequest userRequest,
                                                   @RequestPart(required = false) MultipartFile imageFile) throws IOException {

        return ResponseEntity.status(HttpStatus.OK).body(userService.updateUser(id, userRequest, imageFile));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id){

        userService.deleteUser(id);
        return ResponseEntity.status(HttpStatus.OK).body("User Deleted Successfully !!");
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String name, @RequestParam(defaultValue = "0") int pageNo,
                                                          @RequestParam(defaultValue = "5") int pageSize){

        return ResponseEntity.status(HttpStatus.OK).body(userService.searchUsers(name, pageNo, pageSize));
    }
}

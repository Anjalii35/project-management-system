package com.example.projectManager.service;

import com.example.projectManager.dtos.UserRequest;
import com.example.projectManager.dtos.UserResponse;
import com.example.projectManager.enums.Role;
import com.example.projectManager.model.User;
import com.example.projectManager.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserResponse saveUser(UserRequest userRequest, MultipartFile image) throws IOException {

        User user = new User();
        user.setName(userRequest.name());
        user.setEmail(userRequest.email());
        user.setPassword(
                passwordEncoder.encode(userRequest.password())
        );

        if(userRepo.count() == 0){
            user.setRole(Role.ROLE_ADMIN);
        }
        else{
            user.setRole(Role.ROLE_USER);
        }
        user.setImageName(image.getOriginalFilename());
        user.setImageType(image.getContentType());
        user.setImageData(image.getBytes());

        User savedUser = userRepo.save(user);
        return new UserResponse(
                savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole(), "/users/" + savedUser.getId() + "/image"
        );
    }

    public List<UserResponse> getAllUsers(int pageNo, int pageSize){

//        String email = SecurityContextHolder.getContext().getAuthentication().getName();
//
//        User currentUser = userRepo.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        if(currentUser.getRole() != Role.ROLE_ADMIN){
//            throw new RuntimeException("Only admin allowed");
//        }

        Pageable pageable = PageRequest.of(pageNo, pageSize);  //pageable contains instructins(how much, which page, sorting)
        Page<User> users = userRepo.findAll(pageable);     //page have actual data + metadata

        return users.getContent()
                .stream()                  //stream means start processing list
                .map(user -> new UserResponse(
                        user.getId(), user.getName(), user.getEmail(), user.getRole(), "/users/" + user.getId() + "/image"
                ))                      // map means convert each user into UserResponse
                .toList();            // collect result into list
    }

    public UserResponse getUserById(Long id){

        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User Not Found"));

//        String email = SecurityContextHolder.getContext().getAuthentication().getName();
//
//        User currentUser = userRepo.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        if (currentUser.getRole() != Role.ROLE_ADMIN &&
//                !user.getEmail().equals(email)) {
//
//            throw new RuntimeException("You are not allowed to view this user");
//        }

        return new UserResponse(
          user.getId(), user.getName(), user.getEmail(), user.getRole(), "/users/" + user.getId() + "/image"
        );
    }

    public User getUserEntityById(Long id){

        return userRepo.findById(id).orElseThrow(() -> new RuntimeException("User Not Found"));
    }

    public UserResponse updateUser(Long id, UserRequest request, MultipartFile image) throws IOException {

        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User Not Found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.ROLE_ADMIN &&
                !user.getEmail().equals(email)) {

            throw new RuntimeException("You are not allowed to update this user");
        }

        user.setName(request.name());
        user.setEmail(request.email());

        if(request.password() != null && !request.password().isBlank()){
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        if(image != null && !image.isEmpty()){
            user.setImageName(image.getOriginalFilename());
            user.setImageType(image.getContentType());
            user.setImageData(image.getBytes());
        }

        User updated = userRepo.save(user);

        return new UserResponse(
                updated.getId(), updated.getName(), updated.getEmail(), updated.getRole(), "/users/" + updated.getId() + "/image"
        );
    }

    public void deleteUser(Long id){

        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User Not Found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.ROLE_ADMIN &&
                !user.getEmail().equals(email)) {

            throw new RuntimeException("You are not allowed to delete this user");
        }

        userRepo.delete(user);
    }

    public List<UserResponse> searchUsers(String name, int pageNo, int pageSize){

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(currentUser.getRole() != Role.ROLE_ADMIN){
            throw new RuntimeException("Only admin allowed");
        }

        Pageable pageable = PageRequest.of(pageNo, pageSize);

        Page<User> users = userRepo.findByNameContainingIgnoreCase(name, pageable);

        return users.getContent()
                .stream()
                .map(user -> new UserResponse(
                   user.getId(), user.getName(), user.getEmail(), user.getRole(), "/users/" + user.getId() + "/image"
                ))
                .toList();
    }

}

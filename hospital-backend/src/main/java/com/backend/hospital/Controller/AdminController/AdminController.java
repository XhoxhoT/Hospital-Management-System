package com.backend.hospital.Controller.AdminController;

import com.backend.hospital.DTO.CreateUserRequest;
import com.backend.hospital.DTO.UserDTO;
import com.backend.hospital.Service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/users")
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(201).body(adminService.createUser(request));
    }
}

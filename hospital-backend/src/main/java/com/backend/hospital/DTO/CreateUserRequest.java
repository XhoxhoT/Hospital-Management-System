package com.backend.hospital.DTO;

import com.backend.hospital.Enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @NotNull
    private Role role;

    // Required only when role is DEPARTMENT_STAFF
    private Long departmentId;

    // Only meaningful for DEPARTMENT_STAFF; grants write access to their department
    private boolean privileged = false;
}

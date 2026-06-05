package com.backend.hospital.Service;

import com.backend.hospital.DTO.CreateUserRequest;
import com.backend.hospital.DTO.UserDTO;
import com.backend.hospital.Entity.Department;
import com.backend.hospital.Entity.User;
import com.backend.hospital.Enums.Role;
import com.backend.hospital.Exceptions.BadRequestException;
import com.backend.hospital.Exceptions.ResourceNotFoundException;
import com.backend.hospital.Repository.DepartmentRepository;
import com.backend.hospital.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDTO createUser(CreateUserRequest request) {
        Department department = null;

        boolean privileged = false;
        if (request.getRole() == Role.DEPARTMENT_STAFF) {
            if (request.getDepartmentId() == null) {
                throw new BadRequestException("departmentId is required for DEPARTMENT_STAFF role");
            }
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department with id " + request.getDepartmentId() + " not found"));
            privileged = request.isPrivileged();
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .department(department)
                .privileged(privileged)
                .build();

        User saved = userRepository.save(user);

        return new UserDTO(
                saved.getId(),
                saved.getUsername(),
                saved.getRole(),
                saved.getDepartment() != null ? saved.getDepartment().getId() : null,
                saved.getDepartment() != null ? saved.getDepartment().getName() : null,
                saved.isPrivileged()
        );
    }
}

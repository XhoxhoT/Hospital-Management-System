package com.backend.hospital.Controller.DepartmentController;

import com.backend.hospital.DTO.CreateDepartment;
import com.backend.hospital.DTO.DepartmentAvailabilityDto;
import com.backend.hospital.Entity.Department;
import com.backend.hospital.Service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private DepartmentService departmentService;


    @GetMapping
    public ResponseEntity<List<DepartmentAvailabilityDto>> getAllDepartments() {

        List<Department> departments = departmentService.getAllDepartments();

        List<DepartmentAvailabilityDto> response = departments.stream()
                .map(dep -> new DepartmentAvailabilityDto(
                        dep.getId(),
                        dep.getName(),
                        departmentService.getFreeBeds(dep.getId()),
                        departmentService.getTotalBeds(dep.getId())
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Department> createDepartment(
            @Valid @RequestBody CreateDepartment dto) {

        Department department = Department.builder()
                .name(dto.getName())
                .build();

        Department savedDepartment = departmentService.createDepartment(department);

        return ResponseEntity.status(201).body(savedDepartment);
    }




}

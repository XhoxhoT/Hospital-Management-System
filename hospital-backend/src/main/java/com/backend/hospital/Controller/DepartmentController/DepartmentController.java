package com.backend.hospital.Controller.DepartmentController;

import com.backend.hospital.DTO.CreateDepartment;
import com.backend.hospital.DTO.DepartmentAvailabilityDto;
import com.backend.hospital.DTO.DepartmentDTO;
import com.backend.hospital.Entity.Department;
import com.backend.hospital.Service.DepartmentService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/departments")
@AllArgsConstructor
public class DepartmentController {

    private DepartmentService departmentService;
    private ModelMapper modelMapper;


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
    public ResponseEntity<DepartmentDTO> createDepartment(
            @Valid @RequestBody CreateDepartment dto) {
        DepartmentDTO departmentDTO = departmentService.createDepartment(dto);
        return ResponseEntity.status(201).body(departmentDTO);
    }




}

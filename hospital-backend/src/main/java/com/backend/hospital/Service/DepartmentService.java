package com.backend.hospital.Service;

import java.util.*;

import com.backend.hospital.DTO.CreateDepartment;
import com.backend.hospital.DTO.DepartmentDTO;
import com.backend.hospital.Entity.Department;
import com.backend.hospital.Enums.BedStatus;
import com.backend.hospital.Exceptions.ResourceNotFoundException;
import com.backend.hospital.Repository.BedRepository;
import com.backend.hospital.Repository.DepartmentRepository;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class DepartmentService {

    private DepartmentRepository departmentRepository;
    private BedRepository bedRepository;
    private ModelMapper modelMapper;


    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    // Admin: create department
    public DepartmentDTO createDepartment(CreateDepartment createDepartment) {

        Department department = modelMapper.map(createDepartment, Department.class);
        return modelMapper.map(departmentRepository.save(department), DepartmentDTO.class);
    }

    public long getFreeBeds(Long departmentId) {
        return bedRepository.countByRoom_Department_IdAndStatus(
                departmentId,
                BedStatus.FREE
        );
    }

    public long getTotalBeds(Long departmentId){
        return bedRepository.countByRoom_Department_IdAndStatusIn(departmentId, List.of(BedStatus.FREE, BedStatus.OCCUPIED));
    }


}

package com.backend.hospital.Service;

import java.util.*;

import com.backend.hospital.Entity.Department;
import com.backend.hospital.Enums.BedStatus;
import com.backend.hospital.Exceptions.ResourceNotFoundException;
import com.backend.hospital.Repository.BedRepository;
import com.backend.hospital.Repository.DepartmentRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class DepartmentService {

    private DepartmentRepository departmentRepository;
    private BedRepository bedRepository;


    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    // Admin: create department
    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public long getFreeBeds(Long departmentId) {
        return bedRepository.countByRoom_Department_IdAndStatus(
                departmentId,
                BedStatus.FREE
        );
    }

    public long getTotalBeds(Long departmentId){
        return bedRepository.countByRoom_Department_IdAndStatusIn(List.of(BedStatus.FREE, BedStatus.OCCUPIED));
    }


}

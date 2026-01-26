package com.backend.hospital.Service;

import com.backend.hospital.Entity.Department;
import com.backend.hospital.Entity.Room;
import com.backend.hospital.Exceptions.ResourceNotFoundException;
import com.backend.hospital.Repository.DepartmentRepository;
import com.backend.hospital.Repository.RoomRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@AllArgsConstructor
public class RoomService {

    private RoomRepository roomRepository;
    private DepartmentRepository departmentRepository;


    public Room createRoom(Long departmentId,Room room){

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                " Room could not be created because" +
                                        " department with id " + departmentId + " not found"
                        ));

        room.setDepartment(department);
        return roomRepository.save(room);
    }

    public List<Room> getRoomsByDepartment(Long departmentId) {
        return roomRepository.findByDepartmentId(departmentId);
    }
}

package com.backend.hospital.Service;


import com.backend.hospital.DTO.CreateRoom;
import com.backend.hospital.DTO.RoomDTO;
import com.backend.hospital.Entity.Department;
import com.backend.hospital.Entity.Room;
import com.backend.hospital.Exceptions.ResourceNotFoundException;
import com.backend.hospital.Repository.DepartmentRepository;
import com.backend.hospital.Repository.RoomRepository;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.*;

import java.util.*;

@Service
@AllArgsConstructor
public class RoomService {

    private RoomRepository roomRepository;
    private DepartmentRepository departmentRepository;
    private ModelMapper modelMapper;


    public RoomDTO createRoom(CreateRoom createRoom){

        System.out.println(createRoom.getDepartmentId());
        Department department = departmentRepository.findById(createRoom.getDepartmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                " Room could not be created because" +
                                        " department with id " + createRoom.getDepartmentId() + " not found"
                        ));

        System.out.println("test");
        Room room = modelMapper.map(createRoom, Room.class);
        room.setDepartment(department);
        Room savedRoom = roomRepository.save(room);
        return convertToDTO(savedRoom);
    }

    public List<RoomDTO> getRoomsByDepartment(Long departmentId) {

        List<RoomDTO> roomDTOS = roomRepository.findByDepartmentId(departmentId)
                .stream()
                .map(room -> modelMapper.map(room, RoomDTO.class))
                .toList();

        return roomDTOS;

    }

    private RoomDTO convertToDTO(Room room) {
        return modelMapper.map(room, RoomDTO.class);
    }
}

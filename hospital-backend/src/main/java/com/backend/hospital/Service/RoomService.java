package com.backend.hospital.Service;


import com.backend.hospital.DTO.CreateRoom;
import com.backend.hospital.DTO.RoomDTO;
import com.backend.hospital.Entity.Department;
import com.backend.hospital.Entity.Room;
import com.backend.hospital.Entity.User;
import com.backend.hospital.Enums.Role;
import com.backend.hospital.Exceptions.ResourceNotFoundException;
import com.backend.hospital.Repository.BedStatusHistoryRepository;
import com.backend.hospital.Repository.DepartmentRepository;
import com.backend.hospital.Repository.RoomRepository;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@AllArgsConstructor
public class RoomService {

    private RoomRepository roomRepository;
    private DepartmentRepository departmentRepository;
    private BedStatusHistoryRepository bedStatusHistoryRepository;
    private ModelMapper modelMapper;


    public RoomDTO createRoom(CreateRoom createRoom){

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user && user.getRole() == Role.DEPARTMENT_STAFF) {
            Long userDeptId = user.getDepartment() != null ? user.getDepartment().getId() : null;
            if (!createRoom.getDepartmentId().equals(userDeptId)) {
                throw new AccessDeniedException("You can only add rooms to your own department");
            }
        }

        Department department = departmentRepository.findById(createRoom.getDepartmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room could not be created because" +
                                        " department with id " + createRoom.getDepartmentId() + " not found"
                        ));

        Room room = modelMapper.map(createRoom, Room.class);
        room.setDepartment(department);
        Room savedRoom = roomRepository.save(room);
        return convertToDTO(savedRoom);
    }

    @Transactional
    public RoomDTO updateRoomName(Long roomId, String newName) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room with id " + roomId + " not found"));

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user && user.getRole() == Role.DEPARTMENT_STAFF) {
            Long userDeptId = user.getDepartment() != null ? user.getDepartment().getId() : null;
            if (!room.getDepartment().getId().equals(userDeptId)) {
                throw new AccessDeniedException("You can only edit rooms in your own department");
            }
        }

        room.setRoomNumber(newName);
        return convertToDTO(roomRepository.save(room));
    }

    @Transactional
    public void deleteRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room with id " + roomId + " not found"));

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user && user.getRole() == Role.DEPARTMENT_STAFF) {
            Long userDeptId = user.getDepartment() != null ? user.getDepartment().getId() : null;
            if (!room.getDepartment().getId().equals(userDeptId)) {
                throw new AccessDeniedException("You can only delete rooms from your own department");
            }
        }

        bedStatusHistoryRepository.deleteByBedRoomId(roomId);
        roomRepository.delete(room);
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

package com.backend.hospital.Controller.RoomsController;

import com.backend.hospital.DTO.CreateRoom;
import com.backend.hospital.DTO.RoomDTO;
import com.backend.hospital.DTO.UpdateNameRequest;
import com.backend.hospital.Entity.Room;
import com.backend.hospital.Service.RoomService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;


@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class RoomsController {

    private RoomService roomService;

    private ModelMapper modelMapper;

    @GetMapping("/department/{departmentId}/rooms")
    public ResponseEntity<List<RoomDTO>> getRoomsByDepartment(
            @PathVariable Long departmentId) {

        return ResponseEntity.ok(
                roomService.getRoomsByDepartment(departmentId)
        );
    }


    @PostMapping("/rooms/room")
    public ResponseEntity<RoomDTO> createRoom(
            @Valid @RequestBody CreateRoom dto) {

        RoomDTO roomDTO =  roomService.createRoom(dto);

        return ResponseEntity.status(201).body(roomDTO);
    }

    @PatchMapping("/rooms/{roomId}")
    public ResponseEntity<RoomDTO> updateRoomName(
            @PathVariable Long roomId,
            @Valid @RequestBody UpdateNameRequest request) {
        return ResponseEntity.ok(roomService.updateRoomName(roomId, request.getName()));
    }

    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId) {
        roomService.deleteRoom(roomId);
        return ResponseEntity.noContent().build();
    }
}

package com.backend.hospital.DTO;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoomDTO {

    private Long id;

    private String roomNumber;

    private Long departmentId;
}

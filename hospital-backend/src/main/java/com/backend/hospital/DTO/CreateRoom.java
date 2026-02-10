package com.backend.hospital.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateRoom {

    @NotBlank
    private String roomNumber;

    @NotNull
    private Long departmentId;
}

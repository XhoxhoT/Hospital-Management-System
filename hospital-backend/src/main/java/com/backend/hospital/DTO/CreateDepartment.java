package com.backend.hospital.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class CreateDepartment {

    @NotBlank
    private String name;

}

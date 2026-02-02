package com.backend.hospital.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DepartmentAvailabilityDto {

    private Long id;
    private String name;
    private long freeBeds;
    private long totalBeds;
}

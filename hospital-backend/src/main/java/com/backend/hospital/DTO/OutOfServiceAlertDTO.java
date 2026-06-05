package com.backend.hospital.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class OutOfServiceAlertDTO {
    private Long bedId;
    private String bedNumber;
    private String roomNumber;
    private String departmentName;
    private LocalDateTime outOfServiceSince;
    private long minutesInStatus;
}

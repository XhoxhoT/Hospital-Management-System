package com.backend.hospital.DTO;

import com.backend.hospital.Enums.BedStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class BedStatusHistoryDTO {
    private Long id;
    private BedStatus previousStatus;
    private BedStatus newStatus;
    private LocalDateTime changedAt;
    private String changedBy;
}

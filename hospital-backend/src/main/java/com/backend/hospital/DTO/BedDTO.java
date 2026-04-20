package com.backend.hospital.DTO;

import com.backend.hospital.Enums.BedStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class BedDTO {

    private Long bedId;
    private String bednumber;
    private BedStatus bedStatus;
    private Long roomId;
    private LocalDateTime statusSince;
}

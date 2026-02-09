package com.backend.hospital.DTO;

import com.backend.hospital.Enums.BedStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BedDTO {

    private Long bedId;
    private String bednumber;
    private BedStatus bedStatus;
    private Long roomId;
}

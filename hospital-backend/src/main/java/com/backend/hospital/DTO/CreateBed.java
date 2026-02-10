package com.backend.hospital.DTO;


import com.backend.hospital.Enums.BedStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBed {

    private String bedNumber;

    private Long roomId;

}

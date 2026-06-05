package com.backend.hospital.DTO;


import com.backend.hospital.Enums.BedStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeStatus {

    @NotNull
    private BedStatus bedStatus;
}

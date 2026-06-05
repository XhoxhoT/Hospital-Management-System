package com.backend.hospital.DTO;

import com.backend.hospital.Enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private Role role;
    private Long departmentId;
    private String departmentName;
    private boolean privileged;
}

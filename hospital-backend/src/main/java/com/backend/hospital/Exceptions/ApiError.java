package com.backend.hospital.Exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
@Setter
public class ApiError {

    private String code;
    private String message;
    private LocalDateTime timestamp;

    public ApiError(String code, String message) {
        this.code = code;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }


}


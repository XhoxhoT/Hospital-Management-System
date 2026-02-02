package com.backend.hospital.Exceptions;

public class StatusCouldNotBeChanged extends RuntimeException {
    public StatusCouldNotBeChanged(String message) {
        super(message);
    }
}

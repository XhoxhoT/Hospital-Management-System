package com.backend.hospital.Exceptions;

public class BedNotAvailableException extends RuntimeException {
    public BedNotAvailableException(String message) {
        super(message);
    }
}

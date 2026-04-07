package com.backend.hospital.Exceptions;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler extends RuntimeException {


    @ExceptionHandler(BedNotAvailableException.class)
    public ResponseEntity<?> handleBedNotAvailable(BedNotAvailableException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiError("BED_NOT_AVAILABLE", ex.getMessage()));
    }


    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ApiError("NOT_FOUND", ex.getMessage()))
                ;
    }

    @ExceptionHandler(StatusCouldNotBeChanged.class)
    public ResponseEntity<?> handleStatusCouldNotBeChanged(StatusCouldNotBeChanged ex){
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiError("BAD_REQUEST", ex.getMessage()))
                ;
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex) {

        String message = "Duplicate value";

        Throwable root = ex.getRootCause();

        if (root instanceof org.hibernate.exception.ConstraintViolationException constraintEx) {

            String constraintName = constraintEx.getConstraintName();

            if (constraintName != null && constraintName.contains("_")) {


                String[] parts = constraintName.split("_");

                if (parts.length >= 2) {
                    String field = parts[1];
                    message = field.substring(0, 1).toUpperCase() + field.substring(1)
                            + " already exists";
                }
            }
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiError("BAD_REQUEST", message));
    }



}

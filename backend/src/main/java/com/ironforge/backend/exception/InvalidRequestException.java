package com.ironforge.backend.exception;

public class InvalidRequestException extends AppException {

    public InvalidRequestException(String entity, String detail) {
        super(entity + "Invalid", detail);
    }
}

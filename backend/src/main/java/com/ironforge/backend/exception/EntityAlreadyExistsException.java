package com.ironforge.backend.exception;

public class EntityAlreadyExistsException extends AppException {

    public EntityAlreadyExistsException(String entity, String detail) {
        super(entity + "AlreadyExists", detail);
    }
}

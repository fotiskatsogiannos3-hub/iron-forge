package com.ironforge.backend.exception;

public class EntityNotFoundException extends AppException {

    public EntityNotFoundException(String entity, Long id) {
        super(entity + "NotFound", entity + " with id=" + id + " was not found");
    }

    public EntityNotFoundException(String entity, String detail) {
        super(entity + "NotFound", detail);
    }
}

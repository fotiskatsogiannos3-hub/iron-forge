package com.ironforge.backend.exception;

import java.util.Map;

public record ValidationErrorResponse(String code, String message, Map<String, String> fieldErrors) {
}

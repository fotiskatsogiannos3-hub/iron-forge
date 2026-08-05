package com.ironforge.backend.dto.auth;

public record LoginResponseDTO(
        String token,
        String username,
        String role
) {
}

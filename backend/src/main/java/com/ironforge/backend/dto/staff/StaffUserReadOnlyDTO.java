package com.ironforge.backend.dto.staff;

public record StaffUserReadOnlyDTO(
        Long id,
        String username,
        String email,
        String roleName
) {
}

package com.ironforge.backend.dto.staff;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record StaffUserInsertDTO(
        @NotBlank String username,
        @NotBlank @Email String email,
        @NotBlank String password,
        @NotBlank String roleName
) {
}

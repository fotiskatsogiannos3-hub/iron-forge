package com.ironforge.backend.dto.staff;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record StaffUserUpdateDTO(
        @NotBlank @Email String email,
        @NotBlank String roleName
) {
}

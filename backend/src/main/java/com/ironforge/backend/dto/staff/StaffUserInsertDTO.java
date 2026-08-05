package com.ironforge.backend.dto.staff;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record StaffUserInsertDTO(
        @NotBlank String username,
        @NotBlank @Email String email,
        @NotBlank
        @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
        @Pattern(
                regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&+=]).{8,}$",
                message = "Password must contain at least one uppercase letter, one lowercase letter, one digit and one special character"
        )
        String password,
        @NotBlank String roleName
) {
}
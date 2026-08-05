package com.ironforge.backend.dto.member;

import java.time.LocalDate;

public record MemberReadOnlyDTO(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        LocalDate dateOfBirth,
        LocalDate joinDate
) {
}

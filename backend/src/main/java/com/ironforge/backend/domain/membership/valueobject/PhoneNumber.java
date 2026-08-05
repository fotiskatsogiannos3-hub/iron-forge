package com.ironforge.backend.domain.membership.valueobject;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.regex.Pattern;

/**
 * PhoneNumber value object, embedded on Member.
 * Accepts digits, spaces, +, and - (kept permissive since gym members may register
 * with international numbers), with a sane minimum length.
 */
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PhoneNumber {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^[+]?[0-9 \\-]{7,20}$");

    @Column(name = "phone_number", nullable = false)
    private String value;

    public PhoneNumber(String value) {
        if (value == null || !PHONE_PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("Invalid phone number: " + value);
        }
        this.value = value;
    }

    @Override
    public String toString() {
        return value;
    }
}

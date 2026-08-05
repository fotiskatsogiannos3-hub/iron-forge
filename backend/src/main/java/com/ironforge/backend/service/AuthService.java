package com.ironforge.backend.service;

import com.ironforge.backend.dto.auth.LoginRequestDTO;
import com.ironforge.backend.dto.auth.LoginResponseDTO;

public interface AuthService {

    LoginResponseDTO login(LoginRequestDTO dto);
}

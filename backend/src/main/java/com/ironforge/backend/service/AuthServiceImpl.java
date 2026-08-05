package com.ironforge.backend.service;

import com.ironforge.backend.dto.auth.LoginRequestDTO;
import com.ironforge.backend.dto.auth.LoginResponseDTO;
import com.ironforge.backend.security.JwtService;
import com.ironforge.backend.security.StaffUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public LoginResponseDTO login(LoginRequestDTO dto) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.username(), dto.password()));

        StaffUserPrincipal principal = (StaffUserPrincipal) authentication.getPrincipal();
        String role = principal.getRoleName();
        String token = jwtService.generateToken(principal.getUsername(), role);

        return new LoginResponseDTO(token, principal.getUsername(), role);
    }
}

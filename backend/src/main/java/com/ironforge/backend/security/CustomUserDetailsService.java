package com.ironforge.backend.security;

import com.ironforge.backend.repository.StaffUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final StaffUserRepository staffUserRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return staffUserRepository.findByUsernameAndDeletedFalse(username)
                .map(staffUser -> new StaffUserPrincipal(staffUser, staffUser.getRole().getName()))
                .orElseThrow(() -> new UsernameNotFoundException("No staff user with username " + username));
    }
}

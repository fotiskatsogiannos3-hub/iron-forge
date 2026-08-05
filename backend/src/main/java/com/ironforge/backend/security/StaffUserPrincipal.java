package com.ironforge.backend.security;

import com.ironforge.backend.domain.identity.StaffUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

// Wraps StaffUser so Spring Security can work with it without the domain entity
// needing to implement UserDetails itself.
public class StaffUserPrincipal implements UserDetails {

    private final StaffUser staffUser;
    private final String roleName;

    // roleName is captured up front (while the loading transaction/session is still open)
    // instead of read lazily from staffUser.getRole().getName(): callers like
    // JwtAuthenticationFilter invoke getAuthorities() well after the Hibernate session that
    // loaded this principal has closed, so a lazy read there throws LazyInitializationException.
    public StaffUserPrincipal(StaffUser staffUser, String roleName) {
        this.staffUser = staffUser;
        this.roleName = roleName;
    }

    public StaffUser getStaffUser() {
        return staffUser;
    }

    public String getRoleName() {
        return roleName;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + roleName));
    }

    @Override
    public String getPassword() {
        return staffUser.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return staffUser.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !staffUser.isDeleted();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return !staffUser.isDeleted();
    }
}

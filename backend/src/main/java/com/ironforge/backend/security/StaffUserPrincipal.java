package com.ironforge.backend.security;

import com.ironforge.backend.domain.identity.StaffUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

// Adapter so StaffUser does not need to implement UserDetails.
public class StaffUserPrincipal implements UserDetails {

    private final StaffUser staffUser;
    private final String roleName;

    // Eager role name avoids LazyInitializationException after the loading session closes.
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

package com.ironforge.backend.repository;

import com.ironforge.backend.domain.identity.StaffUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StaffUserRepository extends JpaRepository<StaffUser, Long> {

    Optional<StaffUser> findByUsernameAndDeletedFalse(String username);

    Page<StaffUser> findAllByDeletedFalse(Pageable pageable);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}

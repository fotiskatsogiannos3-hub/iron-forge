package com.ironforge.backend.repository;

import com.ironforge.backend.domain.membership.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Page<Member> findAllByDeletedFalse(Pageable pageable);

    Optional<Member> findByIdAndDeletedFalse(Long id);

    boolean existsByEmail_ValueIgnoreCaseAndDeletedFalse(String email);

    Page<Member> findAllByDeletedFalseAndFirstNameContainingIgnoreCaseOrDeletedFalseAndLastNameContainingIgnoreCase(
            String firstName, String lastName, Pageable pageable);
}
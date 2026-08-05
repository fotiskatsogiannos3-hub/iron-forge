package com.ironforge.backend.repository;

import com.ironforge.backend.domain.membership.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    @Query(value = "SELECT s FROM Subscription s JOIN FETCH s.member JOIN FETCH s.plan ORDER BY s.createdAt DESC",
            countQuery = "SELECT COUNT(s) FROM Subscription s")
    Page<Subscription> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT s FROM Subscription s JOIN FETCH s.plan WHERE s.member.id = :memberId ORDER BY s.createdAt DESC")
    List<Subscription> findAllByMember_IdOrderByCreatedAtDesc(Long memberId);

    boolean existsByMember_IdAndEndDateGreaterThanEqual(Long memberId, LocalDate date);
}

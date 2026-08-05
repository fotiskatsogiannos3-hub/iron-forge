package com.ironforge.backend.domain.membership;

import com.ironforge.backend.domain.membership.enums.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

// Immutable historical record: once created a subscription is never edited, only its
// status can move ACTIVE -> EXPIRED/CANCELLED (still no field-by-field editing).
@Entity
@Table(name = "subscription")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plan_id", nullable = false)
    private SubscriptionPlan plan;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubscriptionStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = SubscriptionStatus.ACTIVE;
        }
    }

    public boolean isExpired() {
        return endDate.isBefore(LocalDate.now());
    }

    // status is only ever written to ACTIVE at creation time and never flipped by a
    // background job, so callers that care about the current state must go through this
    // instead of the raw, potentially-stale `status` field.
    public SubscriptionStatus getEffectiveStatus() {
        if (status == SubscriptionStatus.ACTIVE && isExpired()) {
            return SubscriptionStatus.EXPIRED;
        }
        return status;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Subscription that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}

package com.ironforge.backend.domain.membership;

import com.ironforge.backend.domain.membership.valueobject.Money;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Objects;

// Reference data, not soft-deletable. Plans are retired via the "active" flag instead,
// since past subscriptions still reference the plan they were bought under.
@Entity
@Table(name = "subscription_plan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Embedded
    @AttributeOverride(name = "amount", column = @Column(name = "price_amount"))
    @AttributeOverride(name = "currency", column = @Column(name = "price_currency"))
    private Money price;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof SubscriptionPlan plan)) return false;
        return Objects.equals(id, plan.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}

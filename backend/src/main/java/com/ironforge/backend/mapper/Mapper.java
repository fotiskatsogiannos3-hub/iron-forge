package com.ironforge.backend.mapper;

import com.ironforge.backend.domain.identity.Role;
import com.ironforge.backend.domain.identity.StaffUser;
import com.ironforge.backend.domain.membership.Member;
import com.ironforge.backend.domain.membership.Payment;
import com.ironforge.backend.domain.membership.Subscription;
import com.ironforge.backend.domain.membership.SubscriptionPlan;
import com.ironforge.backend.domain.membership.valueobject.Email;
import com.ironforge.backend.domain.membership.valueobject.Money;
import com.ironforge.backend.domain.membership.valueobject.PhoneNumber;
import com.ironforge.backend.dto.member.MemberInsertDTO;
import com.ironforge.backend.dto.member.MemberReadOnlyDTO;
import com.ironforge.backend.dto.member.MemberUpdateDTO;
import com.ironforge.backend.dto.payment.PaymentReadOnlyDTO;
import com.ironforge.backend.dto.staff.StaffUserInsertDTO;
import com.ironforge.backend.dto.staff.StaffUserReadOnlyDTO;
import com.ironforge.backend.dto.subscription.SubscriptionReadOnlyDTO;
import com.ironforge.backend.dto.subscriptionplan.SubscriptionPlanInsertDTO;
import com.ironforge.backend.dto.subscriptionplan.SubscriptionPlanReadOnlyDTO;
import com.ironforge.backend.dto.subscriptionplan.SubscriptionPlanUpdateDTO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class Mapper {

    public Member mapToMemberEntity(MemberInsertDTO dto) {
        Member member = new Member();
        member.setFirstName(dto.firstName());
        member.setLastName(dto.lastName());
        member.setEmail(new Email(dto.email()));
        member.setPhoneNumber(new PhoneNumber(dto.phoneNumber()));
        member.setDateOfBirth(dto.dateOfBirth());
        return member;
    }

    public void updateMemberFromDTO(Member member, MemberUpdateDTO dto) {
        member.setFirstName(dto.firstName());
        member.setLastName(dto.lastName());
        member.setEmail(new Email(dto.email()));
        member.setPhoneNumber(new PhoneNumber(dto.phoneNumber()));
        member.setDateOfBirth(dto.dateOfBirth());
    }

    public MemberReadOnlyDTO mapToMemberReadOnlyDTO(Member member) {
        return new MemberReadOnlyDTO(
                member.getId(),
                member.getFirstName(),
                member.getLastName(),
                member.getEmail().getValue(),
                member.getPhoneNumber().getValue(),
                member.getDateOfBirth(),
                member.getJoinDate()
        );
    }

    public SubscriptionPlan mapToSubscriptionPlanEntity(SubscriptionPlanInsertDTO dto) {
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setName(dto.name());
        plan.setDurationDays(dto.durationDays());
        plan.setPrice(new Money(dto.price(), dto.currency() == null ? "EUR" : dto.currency()));
        plan.setDescription(dto.description());
        plan.setActive(true);
        return plan;
    }

    public void updateSubscriptionPlanFromDTO(SubscriptionPlan plan, SubscriptionPlanUpdateDTO dto) {
        plan.setName(dto.name());
        plan.setDurationDays(dto.durationDays());
        plan.setPrice(new Money(dto.price(), dto.currency() == null ? "EUR" : dto.currency()));
        plan.setDescription(dto.description());
        plan.setActive(dto.active());
    }

    public SubscriptionPlanReadOnlyDTO mapToSubscriptionPlanReadOnlyDTO(SubscriptionPlan plan) {
        return new SubscriptionPlanReadOnlyDTO(
                plan.getId(),
                plan.getName(),
                plan.getDurationDays(),
                plan.getPrice().getAmount(),
                plan.getPrice().getCurrency(),
                plan.getDescription(),
                plan.isActive()
        );
    }

    public SubscriptionReadOnlyDTO mapToSubscriptionReadOnlyDTO(Subscription subscription) {
        return new SubscriptionReadOnlyDTO(
                subscription.getId(),
                subscription.getMember().getId(),
                subscription.getMember().getFullName(),
                subscription.getPlan().getId(),
                subscription.getPlan().getName(),
                subscription.getStartDate(),
                subscription.getEndDate(),
                subscription.getEffectiveStatus()
        );
    }

    public PaymentReadOnlyDTO mapToPaymentReadOnlyDTO(Payment payment) {
        return new PaymentReadOnlyDTO(
                payment.getId(),
                payment.getSubscription().getId(),
                payment.getMember().getId(),
                payment.getAmount().getAmount(),
                payment.getAmount().getCurrency(),
                payment.getPaymentDate(),
                payment.getMethod(),
                payment.getStatus()
        );
    }

    public StaffUser mapToStaffUserEntity(StaffUserInsertDTO dto, Role role, PasswordEncoder passwordEncoder) {
        StaffUser staffUser = new StaffUser();
        staffUser.setUsername(dto.username());
        staffUser.setEmail(dto.email());
        staffUser.setPasswordHash(passwordEncoder.encode(dto.password()));
        staffUser.setRole(role);
        return staffUser;
    }

    public StaffUserReadOnlyDTO mapToStaffUserReadOnlyDTO(StaffUser staffUser) {
        return new StaffUserReadOnlyDTO(
                staffUser.getId(),
                staffUser.getUsername(),
                staffUser.getEmail(),
                staffUser.getRole().getName()
        );
    }
}

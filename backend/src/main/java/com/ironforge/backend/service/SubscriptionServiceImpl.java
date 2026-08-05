package com.ironforge.backend.service;

import com.ironforge.backend.domain.membership.Member;
import com.ironforge.backend.domain.membership.Payment;
import com.ironforge.backend.domain.membership.Subscription;
import com.ironforge.backend.domain.membership.SubscriptionPlan;
import com.ironforge.backend.dto.subscription.SubscriptionInsertDTO;
import com.ironforge.backend.dto.subscription.SubscriptionReadOnlyDTO;
import com.ironforge.backend.exception.EntityAlreadyExistsException;
import com.ironforge.backend.exception.EntityNotFoundException;
import com.ironforge.backend.exception.InvalidRequestException;
import com.ironforge.backend.mapper.Mapper;
import com.ironforge.backend.repository.MemberRepository;
import com.ironforge.backend.repository.PaymentRepository;
import com.ironforge.backend.repository.SubscriptionPlanRepository;
import com.ironforge.backend.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final MemberRepository memberRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final PaymentRepository paymentRepository;
    private final Mapper mapper;

    // Creating a subscription and generating its payment happen together, in one
    // transaction: a gym subscription is paid for at sign-up, not in a separate step.
    @Override
    @Transactional
    public SubscriptionReadOnlyDTO createSubscription(SubscriptionInsertDTO dto) {
        Member member = memberRepository.findByIdAndDeletedFalse(dto.memberId())
                .orElseThrow(() -> new EntityNotFoundException("Member", dto.memberId()));

        SubscriptionPlan plan = subscriptionPlanRepository.findById(dto.planId())
                .orElseThrow(() -> new EntityNotFoundException("SubscriptionPlan", dto.planId()));

        if (!plan.isActive()) {
            throw new InvalidRequestException("SubscriptionPlan", "Plan '" + plan.getName() + "' is no longer active");
        }

        if (subscriptionRepository.existsByMember_IdAndEndDateGreaterThanEqual(member.getId(), LocalDate.now())) {
            throw new EntityAlreadyExistsException("Subscription", "Member already has an active subscription");
        }

        Subscription subscription = new Subscription();
        subscription.setMember(member);
        subscription.setPlan(plan);
        subscription.setStartDate(LocalDate.now());
        subscription.setEndDate(LocalDate.now().plusDays(plan.getDurationDays()));
        Subscription savedSubscription = subscriptionRepository.save(subscription);

        Payment payment = new Payment();
        payment.setSubscription(savedSubscription);
        payment.setMember(member);
        payment.setAmount(plan.getPrice());
        payment.setMethod(dto.paymentMethod());
        paymentRepository.save(payment);

        return mapper.mapToSubscriptionReadOnlyDTO(savedSubscription);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SubscriptionReadOnlyDTO> getSubscriptions(Pageable pageable) {
        return subscriptionRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(mapper::mapToSubscriptionReadOnlyDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionReadOnlyDTO> getSubscriptionsForMember(Long memberId) {
        return subscriptionRepository.findAllByMember_IdOrderByCreatedAtDesc(memberId).stream()
                .map(mapper::mapToSubscriptionReadOnlyDTO)
                .toList();
    }
}

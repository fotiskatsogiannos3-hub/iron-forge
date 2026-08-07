package com.ironforge.backend.service;

import com.ironforge.backend.domain.membership.Member;
import com.ironforge.backend.domain.membership.valueobject.Email;
import com.ironforge.backend.domain.membership.valueobject.PhoneNumber;
import com.ironforge.backend.dto.member.MemberInsertDTO;
import com.ironforge.backend.dto.member.MemberReadOnlyDTO;
import com.ironforge.backend.exception.EntityAlreadyExistsException;
import com.ironforge.backend.exception.EntityNotFoundException;
import com.ironforge.backend.mapper.Mapper;
import com.ironforge.backend.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MemberServiceImplTest {

    @Mock
    private MemberRepository memberRepository;

    private final Mapper mapper = new Mapper();

    private MemberServiceImpl memberService;

    @BeforeEach
    void setUp() {
        memberService = new MemberServiceImpl(memberRepository, mapper);
    }

    @Test
    void createMember_savesAndReturnsDto_whenEmailIsFree() {
        MemberInsertDTO dto = new MemberInsertDTO(
                "Giorgos", "Papadopoulos", "giorgos@example.com", "6912345678",
                LocalDate.of(1995, 5, 20));

        when(memberRepository.existsByEmail_ValueIgnoreCaseAndDeletedFalse("giorgos@example.com")).thenReturn(false);
        when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> {
            Member saved = invocation.getArgument(0);
            saved.setId(1L);
            saved.setJoinDate(LocalDate.now());
            return saved;
        });

        MemberReadOnlyDTO result = memberService.createMember(dto);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.firstName()).isEqualTo("Giorgos");
        assertThat(result.email()).isEqualTo("giorgos@example.com");
        verify(memberRepository).save(any(Member.class));
    }

    @Test
    void createMember_throwsConflict_whenEmailAlreadyExists() {
        MemberInsertDTO dto = new MemberInsertDTO(
                "Giorgos", "Papadopoulos", "giorgos@example.com", "6912345678",
                LocalDate.of(1995, 5, 20));

        when(memberRepository.existsByEmail_ValueIgnoreCaseAndDeletedFalse("giorgos@example.com")).thenReturn(true);

        assertThatThrownBy(() -> memberService.createMember(dto))
                .isInstanceOf(EntityAlreadyExistsException.class);

        verify(memberRepository, never()).save(any());
    }

    @Test
    void deleteMember_flipsTheDeletedFlag_ratherThanRemovingTheRow() {
        Member member = new Member();
        member.setId(1L);
        member.setFirstName("Giorgos");
        member.setLastName("Papadopoulos");
        member.setEmail(new Email("giorgos@example.com"));
        member.setPhoneNumber(new PhoneNumber("6912345678"));

        when(memberRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(member));

        memberService.deleteMember(1L);

        assertThat(member.isDeleted()).isTrue();
        verify(memberRepository, never()).delete(any());
    }

    @Test
    void deleteMember_throwsNotFound_whenMemberIsMissingOrAlreadyDeleted() {
        when(memberRepository.findByIdAndDeletedFalse(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> memberService.deleteMember(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void updateMember_allowsKeepingTheSameEmail() {
        Member member = new Member();
        member.setId(1L);
        member.setFirstName("Giorgos");
        member.setLastName("Papadopoulos");
        member.setEmail(new Email("giorgos@example.com"));
        member.setPhoneNumber(new PhoneNumber("6912345678"));

        var dto = new com.ironforge.backend.dto.member.MemberUpdateDTO(
                "GiorgosUpdated", "Papadopoulos", "giorgos@example.com", "6912345678",
                LocalDate.of(1995, 5, 20));

        when(memberRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(member));

        MemberReadOnlyDTO result = memberService.updateMember(1L, dto);

        assertThat(result.firstName()).isEqualTo("GiorgosUpdated");
        verify(memberRepository, never()).existsByEmail_ValueIgnoreCaseAndDeletedFalse(any());
    }
}
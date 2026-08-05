package com.ironforge.backend.service;

import com.ironforge.backend.domain.membership.Member;
import com.ironforge.backend.dto.member.MemberInsertDTO;
import com.ironforge.backend.dto.member.MemberReadOnlyDTO;
import com.ironforge.backend.dto.member.MemberUpdateDTO;
import com.ironforge.backend.exception.EntityAlreadyExistsException;
import com.ironforge.backend.exception.EntityNotFoundException;
import com.ironforge.backend.mapper.Mapper;
import com.ironforge.backend.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final Mapper mapper;

    @Override
    @Transactional
    public MemberReadOnlyDTO createMember(MemberInsertDTO dto) {
        if (memberRepository.existsByEmail_ValueIgnoreCaseAndDeletedFalse(dto.email())) {
            throw new EntityAlreadyExistsException("Member", "A member with email " + dto.email() + " already exists");
        }

        Member member = mapper.mapToMemberEntity(dto);
        Member saved = memberRepository.save(member);
        return mapper.mapToMemberReadOnlyDTO(saved);
    }

    @Override
    @Transactional
    public MemberReadOnlyDTO updateMember(Long id, MemberUpdateDTO dto) {
        Member member = memberRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Member", id));

        if (!member.getEmail().getValue().equalsIgnoreCase(dto.email())
                && memberRepository.existsByEmail_ValueIgnoreCaseAndDeletedFalse(dto.email())) {
            throw new EntityAlreadyExistsException("Member", "A member with email " + dto.email() + " already exists");
        }

        mapper.updateMemberFromDTO(member, dto);
        return mapper.mapToMemberReadOnlyDTO(member);
    }

    @Override
    @Transactional(readOnly = true)
    public MemberReadOnlyDTO getMember(Long id) {
        Member member = memberRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Member", id));
        return mapper.mapToMemberReadOnlyDTO(member);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MemberReadOnlyDTO> getMembers(String search, Pageable pageable) {
        Page<Member> page = StringUtils.hasText(search)
                ? memberRepository.findAllByDeletedFalseAndFirstNameContainingIgnoreCaseOrDeletedFalseAndLastNameContainingIgnoreCase(search, search, pageable)
                : memberRepository.findAllByDeletedFalse(pageable);

        return page.map(mapper::mapToMemberReadOnlyDTO);
    }

    @Override
    @Transactional
    public void deleteMember(Long id) {
        Member member = memberRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Member", id));
        member.softDelete();
    }
}
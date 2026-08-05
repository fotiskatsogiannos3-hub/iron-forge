package com.ironforge.backend.service;

import com.ironforge.backend.dto.member.MemberInsertDTO;
import com.ironforge.backend.dto.member.MemberReadOnlyDTO;
import com.ironforge.backend.dto.member.MemberUpdateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MemberService {

    MemberReadOnlyDTO createMember(MemberInsertDTO dto);

    MemberReadOnlyDTO updateMember(Long id, MemberUpdateDTO dto);

    MemberReadOnlyDTO getMember(Long id);

    Page<MemberReadOnlyDTO> getMembers(String search, Pageable pageable);

    void deleteMember(Long id);
}

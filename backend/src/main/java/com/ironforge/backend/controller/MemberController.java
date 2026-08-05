package com.ironforge.backend.controller;

import com.ironforge.backend.dto.member.MemberInsertDTO;
import com.ironforge.backend.dto.member.MemberReadOnlyDTO;
import com.ironforge.backend.dto.member.MemberUpdateDTO;
import com.ironforge.backend.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MemberReadOnlyDTO createMember(@Valid @RequestBody MemberInsertDTO dto) {
        return memberService.createMember(dto);
    }

    @PutMapping("/{id}")
    public MemberReadOnlyDTO updateMember(@PathVariable Long id, @Valid @RequestBody MemberUpdateDTO dto) {
        return memberService.updateMember(id, dto);
    }

    @GetMapping("/{id}")
    public MemberReadOnlyDTO getMember(@PathVariable Long id) {
        return memberService.getMember(id);
    }

    @GetMapping
    public Page<MemberReadOnlyDTO> getMembers(@RequestParam(required = false) String search, @ParameterObject Pageable pageable) {
        return memberService.getMembers(search, pageable);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }
}
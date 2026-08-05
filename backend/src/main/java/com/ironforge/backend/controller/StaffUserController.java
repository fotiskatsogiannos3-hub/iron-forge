package com.ironforge.backend.controller;

import com.ironforge.backend.dto.staff.StaffUserInsertDTO;
import com.ironforge.backend.dto.staff.StaffUserReadOnlyDTO;
import com.ironforge.backend.dto.staff.StaffUserUpdateDTO;
import com.ironforge.backend.service.StaffUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffUserController {

    private final StaffUserService staffUserService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StaffUserReadOnlyDTO createStaffUser(@Valid @RequestBody StaffUserInsertDTO dto) {
        return staffUserService.createStaffUser(dto);
    }

    @PutMapping("/{id}")
    public StaffUserReadOnlyDTO updateStaffUser(@PathVariable Long id, @Valid @RequestBody StaffUserUpdateDTO dto) {
        return staffUserService.updateStaffUser(id, dto);
    }

    @GetMapping
    public Page<StaffUserReadOnlyDTO> getStaffUsers(@ParameterObject Pageable pageable) {
        return staffUserService.getStaffUsers(pageable);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaffUser(@PathVariable Long id) {
        staffUserService.deleteStaffUser(id);
        return ResponseEntity.noContent().build();
    }
}

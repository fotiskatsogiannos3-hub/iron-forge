package com.ironforge.backend.service;

import com.ironforge.backend.domain.identity.Role;
import com.ironforge.backend.domain.identity.StaffUser;
import com.ironforge.backend.dto.staff.StaffUserInsertDTO;
import com.ironforge.backend.dto.staff.StaffUserReadOnlyDTO;
import com.ironforge.backend.dto.staff.StaffUserUpdateDTO;
import com.ironforge.backend.exception.EntityAlreadyExistsException;
import com.ironforge.backend.exception.EntityNotFoundException;
import com.ironforge.backend.mapper.Mapper;
import com.ironforge.backend.repository.RoleRepository;
import com.ironforge.backend.repository.StaffUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StaffUserServiceImpl implements StaffUserService {

    private final StaffUserRepository staffUserRepository;
    private final RoleRepository roleRepository;
    private final Mapper mapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public StaffUserReadOnlyDTO createStaffUser(StaffUserInsertDTO dto) {
        if (staffUserRepository.existsByUsername(dto.username())) {
            throw new EntityAlreadyExistsException("StaffUser", "Username " + dto.username() + " is already taken");
        }
        if (staffUserRepository.existsByEmail(dto.email())) {
            throw new EntityAlreadyExistsException("StaffUser", "Email " + dto.email() + " is already in use");
        }

        Role role = roleRepository.findByName(dto.roleName())
                .orElseThrow(() -> new EntityNotFoundException("Role", "Role '" + dto.roleName() + "' does not exist"));

        StaffUser staffUser = mapper.mapToStaffUserEntity(dto, role, passwordEncoder);
        return mapper.mapToStaffUserReadOnlyDTO(staffUserRepository.save(staffUser));
    }

    @Override
    @Transactional
    public StaffUserReadOnlyDTO updateStaffUser(Long id, StaffUserUpdateDTO dto) {
        StaffUser staffUser = staffUserRepository.findById(id)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new EntityNotFoundException("StaffUser", id));

        Role role = roleRepository.findByName(dto.roleName())
                .orElseThrow(() -> new EntityNotFoundException("Role", "Role '" + dto.roleName() + "' does not exist"));

        if (!staffUser.getEmail().equalsIgnoreCase(dto.email()) && staffUserRepository.existsByEmail(dto.email())) {
            throw new EntityAlreadyExistsException("StaffUser", "Email " + dto.email() + " is already in use");
        }

        staffUser.setEmail(dto.email());
        staffUser.setRole(role);
        return mapper.mapToStaffUserReadOnlyDTO(staffUser);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StaffUserReadOnlyDTO> getStaffUsers(Pageable pageable) {
        return staffUserRepository.findAllByDeletedFalse(pageable).map(mapper::mapToStaffUserReadOnlyDTO);
    }

    @Override
    @Transactional
    public void deleteStaffUser(Long id) {
        StaffUser staffUser = staffUserRepository.findById(id)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new EntityNotFoundException("StaffUser", id));
        staffUser.softDelete();
    }
}

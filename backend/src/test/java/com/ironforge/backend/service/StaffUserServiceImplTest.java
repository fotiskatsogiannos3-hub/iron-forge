package com.ironforge.backend.service;

import com.ironforge.backend.domain.identity.Role;
import com.ironforge.backend.domain.identity.StaffUser;
import com.ironforge.backend.dto.staff.StaffUserInsertDTO;
import com.ironforge.backend.dto.staff.StaffUserReadOnlyDTO;
import com.ironforge.backend.dto.staff.StaffUserUpdateDTO;
import com.ironforge.backend.exception.EntityAlreadyExistsException;
import com.ironforge.backend.mapper.Mapper;
import com.ironforge.backend.repository.RoleRepository;
import com.ironforge.backend.repository.StaffUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.RecordComponent;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StaffUserServiceImplTest {

    @Mock private StaffUserRepository staffUserRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;

    private final Mapper mapper = new Mapper();

    private StaffUserServiceImpl staffUserService;

    private Role trainerRole;
    private Role adminRole;

    @BeforeEach
    void setUp() {
        staffUserService = new StaffUserServiceImpl(staffUserRepository, roleRepository, mapper, passwordEncoder);

        trainerRole = new Role();
        trainerRole.setId(2L);
        trainerRole.setName("TRAINER");

        adminRole = new Role();
        adminRole.setId(1L);
        adminRole.setName("ADMIN");
    }

    @Test
    void createStaffUser_rejectsDuplicateUsername() {
        StaffUserInsertDTO dto = new StaffUserInsertDTO("trainer1", "trainer1@ironforge.local", "pass1234", "TRAINER");

        when(staffUserRepository.existsByUsernameAndDeletedFalse("trainer1")).thenReturn(true);

        assertThatThrownBy(() -> staffUserService.createStaffUser(dto))
                .isInstanceOf(EntityAlreadyExistsException.class);

        verify(staffUserRepository, never()).save(any());
    }

    @Test
    void createStaffUser_rejectsDuplicateEmail() {
        StaffUserInsertDTO dto = new StaffUserInsertDTO("trainer1", "taken@ironforge.local", "pass1234", "TRAINER");

        when(staffUserRepository.existsByUsernameAndDeletedFalse("trainer1")).thenReturn(false);
        when(staffUserRepository.existsByEmailAndDeletedFalse("taken@ironforge.local")).thenReturn(true);

        assertThatThrownBy(() -> staffUserService.createStaffUser(dto))
                .isInstanceOf(EntityAlreadyExistsException.class);

        verify(staffUserRepository, never()).save(any());
    }

    @Test
    void createStaffUser_neverLeaksThePasswordBackInTheResponseDto() {
        StaffUserInsertDTO dto = new StaffUserInsertDTO("trainer1", "trainer1@ironforge.local", "pass1234", "TRAINER");

        when(staffUserRepository.existsByUsernameAndDeletedFalse("trainer1")).thenReturn(false);
        when(staffUserRepository.existsByEmailAndDeletedFalse("trainer1@ironforge.local")).thenReturn(false);
        when(roleRepository.findByName("TRAINER")).thenReturn(Optional.of(trainerRole));
        when(passwordEncoder.encode("pass1234")).thenReturn("hashed-value");
        when(staffUserRepository.save(any(StaffUser.class))).thenAnswer(invocation -> {
            StaffUser saved = invocation.getArgument(0);
            saved.setId(5L);
            return saved;
        });

        StaffUserReadOnlyDTO result = staffUserService.createStaffUser(dto);

        assertThat(result.id()).isEqualTo(5L);
        assertThat(result.roleName()).isEqualTo("TRAINER");
        assertThat(result.getClass().getRecordComponents())
                .extracting(RecordComponent::getName)
                .doesNotContain("password", "passwordHash");
    }

    @Test
    void updateStaffUser_allowsKeepingTheSameEmail() {
        StaffUser existing = new StaffUser();
        existing.setId(5L);
        existing.setUsername("trainer1");
        existing.setEmail("trainer1@ironforge.local");
        existing.setRole(trainerRole);

        StaffUserUpdateDTO dto = new StaffUserUpdateDTO("trainer1@ironforge.local", "ADMIN");

        when(staffUserRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(roleRepository.findByName("ADMIN")).thenReturn(Optional.of(adminRole));

        StaffUserReadOnlyDTO result = staffUserService.updateStaffUser(5L, dto);

        assertThat(result.roleName()).isEqualTo("ADMIN");
        verify(staffUserRepository, never()).existsByEmailAndDeletedFalse(any());
    }

    @Test
    void updateStaffUser_rejectsEmailAlreadyUsedByAnotherStaffUser() {
        StaffUser existing = new StaffUser();
        existing.setId(5L);
        existing.setUsername("trainer1");
        existing.setEmail("trainer1@ironforge.local");
        existing.setRole(trainerRole);

        StaffUserUpdateDTO dto = new StaffUserUpdateDTO("someone.else@ironforge.local", "ADMIN");

        when(staffUserRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(roleRepository.findByName("ADMIN")).thenReturn(Optional.of(adminRole));
        when(staffUserRepository.existsByEmailAndDeletedFalse("someone.else@ironforge.local")).thenReturn(true);

        assertThatThrownBy(() -> staffUserService.updateStaffUser(5L, dto))
                .isInstanceOf(EntityAlreadyExistsException.class);
    }
}
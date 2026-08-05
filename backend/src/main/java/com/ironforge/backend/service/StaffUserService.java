package com.ironforge.backend.service;

import com.ironforge.backend.dto.staff.StaffUserInsertDTO;
import com.ironforge.backend.dto.staff.StaffUserReadOnlyDTO;
import com.ironforge.backend.dto.staff.StaffUserUpdateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StaffUserService {

    StaffUserReadOnlyDTO createStaffUser(StaffUserInsertDTO dto);

    StaffUserReadOnlyDTO updateStaffUser(Long id, StaffUserUpdateDTO dto);

    Page<StaffUserReadOnlyDTO> getStaffUsers(Pageable pageable);

    void deleteStaffUser(Long id);
}

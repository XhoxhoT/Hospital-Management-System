package com.backend.hospital.Service;

import com.backend.hospital.DTO.BedDTO;
import com.backend.hospital.DTO.CreateBed;
import com.backend.hospital.Entity.Bed;
import com.backend.hospital.Entity.Room;
import com.backend.hospital.Entity.User;
import com.backend.hospital.Enums.BedStatus;
import com.backend.hospital.Enums.Role;
import com.backend.hospital.Exceptions.BedNotAvailableException;
import com.backend.hospital.Exceptions.ResourceNotFoundException;
import com.backend.hospital.Exceptions.StatusCouldNotBeChanged;
import com.backend.hospital.Repository.BedRepository;
import com.backend.hospital.Repository.RoomRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class BedService {

    private BedRepository bedRepository;
    private RoomRepository roomRepository;
    private ModelMapper modelMapper;

    public BedDTO createBed(CreateBed createBed) {
        Room room = roomRepository.findById(createBed.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Room with id " + createBed.getRoomId() + " not found"));

        Bed bed = modelMapper.map(createBed, Bed.class);
        bed.setRoom(room);
        bed.setStatus(BedStatus.FREE);
        bed.setBedNumber(createBed.getBedNumber());

        return modelMapper.map(bedRepository.save(bed), BedDTO.class);
    }

    @Transactional
    public BedDTO occupyBed(Long bedId) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed with id " + bedId + " not found"));

        assertDepartmentAccess(bed);

        if (bed.getStatus() != BedStatus.FREE) {
            throw new BedNotAvailableException("Bed with id " + bedId + " is not free");
        }

        bed.setStatus(BedStatus.OCCUPIED);
        return modelMapper.map(bedRepository.save(bed), BedDTO.class);
    }

    @Transactional
    public BedDTO changeStatus(Long bedId, BedStatus status) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed with id " + bedId + " not found"));

        assertDepartmentAccess(bed);

        if (bed.getStatus() == status) {
            throw new StatusCouldNotBeChanged("Bed is already in status: " + status);
        }

        bed.setStatus(status);
        return modelMapper.map(bedRepository.save(bed), BedDTO.class);
    }

    public List<BedDTO> getBedsByRoomId(Long roomId) {
        return bedRepository.findByRoomId(roomId)
                .stream()
                .map(bed -> modelMapper.map(bed, BedDTO.class))
                .toList();
    }

    // Ensures DEPARTMENT_STAFF can only modify beds in their own department
    private void assertDepartmentAccess(Bed bed) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof User user && user.getRole() == Role.DEPARTMENT_STAFF) {
            Long bedDeptId = bed.getRoom().getDepartment().getId();
            Long userDeptId = user.getDepartment() != null ? user.getDepartment().getId() : null;

            if (!bedDeptId.equals(userDeptId)) {
                throw new AccessDeniedException("You can only modify beds in your own department");
            }
        }
    }
}

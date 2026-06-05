package com.backend.hospital.Service;

import com.backend.hospital.DTO.BedDTO;
import com.backend.hospital.DTO.BedStatusHistoryDTO;
import com.backend.hospital.DTO.OutOfServiceAlertDTO;
import com.backend.hospital.DTO.CreateBed;
import com.backend.hospital.Entity.Bed;
import com.backend.hospital.Entity.BedStatusHistory;
import com.backend.hospital.Entity.Room;
import com.backend.hospital.Entity.User;
import com.backend.hospital.Enums.BedStatus;
import com.backend.hospital.Enums.Role;
import com.backend.hospital.Exceptions.BedNotAvailableException;
import com.backend.hospital.Exceptions.ResourceNotFoundException;
import com.backend.hospital.Exceptions.StatusCouldNotBeChanged;
import com.backend.hospital.Repository.BedRepository;
import com.backend.hospital.Repository.BedStatusHistoryRepository;
import com.backend.hospital.Repository.RoomRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Stream;

@AllArgsConstructor
@Service
public class BedService {

    private BedRepository bedRepository;
    private RoomRepository roomRepository;
    private ModelMapper modelMapper;
    private BedStatusHistoryRepository bedStatusHistoryRepository;

    @Transactional
    public BedDTO createBed(CreateBed createBed) {
        Room room = roomRepository.findById(createBed.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Room with id " + createBed.getRoomId() + " not found"));

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user && user.getRole() == Role.DEPARTMENT_STAFF) {
            Long roomDeptId = room.getDepartment().getId();
            Long userDeptId = user.getDepartment() != null ? user.getDepartment().getId() : null;
            if (!roomDeptId.equals(userDeptId)) {
                throw new AccessDeniedException("You can only add beds to rooms in your own department");
            }
        }

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

        BedStatus previous = bed.getStatus();
        bed.setStatus(BedStatus.OCCUPIED);
        BedDTO result = modelMapper.map(bedRepository.save(bed), BedDTO.class);

        saveHistory(bed, previous, BedStatus.OCCUPIED);
        return result;
    }

    @Transactional
    public BedDTO changeStatus(Long bedId, BedStatus status) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed with id " + bedId + " not found"));

        assertDepartmentAccess(bed);

        if (bed.getStatus() == status) {
            throw new StatusCouldNotBeChanged("Bed is already in status: " + status);
        }

        BedStatus previous = bed.getStatus();
        bed.setStatus(status);
        BedDTO result = modelMapper.map(bedRepository.save(bed), BedDTO.class);

        saveHistory(bed, previous, status);
        return result;
    }

    @Transactional
    public BedDTO updateBedName(Long bedId, String newName) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed with id " + bedId + " not found"));

        assertDepartmentAccess(bed);

        bed.setBedNumber(newName);
        return modelMapper.map(bedRepository.save(bed), BedDTO.class);
    }

    @Transactional
    public void deleteBed(Long bedId) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed with id " + bedId + " not found"));

        assertDepartmentAccess(bed);

        bedStatusHistoryRepository.deleteByBedId(bedId);
        bedRepository.delete(bed);
    }

    public List<BedDTO> getBedsByRoomId(Long roomId) {
        return bedRepository.findByRoomId(roomId)
                .stream()
                .map(bed -> {
                    BedDTO dto = modelMapper.map(bed, BedDTO.class);
                    bedStatusHistoryRepository.findByBedIdOrderByChangedAtDesc(bed.getId())
                            .stream().findFirst()
                            .ifPresent(h -> dto.setStatusSince(h.getChangedAt()));
                    return dto;
                })
                .toList();
    }

    public List<OutOfServiceAlertDTO> getOutOfServiceAlerts(int minutes) {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(minutes);

        return bedRepository.findByStatus(BedStatus.OUT_OF_SERVICE).stream()
                .flatMap(bed -> {
                    List<BedStatusHistory> history = bedStatusHistoryRepository
                            .findByBedIdOrderByChangedAtDesc(bed.getId());
                    if (history.isEmpty()) return Stream.empty();

                    BedStatusHistory latest = history.get(0);
                    if (!latest.getChangedAt().isBefore(threshold)) return Stream.empty();

                    long hoursIn = ChronoUnit.MINUTES.between(latest.getChangedAt(), LocalDateTime.now());
                    return Stream.of(new OutOfServiceAlertDTO(
                            bed.getId(),
                            bed.getBedNumber(),
                            bed.getRoom().getRoomNumber(),
                            bed.getRoom().getDepartment().getName(),
                            latest.getChangedAt(),
                            hoursIn
                    ));
                })
                .toList();
    }

    public List<BedStatusHistoryDTO> getBedHistory(Long bedId) {
        return bedStatusHistoryRepository.findByBedIdOrderByChangedAtDesc(bedId)
                .stream()
                .map(h -> modelMapper.map(h, BedStatusHistoryDTO.class))
                .toList();
    }

    private void saveHistory(Bed bed, BedStatus previous, BedStatus newStatus) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String changedBy = principal instanceof User u ? u.getUsername() : "system";

        BedStatusHistory history = BedStatusHistory.builder()
                .bed(bed)
                .previousStatus(previous)
                .newStatus(newStatus)
                .changedAt(LocalDateTime.now())
                .changedBy(changedBy)
                .build();

        bedStatusHistoryRepository.save(history);
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

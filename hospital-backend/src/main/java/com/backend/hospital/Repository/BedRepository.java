package com.backend.hospital.Repository;

import com.backend.hospital.Entity.Bed;
import com.backend.hospital.Enums.BedStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface BedRepository extends JpaRepository<Bed,Long> {

    List<Bed> findByRoomId(Long roomId);

    List<Bed> findByStatus(BedStatus status);

    List<Bed> findByRoomIdAndStatus(Long roomId, BedStatus status);

    // për booking real nga infermieri
    Optional<Bed> findFirstByRoom_Department_IdAndStatus(Long departmentId, BedStatus status);

    // për mjekun: vetëm shikim
    long countByRoom_Department_IdAndStatus(Long departmentId, BedStatus status);
}

package com.backend.hospital.Repository;

import com.backend.hospital.Entity.BedStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BedStatusHistoryRepository extends JpaRepository<BedStatusHistory, Long> {
    List<BedStatusHistory> findByBedIdOrderByChangedAtDesc(Long bedId);
}

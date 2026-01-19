package com.backend.hospital.Repository;

import com.backend.hospital.Entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface RoomRepository extends JpaRepository<Room,Long> {

    List<Room> findByDepartmentId(Long departmentId);
}

package com.backend.hospital.Repository;

import com.backend.hospital.Entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface RoomRepository extends JpaRepository<Room,Long> {

    List<Room> findByDepartmentId(Long departmentId);
}

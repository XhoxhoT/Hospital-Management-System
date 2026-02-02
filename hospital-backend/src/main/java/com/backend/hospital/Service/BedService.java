package com.backend.hospital.Service;

import com.backend.hospital.Entity.Bed;

import com.backend.hospital.Entity.Room;
import com.backend.hospital.Enums.BedStatus;
import com.backend.hospital.Exceptions.BedNotAvailableException;
import com.backend.hospital.Exceptions.ResourceNotFoundException;
import com.backend.hospital.Exceptions.StatusCouldNotBeChanged;
import com.backend.hospital.Repository.BedRepository;

import com.backend.hospital.Repository.RoomRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class BedService {

    private final BedRepository bedRepository;
    private final RoomRepository roomRepository;

    public Bed createBed(Long roomId, Bed bed) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room with id " + roomId + " not found"
                        ));

        bed.setRoom(room);
        bed.setStatus(BedStatus.FREE);

        return bedRepository.save(bed);
    }


    @Transactional
    public Bed occupyBed(Long bedId) {

        Bed bed = bedRepository.findById(bedId)
                .orElseThrow( () -> new ResourceNotFoundException("Bed with id : "+bedId+" is not found"));

        if (bed.getStatus() != BedStatus.FREE) {
            throw new BedNotAvailableException("Bed with id : "+bedId+", is not free ");
        }

        bed.setStatus(BedStatus.OCCUPIED);

        bedRepository.save(bed);

        return bed;
    }

    public Bed changeStatus(Long bedId, BedStatus status){

        Bed bed = bedRepository.findById(bedId).
                orElseThrow(() -> new ResourceNotFoundException("" +
                        "Bed with id :"+ bedId+" was not found"));

        if (bed.getStatus() == status) {
            throw new StatusCouldNotBeChanged(
                    "Bed is already in status: " + status
            );
        }

        bed.setStatus(status);

        return bed;
    }


}

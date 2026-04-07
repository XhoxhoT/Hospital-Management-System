package com.backend.hospital.Service;

import com.backend.hospital.DTO.BedDTO;
import com.backend.hospital.DTO.CreateBed;
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
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.*;



@AllArgsConstructor
@Service
public class BedService {

    private BedRepository bedRepository;
    private RoomRepository roomRepository;
    private ModelMapper modelMapper;

    public BedDTO createBed(CreateBed createBed) {

        Room room = roomRepository.findById(createBed.getRoomId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room with id " + createBed.getRoomId() + " not found"
                        ));

        Bed bed = modelMapper.map(createBed,Bed.class);
        bed.setRoom(room);
        bed.setStatus(BedStatus.FREE);
        bed.setBedNumber(createBed.getBedNumber());

        return modelMapper.map(bedRepository.save(bed), BedDTO.class);
    }


    @Transactional
    public BedDTO occupyBed(Long bedId) {

        Bed bed = bedRepository.findById(bedId)
                .orElseThrow( () -> new ResourceNotFoundException("Bed with id : "+bedId+" is not found"));

        if (bed.getStatus() != BedStatus.FREE) {
            throw new BedNotAvailableException("Bed with id : "+bedId+", is not free ");
        }

        bed.setStatus(BedStatus.OCCUPIED);

        Bed savedBed = bedRepository.save(bed);

        return modelMapper.map(savedBed, BedDTO.class);
    }

    public BedDTO changeStatus(Long bedId, BedStatus status){

        Bed bed = bedRepository.findById(bedId).
                orElseThrow(() -> new ResourceNotFoundException("" +
                        "Bed with id :"+ bedId+" was not found"));

        if (bed.getStatus() == status) {
            throw new StatusCouldNotBeChanged(
                    "Bed is already in status: " + status
            );
        }

        bed.setStatus(status);
        BedDTO bedDTO = modelMapper.map(bed,BedDTO.class);

        return bedDTO;
    }


    public List<BedDTO> getBedsByRoomId(Long roomId){

        List<BedDTO> beds = bedRepository.findByRoomId(roomId)
                .stream()
                .map(bed -> modelMapper.map(bed, BedDTO.class))
                .toList();

        return beds;
    }


}

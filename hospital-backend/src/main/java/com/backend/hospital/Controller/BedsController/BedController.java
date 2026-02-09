package com.backend.hospital.Controller.BedsController;

import com.backend.hospital.DTO.BedDTO;
import com.backend.hospital.DTO.CreateBed;
import com.backend.hospital.Entity.Bed;
import com.backend.hospital.Enums.BedStatus;
import com.backend.hospital.Service.BedService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class BedController {

    private BedService bedService;


    @PostMapping ("/bed/beds")
    public ResponseEntity<BedDTO> createBed(@RequestBody CreateBed createBed){

       BedDTO bed = bedService.createBed(createBed);

       return ResponseEntity.status(201).body(bed);
    }

    @GetMapping ("/room/{roomId}/beds")
    public ResponseEntity<List<BedDTO>> getBedsbyRoom(@PathVariable Long roomId){

        List<BedDTO> beds = bedService.getBedsByRoomId(roomId);

        return ResponseEntity.ok(beds);
    }


    @PostMapping("/beds/{bedId}/occupy")
    public ResponseEntity<BedDTO> occupyBed(@PathVariable Long bedId) {

        BedDTO bedDTO = bedService.occupyBed(bedId);

        return ResponseEntity.ok(bedDTO);
    }

    @PatchMapping("/beds/{bedId}/status")
    public ResponseEntity<Bed> changeBedStatus(
            @PathVariable Long bedId,
            @RequestBody BedStatus request
    ) {
        Bed bed = bedService.changeStatus(bedId, request);
        return ResponseEntity.ok(bed);
    }

}

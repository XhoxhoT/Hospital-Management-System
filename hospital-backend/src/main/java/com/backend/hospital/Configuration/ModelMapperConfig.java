package com.backend.hospital.Configuration;


import com.backend.hospital.DTO.BedDTO;
import com.backend.hospital.DTO.CreateBed;
import com.backend.hospital.DTO.CreateDepartment;
import com.backend.hospital.DTO.CreateRoom;
import com.backend.hospital.Entity.Bed;
import com.backend.hospital.Entity.Department;
import com.backend.hospital.Entity.Room;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        // Skip ID when mapping  from create
        modelMapper.typeMap(CreateRoom.class, Room.class)
                .addMappings(mapper -> mapper.skip(Room::setId));

        modelMapper.typeMap(CreateBed.class, Bed.class)
                .addMappings(mapper -> mapper.skip(Bed :: setId));

        modelMapper.typeMap(CreateDepartment.class, Department.class)
                .addMappings(mapper -> mapper.skip(Department :: setId));

        // Explicit Bed -> BedDTO mapping: field names differ between entity and DTO
        modelMapper.typeMap(Bed.class, BedDTO.class)
                .addMappings(mapper -> {
                    mapper.map(Bed::getId, BedDTO::setBedId);
                    mapper.map(Bed::getBedNumber, BedDTO::setBednumber);
                    mapper.map(Bed::getStatus, BedDTO::setBedStatus);
                    mapper.map(src -> src.getRoom().getId(), BedDTO::setRoomId);
                });

        return modelMapper;
    }
}

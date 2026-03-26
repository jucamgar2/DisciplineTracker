package backend.disciplinetracker.track.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CreateTrack {

    private List<CreateActivityTrack> tracks;
    
}

package backend.disciplinetracker.track.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CreateActivityTrack {

    private String activityId;

    private List<LocalDate> dates;
    
    
}

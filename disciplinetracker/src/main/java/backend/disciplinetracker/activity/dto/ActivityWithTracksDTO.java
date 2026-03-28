package backend.disciplinetracker.activity.dto;

import java.util.List;

import org.springframework.data.mongodb.core.mapping.Field;

import backend.disciplinetracker.track.model.ActivityTrack;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ActivityWithTracksDTO {

    @Field("_id")
    private String id;

    private String name;
    private String userId;
    
    private List<ActivityTrack> tracks;
}

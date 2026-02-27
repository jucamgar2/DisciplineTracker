package backend.disciplinetracker.activity.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "activities_track")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ActivityTrack {
    
    @Id
    private String id;

    private String activityId;

    private Instant date;
}

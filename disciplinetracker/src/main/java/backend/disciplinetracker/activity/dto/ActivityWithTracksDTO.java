package backend.disciplinetracker.activity.dto;

import java.util.List;

import backend.disciplinetracker.activity.model.Activity;
import backend.disciplinetracker.track.model.ActivityTrack;

public record ActivityWithTracksDTO(Activity activity, List<ActivityTrack> tracks) {
    
}

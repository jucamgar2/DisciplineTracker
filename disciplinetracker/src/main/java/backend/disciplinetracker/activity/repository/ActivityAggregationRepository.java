package backend.disciplinetracker.activity.repository;

import java.time.LocalDate;

import backend.disciplinetracker.activity.dto.ActivityWithTracksDTO;
import reactor.core.publisher.Flux;

public interface ActivityAggregationRepository {
    Flux<ActivityWithTracksDTO> findActivitiesWithTracks(String userId,  LocalDate start, LocalDate end);
}

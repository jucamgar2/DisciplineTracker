package backend.disciplinetracker.track.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import backend.disciplinetracker.track.model.ActivityTrack;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ActivityTrackRepository extends ReactiveMongoRepository<ActivityTrack, String>{

    Mono<ActivityTrack> findByActivityIdAndDate(String activityId, LocalDate date);

    Mono<Void> deleteByActivityIdAndDate(String activityId, LocalDate date);

    Flux<ActivityTrack> findByActivityIdIn(List<String> activityId);

    Flux<ActivityTrack> findByActivityIdAndDateBetween(String activityId, LocalDate start, LocalDate end);
    
}

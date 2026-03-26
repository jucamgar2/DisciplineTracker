package backend.disciplinetracker.track.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import backend.disciplinetracker.activity.model.Activity;
import backend.disciplinetracker.activity.repository.ActivityRepository;
import backend.disciplinetracker.track.dto.CreateActivityReportResponse;
import backend.disciplinetracker.track.dto.CreateActivityTrack;
import backend.disciplinetracker.track.dto.CreateTrack;
import backend.disciplinetracker.track.exception.ActivityNotFoundException;
import backend.disciplinetracker.track.exception.ManyActivityMonthsException;
import backend.disciplinetracker.track.exception.NoActivityTrackException;
import backend.disciplinetracker.track.model.ActivityTrack;
import backend.disciplinetracker.track.repository.ActivityTrackRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class ActivityTrackService {
    
    private ActivityTrackRepository activityTrackRepository;

    private ActivityRepository activityRepository;

    public ActivityTrackService(ActivityTrackRepository activityTrackRepository,
                ActivityRepository activityRepository){
        this.activityTrackRepository = activityTrackRepository;
        this.activityRepository = activityRepository;
    }

    public Mono<CreateActivityReportResponse> saveMonthlyTrack(CreateTrack track, String id) {
        return allActivitiesExist(id, track)
            .flatMap(allExist->{
                if(Boolean.FALSE.equals(allExist)){
                    return Mono.error(new ActivityNotFoundException());
                }
                long monthCount = track.getTracks().stream().flatMap(activityTrack->activityTrack.getDates().stream())
                    .map(LocalDate::getMonth)
                    .distinct()
                    .count();
                if(monthCount == 0 ){
                    return Mono.error(new NoActivityTrackException());
                }else if(monthCount>1){
                    return Mono.error(new ManyActivityMonthsException());
                }
                return toogleTracks(track);
            });
    }

    private Mono<CreateActivityReportResponse> toogleTracks(CreateTrack track) {

        List<ActivityTrack> inputTracks = track.getTracks().stream()
        .flatMap(activityTrack ->
            activityTrack.getDates().stream()
                .map(date -> new ActivityTrack(
                    UUID.randomUUID().toString(),
                    activityTrack.getActivityId(),
                    date
                ))
        )
        .toList();
        List<String> activityIds = inputTracks.stream()
            .map(ActivityTrack::getActivityId)
            .distinct()
            .toList();
        return activityTrackRepository
            .findByActivityIdIn(activityIds) 
            .collectList()
            .flatMap(existingTracks -> {
                Map<String, ActivityTrack> existingMap = existingTracks.stream()
                    .collect(Collectors.toMap(
                        at -> at.getActivityId() + "_" + at.getDate(),
                        at -> at
                    ));
                List<ActivityTrack> toSave = new ArrayList<>();
                List<ActivityTrack> toDelete = new ArrayList<>();
                for (ActivityTrack at : inputTracks) {
                    String key = at.getActivityId() + "_" + at.getDate();

                    if (existingMap.containsKey(key)) {
                        toDelete.add(existingMap.get(key));
                    } else {
                        toSave.add(at);
                    }
                }
                return Flux.concat(
                    activityTrackRepository.deleteAll(toDelete).thenMany(Flux.empty()),
                    activityTrackRepository.saveAll(toSave)
                ).collectList().map(x->{
                    Map<String, List<LocalDate>> saved = toSave.stream()
                        .collect(Collectors.groupingBy(
                            ActivityTrack::getActivityId,
                            Collectors.mapping(ActivityTrack::getDate, Collectors.toList())
                        ));

                    Map<String, List<LocalDate>> deleted = toDelete.stream()
                        .collect(Collectors.groupingBy(
                            ActivityTrack::getActivityId,
                            Collectors.mapping(ActivityTrack::getDate, Collectors.toList())
                        ));
                    List<CreateActivityTrack> save = saved.entrySet().stream().map(y->new CreateActivityTrack(y.getKey(), y.getValue())).toList();
                    List<CreateActivityTrack> delete = deleted.entrySet().stream().map(y->new CreateActivityTrack(y.getKey(), y.getValue())).toList();
                    return new CreateActivityReportResponse(save, delete);
                });
            });
        }

    public Mono<Boolean> allActivitiesExist(String userId, CreateTrack createTrack) {
        Set<String> requestedIds = createTrack.getTracks().stream()
            .map(CreateActivityTrack::getActivityId)
            .collect(Collectors.toSet());
        return activityRepository.findActivitiesByUserId(userId)
            .map(Activity::getId)
            .collectList()
            .map(userActivityIds -> userActivityIds.containsAll(requestedIds));
    }
    
}

package backend.disciplinetracker.activity.service;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Service;

import backend.disciplinetracker.activity.dto.ActivityDetail;
import backend.disciplinetracker.activity.dto.ActivityName;
import backend.disciplinetracker.activity.dto.ActivityWithTracksDTO;
import backend.disciplinetracker.activity.dto.CreateActivity;
import backend.disciplinetracker.activity.exception.ActivityNotFoundException;
import backend.disciplinetracker.activity.exception.ActivityNotFromUserException;
import backend.disciplinetracker.activity.exception.DateNotValidSelectedException;
import backend.disciplinetracker.activity.exception.DuplicatedActivityNameException;
import backend.disciplinetracker.activity.model.Activity;
import backend.disciplinetracker.activity.repository.ActivityRepository;
import backend.disciplinetracker.track.model.ActivityTrack;
import backend.disciplinetracker.track.repository.ActivityTrackRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class ActivityService {

    private ActivityRepository activityRepository;

    private ActivityTrackRepository activityTrackRepository;

    public ActivityService(ActivityRepository activityRepository, ActivityTrackRepository activityTrackRepository){
        this.activityRepository = activityRepository;
        this.activityTrackRepository = activityTrackRepository;
    }

    public Mono<CreateActivity> save(CreateActivity createActivity, String userId) {
        Activity activity = new Activity(UUID.randomUUID().toString(), createActivity.activityName(), userId);
        return activityRepository.findActivityByNameAndUserId(createActivity.activityName(), userId)
                .flatMap(a -> Mono.error(new DuplicatedActivityNameException()))
                .switchIfEmpty(activityRepository.save(activity))
                .map(a->createActivity);
    }

    public Flux<ActivityName> getAllActivities(String id) {
        return activityRepository.findActivitiesByUserId(id)
                .map(activity->new ActivityName(activity.getName()));
    }

    public Mono<ActivityDetail> getActivityDetails(String userId, String activityId, Integer year, Integer month) {
        LocalDate start = LocalDate.now();
        LocalDate end;

        year = year!=null?year:start.getYear();
        if(year<0){
            return Mono.error(new DateNotValidSelectedException());
        }
        if(month==null){
            start = LocalDate.of(year, 1, 1);
            end = LocalDate.of(year, 12, 31);
        }else{
            if(month>12||month<1){
                return Mono.error(new DateNotValidSelectedException());
            }
            start = LocalDate.of(year, month, 1);
            end = start.withDayOfMonth(start.lengthOfMonth());
        }
        
        Mono<Activity> activity = activityRepository.findById(activityId)
                .switchIfEmpty(Mono.error(new ActivityNotFoundException()));
        Flux<ActivityTrack> activityTracks = 
                activityTrackRepository.findByActivityIdAndDateBetween(activityId, start, end);

        return activity.zipWith(activityTracks.collectList())
                .flatMap(tuple->{
                    if(!tuple.getT1().getUserId().equals(userId)){
                        return Mono.error(new ActivityNotFromUserException());
                    }
                    return Mono.just(new ActivityDetail(tuple.getT1().getName(), tuple.getT2().stream().map(ActivityTrack::getDate).toList()));
                });
    }

    public Flux<ActivityDetail> getActivitiesDetails(String userId, Integer year, Integer month) {
        LocalDate start = LocalDate.now();
        LocalDate end;

        year = year!=null?year:start.getYear();
        if(year<0){
            return Flux.error(new DateNotValidSelectedException());
        }
        if(month==null){
            start = LocalDate.of(year, 1, 1);
            end = LocalDate.of(year, 12, 31);
        }else{
            if(month>12||month<1){
                return Flux.error(new DateNotValidSelectedException());
            }
            start = LocalDate.of(year, month, 1);
            end = start.withDayOfMonth(start.lengthOfMonth());
        }

        return activityRepository.findActivitiesWithTracks(userId, start, end).map(this::mapActivityWithTrackToActivityDetail);
    }

    private ActivityDetail mapActivityWithTrackToActivityDetail(ActivityWithTracksDTO activityWithTracksDTO){
        return new ActivityDetail(activityWithTracksDTO.getName(), activityWithTracksDTO.getTracks().stream()
                        .map(ActivityTrack::getDate).toList());
    }
    
}

package backend.disciplinetracker.activity.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import backend.disciplinetracker.activity.dto.CreateActivity;
import backend.disciplinetracker.activity.exception.DuplicatedActivityNameException;
import backend.disciplinetracker.activity.model.Activity;
import backend.disciplinetracker.activity.repository.ActivityRepository;
import reactor.core.publisher.Mono;

@Service
public class ActivityService {

    private ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository){
        this.activityRepository = activityRepository;
    }

    public Mono<CreateActivity> save(CreateActivity createActivity, String userId) {
        Activity activity = new Activity(UUID.randomUUID().toString(), createActivity.activityName(), userId);
        return activityRepository.findActivityByNameAndUserId(createActivity.activityName(), userId)
                .flatMap(a -> Mono.error(new DuplicatedActivityNameException()))
                .switchIfEmpty(activityRepository.save(activity))
                .map(a->createActivity);
    }
    
}

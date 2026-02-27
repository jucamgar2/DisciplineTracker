package backend.disciplinetracker.activity.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.disciplinetracker.activity.dto.CreateActivity;
import backend.disciplinetracker.activity.service.ActivityService;
import backend.disciplinetracker.user.model.User;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/activities")
public class ActivityController {

    private ActivityService activityService;

    public ActivityController(ActivityService activityService){
        this.activityService = activityService;
    }

    @PostMapping("/new")
    public Mono<CreateActivity> createActivity(@RequestBody CreateActivity createActivity, @AuthenticationPrincipal User user){
        return activityService.save(createActivity, user.getId());
    }
    
}

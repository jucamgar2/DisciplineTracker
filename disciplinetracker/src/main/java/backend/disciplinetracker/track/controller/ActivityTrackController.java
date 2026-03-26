package backend.disciplinetracker.track.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.disciplinetracker.track.dto.CreateActivityReportResponse;
import backend.disciplinetracker.track.dto.CreateTrack;
import backend.disciplinetracker.track.service.ActivityTrackService;
import backend.disciplinetracker.user.model.User;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/activities/track")
public class ActivityTrackController {

    private ActivityTrackService activityTrackService;

    public ActivityTrackController(ActivityTrackService activityTrackService){
        this.activityTrackService = activityTrackService;
    }

    @PostMapping("/new")
    public Mono<CreateActivityReportResponse> createMonthlyTrack(@RequestBody CreateTrack track, @AuthenticationPrincipal User user){
        return activityTrackService.saveMonthlyTrack(track, user.getId());
    }


    
}

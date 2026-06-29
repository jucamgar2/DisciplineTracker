package backend.disciplinetracker.track.service;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.anyList;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import backend.disciplinetracker.activity.model.Activity;
import backend.disciplinetracker.activity.repository.ActivityRepository;
import backend.disciplinetracker.track.dto.CreateActivityTrack;
import backend.disciplinetracker.track.dto.CreateTrack;
import backend.disciplinetracker.track.exception.ActivityNotFoundException;
import backend.disciplinetracker.track.exception.ManyActivityMonthsException;
import backend.disciplinetracker.track.exception.NoActivityTrackException;
import backend.disciplinetracker.track.model.ActivityTrack;
import backend.disciplinetracker.track.repository.ActivityTrackRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class ActivityTrackServiceTest {

    @Mock
    private ActivityTrackRepository activityTrackRepository;

    @Mock
    private ActivityRepository activityRepository;

    @InjectMocks
    private ActivityTrackService activityTrackService;

    @Test
    void saveMonthlyTrackShouldFailWhenActivityDoesNotBelongToUser() {
        String userId = "userId";
        String activityId = "activityId";
        CreateTrack track = new CreateTrack(List.of(
                new CreateActivityTrack(activityId, List.of(LocalDate.of(2024, 1, 1)))
        ));

        when(activityRepository.findActivitiesByUserId(userId)).thenReturn(Flux.empty());

        StepVerifier.create(activityTrackService.saveMonthlyTrack(track, userId))
                .verifyError(ActivityNotFoundException.class);
    }

    @Test
    void saveMonthlyTrackShouldFailWhenNoTracksProvided() {
        String userId = "userId";
        String activityId = "activityId";
        CreateTrack track = new CreateTrack(List.of(
                new CreateActivityTrack(activityId, List.of())
        ));

        when(activityRepository.findActivitiesByUserId(userId))
                .thenReturn(Flux.just(new Activity(activityId, "Running", userId)));

        StepVerifier.create(activityTrackService.saveMonthlyTrack(track, userId))
                .verifyError(NoActivityTrackException.class);
    }

    @Test
    void saveMonthlyTrackShouldFailWhenTracksSpanMultipleMonths() {
        String userId = "userId";
        String activityId = "activityId";
        CreateTrack track = new CreateTrack(List.of(
                new CreateActivityTrack(activityId, List.of(
                        LocalDate.of(2024, 1, 1),
                        LocalDate.of(2024, 2, 1)
                ))
        ));

        when(activityRepository.findActivitiesByUserId(userId))
                .thenReturn(Flux.just(new Activity(activityId, "Running", userId)));

        StepVerifier.create(activityTrackService.saveMonthlyTrack(track, userId))
                .verifyError(ManyActivityMonthsException.class);
    }

    @Test
    void saveMonthlyTrackShouldAddNewTracksWhenNoneExist() {
        String userId = "userId";
        String activityId = "activityId";
        LocalDate date = LocalDate.of(2024, 1, 1);
        CreateTrack track = new CreateTrack(List.of(
                new CreateActivityTrack(activityId, List.of(date))
        ));

        when(activityRepository.findActivitiesByUserId(userId))
                .thenReturn(Flux.just(new Activity(activityId, "Running", userId)));
        when(activityTrackRepository.findByActivityIdIn(anyList())).thenReturn(Flux.empty());
        when(activityTrackRepository.deleteAll(anyList())).thenReturn(Mono.empty());
        when(activityTrackRepository.saveAll(anyList()))
                .thenReturn(Flux.just(new ActivityTrack("track1", activityId, date)));

        StepVerifier.create(activityTrackService.saveMonthlyTrack(track, userId))
                .expectNextMatches(response ->
                        response.getAdded().size() == 1 &&
                        response.getAdded().get(0).getActivityId().equals(activityId) &&
                        response.getAdded().get(0).getDates().contains(date) &&
                        response.getDeleted().isEmpty())
                .verifyComplete();
    }

    @Test
    void saveMonthlyTrackShouldDeleteTracksWhenAlreadyExist() {
        String userId = "userId";
        String activityId = "activityId";
        LocalDate date = LocalDate.of(2024, 1, 1);
        CreateTrack track = new CreateTrack(List.of(
                new CreateActivityTrack(activityId, List.of(date))
        ));

        when(activityRepository.findActivitiesByUserId(userId))
                .thenReturn(Flux.just(new Activity(activityId, "Running", userId)));
        when(activityTrackRepository.findByActivityIdIn(anyList()))
                .thenReturn(Flux.just(new ActivityTrack("track1", activityId, date)));
        when(activityTrackRepository.deleteAll(anyList())).thenReturn(Mono.empty());
        when(activityTrackRepository.saveAll(anyList())).thenReturn(Flux.empty());

        StepVerifier.create(activityTrackService.saveMonthlyTrack(track, userId))
                .expectNextMatches(response ->
                        response.getDeleted().size() == 1 &&
                        response.getDeleted().get(0).getActivityId().equals(activityId) &&
                        response.getDeleted().get(0).getDates().contains(date) &&
                        response.getAdded().isEmpty())
                .verifyComplete();
    }

    @Test
    void allActivitiesExistShouldReturnTrueWhenAllRequestedActivitiesBelongToUser() {
        String userId = "userId";
        CreateTrack track = new CreateTrack(List.of(
                new CreateActivityTrack("a1", List.of(LocalDate.of(2024, 1, 1))),
                new CreateActivityTrack("a2", List.of(LocalDate.of(2024, 1, 2)))
        ));

        when(activityRepository.findActivitiesByUserId(userId))
                .thenReturn(Flux.just(
                        new Activity("a1", "Running", userId),
                        new Activity("a2", "Swimming", userId)
                ));

        StepVerifier.create(activityTrackService.allActivitiesExist(userId, track))
                .expectNext(true)
                .verifyComplete();
    }

    @Test
    void allActivitiesExistShouldReturnFalseWhenSomeActivitiesAreMissing() {
        String userId = "userId";
        CreateTrack track = new CreateTrack(List.of(
                new CreateActivityTrack("a1", List.of(LocalDate.of(2024, 1, 1))),
                new CreateActivityTrack("a2", List.of(LocalDate.of(2024, 1, 2)))
        ));

        when(activityRepository.findActivitiesByUserId(userId))
                .thenReturn(Flux.just(new Activity("a1", "Running", userId)));

        StepVerifier.create(activityTrackService.allActivitiesExist(userId, track))
                .expectNext(false)
                .verifyComplete();
    }
}

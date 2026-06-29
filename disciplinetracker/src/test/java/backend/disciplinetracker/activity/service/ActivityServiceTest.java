package backend.disciplinetracker.activity.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

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
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {
    
    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private ActivityTrackRepository activityTrackRepository;

    @InjectMocks
    private ActivityService activityService;

    @Test
    void saveShouldSaveActivity() {
        String uuid = UUID.randomUUID().toString();
        CreateActivity createActivity = new CreateActivity("Running", uuid);

        when(activityRepository.findActivityByNameAndUserId(createActivity.activityName(), "userId"))
                .thenReturn(Mono.empty());
        when(activityRepository.save(any(Activity.class)))
                .thenReturn(Mono.just(new Activity(uuid, createActivity.activityName(), "userId")));
        
        StepVerifier.create(activityService.save(createActivity, "userId"))
                .expectNextMatches(savedActivity -> savedActivity.activityName().equals("Running") && !savedActivity.id().equals(""))
                .verifyComplete();
    }

    @Test
    void saveShouldFailWhenActivityNameAlreadyExists() {
        String uuid = UUID.randomUUID().toString();
        CreateActivity createActivity = new CreateActivity("Running", uuid);

        when(activityRepository.findActivityByNameAndUserId(createActivity.activityName(), "userId"))
                .thenReturn(Mono.just(new Activity(uuid, createActivity.activityName(), "userId")));
         when(activityRepository.save(any(Activity.class)))
                .thenReturn(Mono.just(new Activity(uuid, createActivity.activityName(), "userId")));
        
        StepVerifier.create(activityService.save(createActivity, "userId"))
                .verifyError(DuplicatedActivityNameException.class);
    }

    @Test
    void getAllActivitiesShouldReturnActivities() {
        String userId = "userId";
        when(activityRepository.findActivitiesByUserId(userId))
                .thenReturn(Flux.just(
                        new Activity("1", "Running", userId),
                        new Activity("2", "Swimming", userId)
                ));

        StepVerifier.create(activityService.getAllActivities(userId))
                .expectNextMatches(activityName -> activityName.activityName().equals("Running"))
                .expectNextMatches(activityName -> activityName.activityName().equals("Swimming"))
                .verifyComplete();
    }

    @Test
    void getAllActivitiesShouldReturnEmptyWhenNoActivities() {
        String userId = "userId";
        when(activityRepository.findActivitiesByUserId(userId))
                .thenReturn(Flux.empty());

        StepVerifier.create(activityService.getAllActivities(userId))
                .verifyComplete();
    }

    @Test
    void getActivityDetailsNoYearNoMonthShouldReturnActivityDetails() {
        String userId = "userId";
        String activityId = "activityId";
        Activity activity = new Activity(activityId, "Running", userId);

        when(activityRepository.findById(activityId)).thenReturn(Mono.just(activity));
        when(activityTrackRepository.findByActivityIdAndDateBetween(any(), any(), any()))
                .thenReturn(Flux.just(
                        new ActivityTrack("track1", activityId, LocalDate.of(2023, 1, 1)),
                        new ActivityTrack("track2", activityId, LocalDate.of(2023, 1, 2))
                ));

        StepVerifier.create(activityService.getActivityDetails(userId, activityId, null, null))
                .expectNextMatches(activityDetail -> 
                        activityDetail.getName().equals("Running") &&
                        activityDetail.getTracks().size() == 2)
                .verifyComplete();
    }

    @Test
    void getActivityDetailsNoYearNoMonthShouldReturnErrorWhenActivityNotFound() {
        String userId = "userId";
        String activityId = "activityId";

        when(activityRepository.findById(activityId)).thenReturn(Mono.empty());
        when(activityTrackRepository.findByActivityIdAndDateBetween(any(), any(), any()))
                .thenReturn(Flux.empty());

        StepVerifier.create(activityService.getActivityDetails(userId, activityId, null, null))
                .expectErrorMatches(ActivityNotFoundException.class::isInstance)
                .verify();
    }

    @Test
    void getActivityDetailsWithYearAndMonthShouldReturnActivityDetails() {
        String userId = "userId";
        String activityId = "activityId";
        Activity activity = new Activity(activityId, "Running", userId);

        when(activityRepository.findById(activityId)).thenReturn(Mono.just(activity));
        when(activityTrackRepository.findByActivityIdAndDateBetween(any(), any(), any()))
                .thenReturn(Flux.just(
                        new ActivityTrack("track1", activityId, LocalDate.of(2024, 3, 5))
                ));

        StepVerifier.create(activityService.getActivityDetails(userId, activityId, 2024, 3))
                .expectNextMatches(detail ->
                        detail.getName().equals("Running") &&
                        detail.getTracks().size() == 1 &&
                        detail.getTracks().get(0).equals(LocalDate.of(2024, 3, 5)))
                .verifyComplete();
    }

    @Test
    void getActivityDetailsShouldFailWhenActivityNotFromUser() {
        String userId = "userId";
        String activityId = "activityId";
        Activity activity = new Activity(activityId, "Running", "anotherUser");

        when(activityRepository.findById(activityId)).thenReturn(Mono.just(activity));
        when(activityTrackRepository.findByActivityIdAndDateBetween(any(), any(), any()))
                .thenReturn(Flux.empty());

        StepVerifier.create(activityService.getActivityDetails(userId, activityId, null, null))
                .verifyError(ActivityNotFromUserException.class);
    }

    @Test
    void getActivityDetailsShouldFailWhenYearIsNegative() {
        StepVerifier.create(activityService.getActivityDetails("userId", "activityId", -1, null))
                .verifyError(DateNotValidSelectedException.class);
    }

    @Test
    void getActivityDetailsShouldFailWhenMonthIsInvalid() {
        StepVerifier.create(activityService.getActivityDetails("userId", "activityId", 2024, 13))
                .verifyError(DateNotValidSelectedException.class);
    }

    @Test
    void getActivitiesDetailsShouldReturnMappedActivityDetails() {
        String userId = "userId";
        ActivityWithTracksDTO dto = new ActivityWithTracksDTO(
                "1", "Running", userId,
                List.of(new ActivityTrack("t1", "1", LocalDate.of(2024, 1, 1))));

        when(activityRepository.findActivitiesWithTracks(any(), any(), any()))
                .thenReturn(Flux.just(dto));

        StepVerifier.create(activityService.getActivitiesDetails(userId, 2024, null))
                .expectNextMatches(detail ->
                        detail.getId().equals("1") &&
                        detail.getName().equals("Running") &&
                        detail.getTracks().size() == 1)
                .verifyComplete();
    }

    @Test
    void getActivitiesDetailsShouldFailWhenYearIsNegative() {
        StepVerifier.create(activityService.getActivitiesDetails("userId", -5, null))
                .verifyError(DateNotValidSelectedException.class);
    }

    @Test
    void getActivitiesDetailsShouldFailWhenMonthIsInvalid() {
        StepVerifier.create(activityService.getActivitiesDetails("userId", 2024, 0))
                .verifyError(DateNotValidSelectedException.class);
    }

    @Test
    void getTracksByMontShouldReturnTwelveMonthsWithCounts() {
        String userId = "userId";
        when(activityRepository.findActivitiesByUserId(userId))
                .thenReturn(Flux.just(new Activity("1", "Running", userId)));
        when(activityTrackRepository.findByActivityIdInAndDateBetween(any(), any(), any()))
                .thenReturn(Flux.just(
                        new ActivityTrack("t1", "1", LocalDate.of(2024, 1, 5)),
                        new ActivityTrack("t2", "1", LocalDate.of(2024, 1, 6)),
                        new ActivityTrack("t3", "1", LocalDate.of(2024, 3, 10))
                ));

        StepVerifier.create(activityService.getTracksByMont(userId, 2024).collectList())
                .expectNextMatches(months ->
                        months.size() == 12 &&
                        months.get(0).month().equals("Ene") &&
                        months.get(0).tracksCount() == 2L &&
                        months.get(2).tracksCount() == 1L &&
                        months.get(1).tracksCount() == 0L)
                .verifyComplete();
    }

    @Test
    void getTracksByMontShouldReturnEmptySummaryWhenNoActivities() {
        String userId = "userId";
        when(activityRepository.findActivitiesByUserId(userId)).thenReturn(Flux.empty());

        StepVerifier.create(activityService.getTracksByMont(userId, 2024).collectList())
                .expectNextMatches(months ->
                        months.size() == 12 &&
                        months.stream().allMatch(m -> m.tracksCount() == 0L))
                .verifyComplete();
    }

    @Test
    void getTracksByMontShouldFailWhenYearIsNegative() {
        StepVerifier.create(activityService.getTracksByMont("userId", -1))
                .verifyError(DateNotValidSelectedException.class);
    }

}

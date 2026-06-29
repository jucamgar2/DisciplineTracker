package backend.disciplinetracker.activity.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webflux.test.autoconfigure.WebFluxTest;
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;

import backend.disciplinetracker.activity.dto.ActivityDetail;
import backend.disciplinetracker.activity.dto.ActivityName;
import backend.disciplinetracker.activity.dto.CreateActivity;
import backend.disciplinetracker.activity.dto.MonthlyTrackCount;
import backend.disciplinetracker.activity.service.ActivityService;
import backend.disciplinetracker.config.JwtService;
import backend.disciplinetracker.user.model.User;
import backend.disciplinetracker.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@WebFluxTest(ActivityController.class)
@AutoConfigureWebTestClient
class ActivityControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private ActivityService activityService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserRepository userRepository;

    private static final String TOKEN = "test-token";

    @BeforeEach
    void setUp(){
        String userId = UUID.randomUUID().toString();
        Claims claims = mock(Claims.class);

        when(claims.getSubject()).thenReturn(userId);
        when(jwtService.extractClaims(TOKEN)).thenReturn(claims);
        when(userRepository.findById(userId)).thenReturn(Mono.just(new User(userId, "alice", "Alice", "Johnson", null, "pwd")));
    }

    @Test
    void createShouldReturnCreatedActivity(){
        CreateActivity response = new CreateActivity("Gym", UUID.randomUUID().toString());
        
        when(activityService.save(any(), any())).thenReturn(Mono.just(response));

        webTestClient.post()
                .uri("/activities/new")
            .header("Authorization", "Bearer " + TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("""
                        {
                            "activityName":"Gym"
                        }
                        """)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.activityName").isEqualTo("Gym")
                .jsonPath("$.id").exists();
    }

    @Test
    void getAllActivitiesShouldReturnActivities() {
        when(activityService.getAllActivities(any())).thenReturn(Flux.just(new ActivityName(UUID.randomUUID().toString(), "Gym")));

        webTestClient.get()
                .uri("/activities")
                .header("Authorization", "Bearer " + TOKEN)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$[0].activityName").isEqualTo("Gym")
                .jsonPath("$[0].id").exists();
    }

    @Test
    void getAllActivitiesShouldReturnEmptyListWhenNoActivities() {
        when(activityService.getAllActivities(any())).thenReturn(Flux.empty());

        webTestClient.get()
                .uri("/activities")
                .header("Authorization", "Bearer " + TOKEN)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
                .expectBody()
                .json("[]");
    }

    @Test
    void getActivityDetailsShouldReturnActivityDetails() {
        String activityId = UUID.randomUUID().toString();
        List<LocalDate> trackDates = List.of(LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 2));
        ActivityDetail detail = new ActivityDetail(activityId, "Gym", trackDates);
        when(activityService.getActivityDetails(any(), any(), any(), any())).thenReturn(Mono.just(detail));

        webTestClient.get()
                .uri("/activities/detail/" + activityId)
                .header("Authorization", "Bearer " + TOKEN)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.name").isEqualTo("Gym")
                .jsonPath("$.id").isEqualTo(activityId)
                .jsonPath("$.tracks[0]").isEqualTo("2024-01-01")
                .jsonPath("$.tracks[1]").isEqualTo("2024-01-02");
    }

    @Test
    void getActivitiesDetailsShouldReturnActivitiesDetails() {
        String activityId1 = UUID.randomUUID().toString();
        String activityId2 = UUID.randomUUID().toString();
        List<LocalDate> trackDates1 = List.of(LocalDate.of(2024, 1, 1));
        List<LocalDate> trackDates2 = List.of(LocalDate.of(2024, 1, 2));
        ActivityDetail detail1 = new ActivityDetail(activityId1, "Gym", trackDates1);
        ActivityDetail detail2 = new ActivityDetail(activityId2, "Reading", trackDates2);
        when(activityService.getActivitiesDetails(any(), any(), any())).thenReturn(Flux.just(detail1, detail2));

        webTestClient.get()
                .uri("/activities/detail")
                .header("Authorization", "Bearer " + TOKEN)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$[0].name").isEqualTo("Gym")
                .jsonPath("$[0].id").isEqualTo(activityId1)
                .jsonPath("$[0].tracks[0]").isEqualTo("2024-01-01")
                .jsonPath("$[1].name").isEqualTo("Reading")
                .jsonPath("$[1].id").isEqualTo(activityId2)
                .jsonPath("$[1].tracks[0]").isEqualTo("2024-01-02");
    }

    @Test
    void getTracksByMonthShouldReturnMonthlyTrackCounts() {
        when(activityService.getTracksByMont(any(), any())).thenReturn(Flux.just(
                new MonthlyTrackCount("Jan", 5l),
                new MonthlyTrackCount("Feb", 3l)
        ));

        webTestClient.get()
                .uri("/activities/track/monthly")
                .header("Authorization", "Bearer " + TOKEN)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$[0].month").isEqualTo("Jan")
                .jsonPath("$[0].tracksCount").isEqualTo(5)
                .jsonPath("$[1].month").isEqualTo("Feb")
                .jsonPath("$[1].tracksCount").isEqualTo(3);
    }


}
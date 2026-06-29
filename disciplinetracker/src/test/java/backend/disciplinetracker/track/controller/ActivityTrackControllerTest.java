package backend.disciplinetracker.track.controller;

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

import backend.disciplinetracker.config.JwtService;
import backend.disciplinetracker.track.dto.CreateActivityReportResponse;
import backend.disciplinetracker.track.dto.CreateActivityTrack;
import backend.disciplinetracker.track.service.ActivityTrackService;
import backend.disciplinetracker.user.model.User;
import backend.disciplinetracker.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import reactor.core.publisher.Mono;

@WebFluxTest(ActivityTrackController.class)
@AutoConfigureWebTestClient
class ActivityTrackControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private ActivityTrackService activityTrackService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserRepository userRepository;

    private static final String TOKEN = "test-token";

    @BeforeEach
    void setUp() {
        String userId = UUID.randomUUID().toString();
        Claims claims = mock(Claims.class);

        when(claims.getSubject()).thenReturn(userId);
        when(jwtService.extractClaims(TOKEN)).thenReturn(claims);
        when(userRepository.findById(userId)).thenReturn(Mono.just(new User(userId, "alice", "Alice", "Johnson", null, "pwd")));
    }

    @Test
    void createMonthlyTrackShouldReturnReportResponse() {
        String activityId = UUID.randomUUID().toString();
        LocalDate date = LocalDate.of(2024, 1, 1);
        CreateActivityReportResponse response = new CreateActivityReportResponse(
                List.of(new CreateActivityTrack(activityId, List.of(date))),
                List.of()
        );

        when(activityTrackService.saveMonthlyTrack(any(), any())).thenReturn(Mono.just(response));

        webTestClient.post()
                .uri("/activities/track/new")
                .header("Authorization", "Bearer " + TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("""
                        {
                            "tracks":[
                                {
                                    "activityId":"%s",
                                    "dates":["2024-01-01"]
                                }
                            ]
                        }
                        """.formatted(activityId))
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.added[0].activityId").isEqualTo(activityId)
                .jsonPath("$.added[0].dates[0]").isEqualTo("2024-01-01")
                .jsonPath("$.deleted").isEmpty();
    }

    @Test
    void createMonthlyTrackShouldReturnDeletedTracks() {
        String activityId = UUID.randomUUID().toString();
        LocalDate date = LocalDate.of(2024, 1, 1);
        CreateActivityReportResponse response = new CreateActivityReportResponse(
                List.of(),
                List.of(new CreateActivityTrack(activityId, List.of(date)))
        );

        when(activityTrackService.saveMonthlyTrack(any(), any())).thenReturn(Mono.just(response));

        webTestClient.post()
                .uri("/activities/track/new")
                .header("Authorization", "Bearer " + TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("""
                        {
                            "tracks":[
                                {
                                    "activityId":"%s",
                                    "dates":["2024-01-01"]
                                }
                            ]
                        }
                        """.formatted(activityId))
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.deleted[0].activityId").isEqualTo(activityId)
                .jsonPath("$.deleted[0].dates[0]").isEqualTo("2024-01-01")
                .jsonPath("$.added").isEmpty();
    }
}

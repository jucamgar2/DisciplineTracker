package backend.disciplinetracker.user.controller;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webflux.test.autoconfigure.WebFluxTest;
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;

import backend.disciplinetracker.common.exception.InvalidLoginException;
import backend.disciplinetracker.config.JwtService;
import backend.disciplinetracker.user.dto.LoginResponse;
import backend.disciplinetracker.user.dto.UserResponse;
import backend.disciplinetracker.user.repository.UserRepository;
import backend.disciplinetracker.user.service.UserService;
import reactor.core.publisher.Mono;

@WebFluxTest(UserController.class)
@AutoConfigureWebTestClient
class UserControllerTest {

    @Autowired
    private WebTestClient webTestClient;
    
    @MockitoBean
    private UserService userService;

        @MockitoBean
        private JwtService jwtService;

        @MockitoBean
        private UserRepository userRepository;

    @Test
    void createUserShouldReturnCreatedUser() {
        UserResponse response = new UserResponse("alice", "Alice", "Johnson", LocalDate.of(1995, 6, 20));

        when(userService.createUser(any()))
                .thenReturn(Mono.just(response));

        webTestClient.post()
                .uri("/users/new")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("""
                        {
                          "username": "alice",
                          "name": "Alice",
                          "lastName": "Johnson",
                          "birthDate": "1995-06-20",
                          "password": "Password1@"
                        }
                        """)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.username").isEqualTo("alice")
                .jsonPath("$.name").isEqualTo("Alice")
                .jsonPath("$.lastName").isEqualTo("Johnson")
                .jsonPath("$.birthDate").isEqualTo("1995-06-20");
    }

    @Test
    void createUserShouldReturnBadRequestWhenValidationFails() {
        webTestClient.post()
                .uri("/users/new")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("""
                        {
                          "username": "alice",
                          "name": "",
                          "lastName": "Johnson",
                          "birthDate": "1995-06-20",
                          "password": "Password1@"
                        }
                        """)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.status").isEqualTo(400);
    }

    @Test
    void loginShouldReturnTokens() {
        when(userService.login(any()))
                .thenReturn(Mono.just(new LoginResponse("access-token", "refresh-token")));

        webTestClient.post()
                .uri("/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("""
                        {
                          "username": "alice",
                          "password": "Password1@"
                        }
                        """)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.accessToken").isEqualTo("access-token")
                .jsonPath("$.refreshToken").isEqualTo("refresh-token");
    }

    @Test
    void loginShouldReturnUnauthorizedWhenServiceFails() {
        when(userService.login(any()))
                .thenReturn(Mono.error(new InvalidLoginException()));

        webTestClient.post()
                .uri("/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("""
                        {
                          "username": "alice",
                          "password": "wrong"
                        }
                        """)
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.status").isEqualTo(401);
    }

    @Test
    void refreshShouldReturnTokens() {
        when(userService.refreshToken("refresh-token"))
                .thenReturn(Mono.just(new LoginResponse("new-access-token", "refresh-token")));

        webTestClient.post()
                .uri("/users/login/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("""
                        {
                          "refreshToken": "refresh-token"
                        }
                        """)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.accessToken").isEqualTo("new-access-token")
                .jsonPath("$.refreshToken").isEqualTo("refresh-token");
    }

    @Test
    void getDetailShouldReturnUserResponse() {
        UserResponse userResponse = new UserResponse("alice", "Alice", "Johnson", LocalDate.of(1995, 6, 20));

        when(userService.getUser(any()))
                .thenReturn(Mono.just(userResponse));

        webTestClient.get()
                .uri("/users/detail")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.username").isEqualTo("alice")
                .jsonPath("$.name").isEqualTo("Alice")
                .jsonPath("$.lastName").isEqualTo("Johnson");
    }
}

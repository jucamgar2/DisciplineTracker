package backend.disciplinetracker.user.service;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import backend.disciplinetracker.common.exception.InvalidLoginException;
import backend.disciplinetracker.common.exception.UsernameAlreadyExistsException;
import backend.disciplinetracker.config.JwtService;
import backend.disciplinetracker.user.dto.CreateUser;
import backend.disciplinetracker.user.dto.LoginRequest;
import backend.disciplinetracker.user.model.User;
import backend.disciplinetracker.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private Claims claims;

    @InjectMocks
    private UserService userService;

    @Test
    void createUserShouldFailWhenUsernameAlreadyExists() {
        CreateUser createUser = buildCreateUser("john");
        when(userRepository.existsByUsername("john")).thenReturn(Mono.just(true));

        StepVerifier.create(userService.createUser(createUser))
                .expectError(UsernameAlreadyExistsException.class)
                .verify();

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void createUserShouldEncodePasswordAndReturnUserResponse() {
        CreateUser createUser = buildCreateUser("alice");

        User persistedUser = new User(
                "generated-id",
                "alice",
                "Alice",
                "Johnson",
                LocalDate.of(1995, 6, 20),
                "encoded-pass");

        when(userRepository.existsByUsername("alice")).thenReturn(Mono.just(false));
        when(passwordEncoder.encode("Password1@"))
                .thenReturn("encoded-pass");
        when(userRepository.save(any(User.class)))
                .thenReturn(Mono.just(persistedUser));

        StepVerifier.create(userService.createUser(createUser))
                .assertNext(response -> {
                    assertEquals("alice", response.getUsername());
                    assertEquals("Alice", response.getName());
                    assertEquals("Johnson", response.getLastName());
                    assertEquals(LocalDate.of(1995, 6, 20), response.getBirthDate());
                })
                .verifyComplete();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User userToSave = userCaptor.getValue();
        assertNotNull(userToSave.getId());
        assertEquals("encoded-pass", userToSave.getPassword());
    }

    @Test
    void loginShouldFailWhenUserDoesNotExist() {
        when(userRepository.findByUsername("ghost")).thenReturn(Mono.empty());

        StepVerifier.create(userService.login(new LoginRequest("ghost", "anything")))
                .expectError(InvalidLoginException.class)
                .verify();
    }

    @Test
    void loginShouldFailWhenPasswordIsInvalid() {
        User user = new User("user-id", "john", "John", "Doe", LocalDate.of(1990, 1, 1), "encoded");

        when(userRepository.findByUsername("john")).thenReturn(Mono.just(user));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        StepVerifier.create(userService.login(new LoginRequest("john", "wrong")))
                .expectError(InvalidLoginException.class)
                .verify();
    }

    @Test
    void loginShouldReturnTokensWhenCredentialsAreValid() {
        User user = new User("user-id", "john", "John", "Doe", LocalDate.of(1990, 1, 1), "encoded");

        when(userRepository.findByUsername("john")).thenReturn(Mono.just(user));
        when(passwordEncoder.matches("correct", "encoded")).thenReturn(true);
        when(jwtService.generateAccessToken(user)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("refresh-token");

        StepVerifier.create(userService.login(new LoginRequest("john", "correct")))
                .assertNext(response -> {
                    assertEquals("access-token", response.accessToken());
                    assertEquals("refresh-token", response.refreshToken());
                })
                .verifyComplete();
    }

    @Test
    void getUserShouldReturnMappedUserResponse() {
        User authenticatedUser = new User("auth-id", "john", "Auth", "User", LocalDate.of(1991, 1, 1), "encoded");
        User persistedUser = new User("user-id", "john", "John", "Doe", LocalDate.of(1990, 1, 1), "encoded");

        when(userRepository.findByUsername("john")).thenReturn(Mono.just(persistedUser));

        StepVerifier.create(userService.getUser(authenticatedUser))
                .assertNext(response -> {
                    assertEquals("john", response.getUsername());
                    assertEquals("John", response.getName());
                    assertEquals("Doe", response.getLastName());
                })
                .verifyComplete();
    }

    private CreateUser buildCreateUser(String username) {
        return new CreateUser(
                username,
                "Alice",
                "Johnson",
                LocalDate.of(1995, 6, 20),
                "Password1@");
    }

    @Test
    void refreshTokenShouldReturnNewAccessToken() {
        String refreshToken = "valid-refresh-token";
        String newToken = "new-access-token";
        User persistedUser = new User("user-id", "john", "John", "Doe", LocalDate.of(1990, 1, 1), "encoded");

        when(jwtService.extractClaims(refreshToken)).thenReturn(claims);
        when(claims.getSubject()).thenReturn("user-id");
        when(userRepository.findById("user-id")).thenReturn(Mono.just(persistedUser));
        when(jwtService.generateAccessToken(persistedUser)).thenReturn(newToken);

        StepVerifier.create(userService.refreshToken(refreshToken))
                .assertNext(response -> {
                    assertEquals(newToken, response.accessToken());
                    assertEquals(refreshToken, response.refreshToken());
                })
                .verifyComplete();
    }
}

package backend.disciplinetracker.config;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.WebFilterChain;

import backend.disciplinetracker.user.model.User;
import backend.disciplinetracker.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WebFilterChain chain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void filterShouldPassThroughWhenNoAuthorizationHeader() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/activities"));
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        StepVerifier.create(jwtAuthenticationFilter.filter(exchange, chain))
                .verifyComplete();

        verify(chain).filter(exchange);
        verify(jwtService, never()).extractClaims(any());
        verify(userRepository, never()).findById(anyString());
    }

    @Test
    void filterShouldPassThroughWhenHeaderIsNotBearer() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/activities")
                        .header(HttpHeaders.AUTHORIZATION, "Basic abc123"));
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        StepVerifier.create(jwtAuthenticationFilter.filter(exchange, chain))
                .verifyComplete();

        verify(chain).filter(exchange);
        verify(jwtService, never()).extractClaims(any());
    }

    @Test
    void filterShouldAuthenticateWhenValidBearerToken() {
        String token = "valid-token";
        String userId = "user-id";
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/activities")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token));

        Claims claims = org.mockito.Mockito.mock(Claims.class);
        when(claims.getSubject()).thenReturn(userId);
        when(jwtService.extractClaims(token)).thenReturn(claims);
        when(userRepository.findById(userId))
                .thenReturn(Mono.just(new User(userId, "john", "John", "Doe", LocalDate.of(1990, 1, 1), "pwd")));
        when(chain.filter(exchange)).thenReturn(Mono.empty());
        StepVerifier.create(jwtAuthenticationFilter.filter(exchange, chain))
                .verifyComplete();

        verify(jwtService).extractClaims(token);
        verify(userRepository).findById(userId);
        verify(chain).filter(exchange);
    }

    @Test
    void filterShouldNotInvokeChainWhenUserNotFound() {
        String token = "valid-token";
        String userId = "missing-user";
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/activities")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token));

        Claims claims = org.mockito.Mockito.mock(Claims.class);
        when(claims.getSubject()).thenReturn(userId);
        when(jwtService.extractClaims(token)).thenReturn(claims);
        when(userRepository.findById(userId)).thenReturn(Mono.empty());

        StepVerifier.create(jwtAuthenticationFilter.filter(exchange, chain))
                .verifyComplete();

        verify(chain, never()).filter(any());
    }
}

package backend.disciplinetracker.config;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.test.util.ReflectionTestUtils;

import backend.disciplinetracker.user.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.SignatureException;

class JwtServiceTest {

    private JwtService jwtService;

    private static final String SECRET = "this-is-a-very-long-test-secret-key-for-jwt-signing-1234567890";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", SECRET);
        ReflectionTestUtils.setField(jwtService, "accessExpiration", 3600000L);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", 86400000L);
    }

    private User buildUser() {
        return new User("user-id", "john", "John", "Doe", LocalDate.of(1990, 1, 1), "encoded");
    }

    @Test
    void generateAccessTokenShouldReturnNonNullToken() {
        String token = jwtService.generateAccessToken(buildUser());

        assertNotNull(token);
        assertTrue(token.split("\\.").length == 3);
    }

    @Test
    void generateAccessTokenShouldEmbedUserIdAndUsername() {
        User user = buildUser();

        String token = jwtService.generateAccessToken(user);
        Claims claims = jwtService.extractClaims(token);

        assertEquals(user.getId(), claims.getSubject());
        assertEquals(user.getUsername(), claims.get("username"));
    }

    @Test
    void generateRefreshTokenShouldEmbedUserIdAsSubject() {
        User user = buildUser();

        String token = jwtService.generateRefreshToken(user);
        Claims claims = jwtService.extractClaims(token);

        assertEquals(user.getId(), claims.getSubject());
    }

    @Test
    void extractClaimsShouldReturnValidExpirationInFuture() {
        User user = buildUser();

        String token = jwtService.generateAccessToken(user);
        Claims claims = jwtService.extractClaims(token);

        assertTrue(claims.getExpiration().after(claims.getIssuedAt()));
    }

    @Test
    void extractClaimsShouldFailWhenTokenSignedWithDifferentSecret() {
        JwtService otherService = new JwtService();
        ReflectionTestUtils.setField(otherService, "secret", "another-totally-different-secret-key-9876543210-abcdefgh");
        ReflectionTestUtils.setField(otherService, "accessExpiration", 3600000L);
        ReflectionTestUtils.setField(otherService, "refreshExpiration", 86400000L);

        String token = otherService.generateAccessToken(buildUser());

        assertThrows(SignatureException.class, () -> jwtService.extractClaims(token));
    }

    @Test
    void accessAndRefreshTokensShouldDiffer() {
        User user = buildUser();

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        assertTrue(!accessToken.equals(refreshToken));
    }
}

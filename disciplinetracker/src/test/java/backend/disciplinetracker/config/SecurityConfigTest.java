package backend.disciplinetracker.config;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

class SecurityConfigTest {

    private final SecurityConfig securityConfig = new SecurityConfig();

    @Test
    void passwordEncoderShouldBeBCrypt() {
        PasswordEncoder encoder = securityConfig.passwordEncoder();

        assertNotNull(encoder);
        assertInstanceOf(BCryptPasswordEncoder.class, encoder);
    }

    @Test
    void passwordEncoderShouldMatchEncodedPassword() {
        PasswordEncoder encoder = securityConfig.passwordEncoder();
        String rawPassword = "mySecret123";

        String encoded = encoder.encode(rawPassword);

        assertTrue(encoder.matches(rawPassword, encoded));
    }

    @Test
    void passwordEncoderShouldNotMatchWrongPassword() {
        PasswordEncoder encoder = securityConfig.passwordEncoder();

        String encoded = encoder.encode("correct-password");

        assertFalse(encoder.matches("wrong-password", encoded));
    }

    @Test
    void passwordEncoderShouldProduceDifferentHashesForSamePassword() {
        PasswordEncoder encoder = securityConfig.passwordEncoder();
        String rawPassword = "samePassword";

        String firstHash = encoder.encode(rawPassword);
        String secondHash = encoder.encode(rawPassword);

        assertNotEquals(firstHash, secondHash);
    }
}

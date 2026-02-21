package backend.disciplinetracker.common.exception;

import org.springframework.http.HttpStatus;

public class UsernameAlreadyExistsException extends BusinessException {

    public UsernameAlreadyExistsException() {
        super(
            "USERNAME_ALREADY_EXISTS",
            "El nombre de usuario ya está en uso",
            HttpStatus.CONFLICT,
            "username"
        );
    }
}

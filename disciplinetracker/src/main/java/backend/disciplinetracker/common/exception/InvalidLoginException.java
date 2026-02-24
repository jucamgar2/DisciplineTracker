package backend.disciplinetracker.common.exception;

import org.springframework.http.HttpStatus;

public class InvalidLoginException extends BusinessException{

    public InvalidLoginException(){
        super(
            "UNAUTHORIZED",
            "Usuario o contraseña incorrectos",
            HttpStatus.UNAUTHORIZED,
            "username"
        );
    }
    
}

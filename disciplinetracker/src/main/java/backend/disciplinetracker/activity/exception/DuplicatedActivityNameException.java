package backend.disciplinetracker.activity.exception;

import org.springframework.http.HttpStatus;

import backend.disciplinetracker.common.exception.BusinessException;

public class DuplicatedActivityNameException extends BusinessException{

    public DuplicatedActivityNameException(){
        super(
            "ACTIVITY_ALREADY_EXISTS",
            "El usuario ya tiene una actividad con ese nombre",
            HttpStatus.CONFLICT,
            "activityName"
        );
    }
    
}

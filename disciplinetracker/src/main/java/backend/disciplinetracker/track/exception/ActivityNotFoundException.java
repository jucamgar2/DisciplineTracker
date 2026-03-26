package backend.disciplinetracker.track.exception;

import org.springframework.http.HttpStatus;

import backend.disciplinetracker.common.exception.BusinessException;

public class ActivityNotFoundException extends BusinessException{

    public ActivityNotFoundException() {
        super("ACTIVITY_NOT_FOUND",
        "Has introducido una actividad que no existe",
        HttpStatus.BAD_REQUEST, 
        "activityId");
    }
    
}

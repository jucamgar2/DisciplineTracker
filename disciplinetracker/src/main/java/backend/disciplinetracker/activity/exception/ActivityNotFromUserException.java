package backend.disciplinetracker.activity.exception;

import org.springframework.http.HttpStatus;

import backend.disciplinetracker.common.exception.BusinessException;

public class ActivityNotFromUserException extends BusinessException{

    public ActivityNotFromUserException(){
        super(
            "ACTIVITY_NOF_FROM_USER",
            "La activitdad seleccionada no pertence al usuario actual",
            HttpStatus.UNAUTHORIZED,
            "activityId");
    }
    
}

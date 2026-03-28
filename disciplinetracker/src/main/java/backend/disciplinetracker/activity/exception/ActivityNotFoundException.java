package backend.disciplinetracker.activity.exception;

import org.springframework.http.HttpStatus;

import backend.disciplinetracker.common.exception.BusinessException;

public class ActivityNotFoundException extends BusinessException{

    public ActivityNotFoundException(){
        super(
            "ACTIVITY_NOT_FOUDN",
            "La activitdad seleccionada no ha sido encontrada",
            HttpStatus.NOT_FOUND,
            "activityId");
        
    }
    
}

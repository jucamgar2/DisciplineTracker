package backend.disciplinetracker.track.exception;

import org.springframework.http.HttpStatus;

import backend.disciplinetracker.common.exception.BusinessException;

public class ManyActivityMonthsException extends BusinessException{

    public ManyActivityMonthsException() {
        super("MANY_ACTIVITY_MONTHS",
        "Has introducido registros para más de un mes",
        HttpStatus.BAD_REQUEST, 
        "tracks");
    }
    
}

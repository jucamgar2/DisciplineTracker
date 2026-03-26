package backend.disciplinetracker.track.exception;

import org.springframework.http.HttpStatus;

import backend.disciplinetracker.common.exception.BusinessException;

public class NoActivityTrackException extends BusinessException{

    public NoActivityTrackException() {
        super("NO_ACTIVITY_TRACKS",
        "No has introducido ningún registro",
        HttpStatus.BAD_REQUEST, 
        "tracks");
    }
}

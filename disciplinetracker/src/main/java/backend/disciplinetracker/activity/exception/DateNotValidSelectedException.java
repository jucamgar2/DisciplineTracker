package backend.disciplinetracker.activity.exception;

import org.springframework.http.HttpStatus;

import backend.disciplinetracker.common.exception.BusinessException;

public class DateNotValidSelectedException extends BusinessException{

    public DateNotValidSelectedException(){
        super(
            "DATE_SELECTED_NOT_VALID",
            "La fecha seleccionada no cumple el formato válido",
            HttpStatus.CONFLICT,
            "date");
    }
    
}

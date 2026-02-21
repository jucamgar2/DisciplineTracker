package backend.disciplinetracker.common.exception;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.support.WebExchangeBindException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(WebExchangeBindException.class)
    public org.springframework.http.ResponseEntity<?> handleValidationErrors(
            WebExchangeBindException ex) {

        List<ValidationError> errors = ex.getFieldErrors()
                .stream()
                .map(error -> new ValidationError(
                        error.getField(),
                        error.getDefaultMessage()
                ))
                .collect(Collectors.toList());

        return org.springframework.http.ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, errors));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<?> handleBusinessException(BusinessException ex) {
        ValidationError ve = new ValidationError(ex.getField(), ex.getMessage());
        List<ValidationError> errors = List.of(ve);
        return ResponseEntity
            .status(ex.getStatus())
            .body(
                new ErrorResponse(
                    ex.getStatus().value(),
                    errors
                )
            );
}
    
}

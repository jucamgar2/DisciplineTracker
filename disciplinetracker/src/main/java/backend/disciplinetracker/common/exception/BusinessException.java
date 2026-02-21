package backend.disciplinetracker.common.exception;

import org.springframework.http.HttpStatus;

public class BusinessException extends RuntimeException {

    private final String code;
    private final HttpStatus status;
    private final String field;

    public BusinessException(String code, String message, HttpStatus status, String field) {
        super(message);
        this.code = code;
        this.status = status;
        this.field = field;
    }

    public String getCode() { return code; }
    public HttpStatus getStatus() { return status; }
    public String getField(){ return field;}
}

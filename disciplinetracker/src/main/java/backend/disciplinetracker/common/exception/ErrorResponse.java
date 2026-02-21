package backend.disciplinetracker.common.exception;

import java.util.List;

public class ErrorResponse {
    private int status;
    private List<ValidationError> errors;

    public ErrorResponse(int status, List<ValidationError> errors) {
        this.status = status;
        this.errors = errors;
    }

    public int getStatus() { return status; }
    public List<ValidationError> getErrors() { return errors; }
    
}

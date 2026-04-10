package backend.disciplinetracker.user.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@ToString
public class UserResponse {

    private String username;
    private String name;
    private String lastName;
    private LocalDate birthDate;
    
}

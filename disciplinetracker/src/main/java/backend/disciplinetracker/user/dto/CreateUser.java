package backend.disciplinetracker.user.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@ToString
public class CreateUser {

    private String username;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min=2, max=50, message="El nombre debe tener entre 2 y 50 caracteres")
    private String name;
    
    @NotBlank(message = "El apellido es obligatorio")
    @Size(min=2, max=50, message="El apellido debe tener entre 2 y 50 caracteres")
    private String lastName;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @Past(message = "La fecha de nacimiento debe ser pasada")
    private Instant birthDate;

    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,20}$",
        message = "La contraseña debe tener entre 8-20 caracteres, una mayúscula, una minúscula,"+ 
        "un número y un símbolo"
    )
    private String password;
    
}

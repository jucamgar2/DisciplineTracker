package backend.disciplinetracker.user.mapper;

import backend.disciplinetracker.user.dto.CreateUser;
import backend.disciplinetracker.user.dto.UserResponse;
import backend.disciplinetracker.user.model.User;

public class UserMapper {

    private UserMapper(){}

    public static User mapCreateUserToUser(CreateUser created){
        return new User(null, created.getUsername(), created.getName(),
                     created.getLastName(), created.getBirthDate(), created.getPassword());
    }

    public static UserResponse mapUserToUserResponse(User user){
        return new UserResponse(user.getUsername(), user.getName(), user.getLastName(),
                         user.getBirthDate());
    }
    
}

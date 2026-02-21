package backend.disciplinetracker.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import backend.disciplinetracker.common.exception.UsernameAlreadyExistsException;
import backend.disciplinetracker.user.dto.CreateUser;
import backend.disciplinetracker.user.dto.UserResponse;
import backend.disciplinetracker.user.mapper.UserMapper;
import backend.disciplinetracker.user.model.User;
import backend.disciplinetracker.user.repository.UserRepository;
import reactor.core.publisher.Mono;
import java.util.UUID;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Mono<UserResponse> createUser(CreateUser createdUser){
        return userRepository.existsByUsername(createdUser.getUsername())
            .flatMap(exists->{
                if(exists){
                    return Mono.error(new UsernameAlreadyExistsException());
                }
                User user = UserMapper.mapCreateUserToUser(createdUser);
                user.setId(UUID.randomUUID().toString());
                user.setPassword(passwordEncoder.encode(user.getPassword()));
                return userRepository.save(user).map(entity->UserMapper.mapUserToUserResponse(entity));
            });
    }
    
}

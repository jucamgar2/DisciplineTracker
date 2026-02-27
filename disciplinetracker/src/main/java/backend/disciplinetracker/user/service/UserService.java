package backend.disciplinetracker.user.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import backend.disciplinetracker.common.exception.InvalidLoginException;
import backend.disciplinetracker.common.exception.UsernameAlreadyExistsException;
import backend.disciplinetracker.config.JwtService;
import backend.disciplinetracker.user.dto.CreateUser;
import backend.disciplinetracker.user.dto.LoginRequest;
import backend.disciplinetracker.user.dto.LoginResponse;
import backend.disciplinetracker.user.dto.UserResponse;
import backend.disciplinetracker.user.mapper.UserMapper;
import backend.disciplinetracker.user.model.User;
import backend.disciplinetracker.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import reactor.core.publisher.Mono;
import java.util.UUID;

@Service
public class UserService {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                        JwtService jwtService){
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public Mono<UserResponse> createUser(CreateUser createdUser){
        return userRepository.findByUsername(createdUser.getUsername())
            .switchIfEmpty(Mono.error(new UsernameAlreadyExistsException()))
            .flatMap(exists->{
                User user = UserMapper.mapCreateUserToUser(createdUser);
                user.setId(UUID.randomUUID().toString());
                user.setPassword(passwordEncoder.encode(user.getPassword()));
                return userRepository.save(user).map(UserMapper::mapUserToUserResponse);
            });
    }

    public Mono<LoginResponse> login(LoginRequest loginRequest) {
        return userRepository.findByUsername(loginRequest.username())
                
                .flatMap(user->{
                    if(!passwordEncoder.matches(loginRequest.password(), user.getPassword())){
                        return Mono.error(new InvalidLoginException());
                    }
                    String accessToken = jwtService.generateAccessToken(user);
                    String refreshToken = jwtService.generateRefreshToken(user);

                    return Mono.just(new LoginResponse(accessToken, refreshToken));
                });
    }

    public Mono<LoginResponse> refreshToken(String refreshToken) {
        Claims claims = jwtService.extractClaims(refreshToken);
        return userRepository.findById(claims.getSubject())
                .map(user->jwtService.generateAccessToken(user))
                .map(accessToken->new LoginResponse(accessToken, refreshToken));
    }
    
}

package backend.disciplinetracker.user.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import backend.disciplinetracker.user.dto.CreateUser;
import backend.disciplinetracker.user.dto.LoginRequest;
import backend.disciplinetracker.user.dto.LoginResponse;
import backend.disciplinetracker.user.dto.RefreshRequest;
import backend.disciplinetracker.user.dto.UserResponse;
import backend.disciplinetracker.user.service.UserService;
import jakarta.validation.Valid;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/users")
public class UserController {

    private UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @PostMapping("/new")
    public Mono<UserResponse> createUser(@Valid @RequestBody CreateUser user){
        return userService.createUser(user);
    }

    @PostMapping("/login")
    public Mono<LoginResponse> login(@RequestBody LoginRequest loginRequest){
        return userService.login(loginRequest);
    }

    @PostMapping("/login/refresh")
    public Mono<LoginResponse> refresh(@RequestBody RefreshRequest refreshRequest){
        return userService.refreshToken(refreshRequest.refreshToken());
    }
}

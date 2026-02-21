package backend.disciplinetracker.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import backend.disciplinetracker.user.dto.CreateUser;
import backend.disciplinetracker.user.dto.UserResponse;
import backend.disciplinetracker.user.service.UserService;
import jakarta.validation.Valid;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/new")
    public Mono<UserResponse> createUser(@Valid @RequestBody CreateUser user){
        return userService.createUser(user);
    }
}

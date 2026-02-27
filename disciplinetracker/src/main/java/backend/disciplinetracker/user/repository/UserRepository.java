package backend.disciplinetracker.user.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import backend.disciplinetracker.user.model.User;
import reactor.core.publisher.Mono;

public interface UserRepository extends ReactiveMongoRepository<User, String>{
    
    Mono<Boolean> existsByUsername(String username);

    Mono<User> findByUsername(String username);

}

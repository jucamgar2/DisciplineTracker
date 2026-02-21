package backend.disciplinetracker.user.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import backend.disciplinetracker.user.model.User;

public interface UserRepository extends ReactiveMongoRepository<User, String>{
    
}

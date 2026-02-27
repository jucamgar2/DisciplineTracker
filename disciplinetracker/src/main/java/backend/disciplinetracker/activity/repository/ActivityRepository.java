package backend.disciplinetracker.activity.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import backend.disciplinetracker.activity.model.Activity;
import reactor.core.publisher.Mono;

public interface ActivityRepository extends ReactiveMongoRepository<Activity, String>{

    public Mono<Activity> findActivityByNameAndUserId(String name, String userId);    
} 

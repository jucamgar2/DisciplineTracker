package backend.disciplinetracker.activity.repository;

import java.time.LocalDate;
import java.util.List;

import org.bson.Document;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.MatchOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Repository;

import backend.disciplinetracker.activity.dto.ActivityWithTracksDTO;
import reactor.core.publisher.Flux;

@Repository
public class ActivityAggregationRepositoryImpl implements ActivityAggregationRepository{

    private final ReactiveMongoTemplate mongoTemplate;

    public ActivityAggregationRepositoryImpl(ReactiveMongoTemplate mongoTemplate){
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Flux<ActivityWithTracksDTO> findActivitiesWithTracks(String userId, LocalDate start, LocalDate end) {
        MatchOperation match = Aggregation.match(Criteria.where("userId").is(userId));

            AggregationOperation lookupWithPipeline = context-> new Document("$lookup",
                new Document("from", "activities_track")
                    .append("let", new Document("activityId", "$_id"))
                    .append("pipeline", List.of(
                        new Document("$match",
                            new Document("$expr",
                                new Document("$and", List.of(
                                    new Document("$eq", List.of("$activityId", "$$activityId")),
                                    new Document("$gte", List.of("$date", start)),
                                    new Document("$lte", List.of("$date", end))
                                ))
                            )
                        )
                    ))
                    .append("as", "tracks")
            );

        Aggregation aggregation = Aggregation.newAggregation(match, lookupWithPipeline);

        return mongoTemplate.aggregate(aggregation, "activities", ActivityWithTracksDTO.class);
    }
    
}

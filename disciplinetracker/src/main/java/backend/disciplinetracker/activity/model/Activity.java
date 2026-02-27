package backend.disciplinetracker.activity.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection="activities")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Activity {
    
    @Id
    private String id;

    private String name;

    private String userId;
}

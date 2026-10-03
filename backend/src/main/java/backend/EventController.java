package backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class EventController {

    @GetMapping("/api/events")
    public List<Event> getEvents() {

        return List.of(
            new Event(1L, "Study for exam", "2026-10-10"),
            new Event(2L, "Team meeting", "2026-10-12"),
            new Event(3L, "Finish project", "2026-10-15")
        );
    }
}

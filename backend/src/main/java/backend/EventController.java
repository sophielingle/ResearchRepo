package backend;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class EventController {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public EventController(
            EventRepository eventRepository,
            UserRepository userRepository,
            JwtService jwtService
    ) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping("/api/events")
    public List<Event> getEvents(
            @RequestHeader("Authorization") String authorization
    ) {
        User user = getUserFromToken(authorization);

        return eventRepository.findByUser(user);
    }

    @PostMapping("/api/events")
    public Event createEvent(
            @RequestBody Event event,
            @RequestHeader("Authorization") String authorization
    ) {
        User user = getUserFromToken(authorization);

        event.setUser(user);

        return eventRepository.save(event);
    }

    @DeleteMapping("/api/events/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorization
    ) {
        User user = getUserFromToken(authorization);

        Event event = eventRepository.findById(id)
                .orElseThrow();

        if (!event.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You do not own this event.");
        }

        eventRepository.delete(event);
    }

    @PutMapping("/api/events/{id}")
    public Event updateEvent(
            @PathVariable Long id,
            @RequestBody Event event,
            @RequestHeader("Authorization") String authorization
    ) {
        User user = getUserFromToken(authorization);

        Event existingEvent = eventRepository.findById(id)
                .orElseThrow();

        if (!existingEvent.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You do not own this event.");
        }

        existingEvent.setTitle(event.getTitle());
        existingEvent.setDate(event.getDate());

        return eventRepository.save(existingEvent);
    }

    private User getUserFromToken(String authorization) {
        String token = authorization.substring(7);

        String username = jwtService.extractUsername(token);

        return userRepository.findByUsername(username)
                .orElseThrow();
    }
}

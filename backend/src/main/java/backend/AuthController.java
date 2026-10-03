package backend;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(
            AuthService authService,
            JwtService jwtService
    ) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody AuthRequest request
    ) {
        try {
            User user = authService.register(
                    request.username(),
                    request.password()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message", "User registered successfully",
                            "username", user.getUsername()
                    )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody AuthRequest request
    ) {
        try {
            User user = authService.authenticate(
                    request.username(),
                    request.password()
            );

            String token = jwtService.generateToken(
                    user.getUsername()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "token", token,
                            "username", user.getUsername()
                    )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    public record AuthRequest(
            String username,
            String password
    ) {
    }
}

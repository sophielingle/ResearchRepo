package backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User register(String username, String password) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required");
        }

        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException(
                "Password must be at least 6 characters"
            );
        }

        String cleanUsername = username.trim();

        if (userRepository.existsByUsername(cleanUsername)) {
            throw new IllegalArgumentException(
                "Username already exists"
            );
        }

        String hashedPassword = passwordEncoder.encode(password);

        User user = new User();
        user.setUsername(cleanUsername);
        user.setPassword(hashedPassword);

        return userRepository.save(user);
    }

    public User authenticate(String username, String password) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() ->
                new IllegalArgumentException("Invalid username or password")
            );

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException(
                "Invalid username or password"
            );
        }

        return user;
    }
}

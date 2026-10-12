package com.hatz.twitter.modules.auth;

import com.hatz.twitter.common.ApiError;
import com.hatz.twitter.common.ValidationError;
import com.hatz.twitter.modules.users.User;
import com.hatz.twitter.modules.users.UserRepository;
import com.hatz.twitter.security.JwtService;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  public record RegisterRequest(String username, String email, String password) {}
  public record LoginRequest(String username, String password) {}
  public record RefreshRequest(String refresh) {}

  /**
   * Mirrors Django's RegisterView + UserSerializer.create: password is
   * write-only (min 8 chars), user created via create_user (bcrypt here).
   */
  @Transactional
  public User register(RegisterRequest req) {
    if (req.username() == null || req.username().isBlank()) {
      throw ValidationError.of("username", "This field is required.");
    }
    if (req.email() == null || !req.email().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
      throw ValidationError.of("email", "Enter a valid email address.");
    }
    if (req.password() == null || req.password().length() < 8) {
      throw ValidationError.of(
          "password", "Ensure this field has at least 8 characters.");
    }

    if (userRepository.existsByUsernameOrEmail(req.username(), req.email())) {
      Map<String, List<String>> errors = new LinkedHashMap<>();
      if (userRepository.existsByUsername(req.username())) {
        errors.put("username", List.of("user with this username already exists."));
      }
      if (userRepository.existsByEmail(req.email())) {
        errors.put("email", List.of("user with this email already exists."));
      }
      throw new ValidationError(errors);
    }

    User user = new User(req.username(), req.email(), passwordEncoder.encode(req.password()));
    return userRepository.save(user);
  }

  /**
   * Mirrors Django's LoginView: 404 when the user is missing, 400 on a bad
   * password, simplejwt-style { refresh, access } on success.
   */
  public JwtService.Tokens login(LoginRequest req) {
    User user =
        userRepository
            .findByUsername(req.username() == null ? "" : req.username())
            .orElseThrow(() -> ApiError.detail(404, "User not found."));

    if (req.password() == null || !passwordEncoder.matches(req.password(), user.getPassword())) {
      throw ApiError.detail(400, "Invalid Credentials");
    }

    return jwtService.generateTokens(user.getId());
  }

  /**
   * Mirrors simplejwt refresh: valid refresh token -> fresh token pair. An
   * invalid/expired token returns the same {refresh, access} body shape as
   * Django's RefreshView (with null values), not a bare {detail} error.
   */
  public JwtService.Tokens refresh(String refreshToken) {
    Long userId =
        (refreshToken == null || refreshToken.isBlank()) ? null : jwtService.parseRefresh(refreshToken);
    if (userId == null || !userRepository.existsById(userId)) {
      throw new InvalidRefreshToken();
    }
    return jwtService.generateTokens(userId);
  }

  /** Raised when the refresh token is invalid/expired/unknown. */
  public static class InvalidRefreshToken extends RuntimeException {
    public InvalidRefreshToken() {
      super("Token is invalid or expired");
    }
  }
}

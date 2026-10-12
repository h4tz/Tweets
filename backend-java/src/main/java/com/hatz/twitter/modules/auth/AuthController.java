package com.hatz.twitter.modules.auth;

import com.hatz.twitter.modules.users.UserResponse;
import com.hatz.twitter.security.JwtService;
import java.util.LinkedHashMap;
import java.util.Map;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  public record RegisterBody(
      @NotBlank(message = "This field is required.") String username,
      @Email(message = "Enter a valid email address.") @NotBlank(message = "This field is required.")
          String email,
      @Size(
              min = 8,
              message = "Ensure this field has at least 8 characters.")
          @NotBlank(message = "This field is required.")
          String password) {}

  public record LoginBody(
      @NotBlank(message = "This field is required.") String username,
      @NotBlank(message = "This field is required.") String password) {}

  public record RefreshBody(@NotBlank(message = "This field is required.") String refresh) {}

  // POST /api/register/
  @PostMapping("/register")
  public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterBody body) {
    var user =
        authService.register(
            new AuthService.RegisterRequest(body.username(), body.email(), body.password()));
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(new UserResponse(user.getId(), user.getUsername(), user.getEmail()));
  }

  // POST /api/login/
  @PostMapping("/login")
  public JwtService.Tokens login(@Valid @RequestBody LoginBody body) {
    return authService.login(new AuthService.LoginRequest(body.username(), body.password()));
  }

  // POST /api/refresh/ — invalid/expired token yields nulls like simplejwt
  @PostMapping("/refresh")
  public ResponseEntity<Map<String, String>> refresh(@Valid @RequestBody RefreshBody body) {
    try {
      JwtService.Tokens tokens = authService.refresh(body.refresh());
      Map<String, String> body2 = new LinkedHashMap<>();
      body2.put("refresh", tokens.refresh());
      body2.put("access", tokens.access());
      return ResponseEntity.ok(body2);
    } catch (AuthService.InvalidRefreshToken e) {
      Map<String, String> nulls = new LinkedHashMap<>();
      nulls.put("refresh", null);
      nulls.put("access", null);
      return ResponseEntity.ok(nulls);
    }
  }
}

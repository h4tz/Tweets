package com.hatz.twitter.modules.users;

import com.hatz.twitter.security.CurrentUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserController {
  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  // GET /api/me/ — the authenticated user's profile
  @GetMapping("/me")
  public UserProfileResponse me() {
    long userId = CurrentUser.requireId();
    return userService.getProfile(userId, userId);
  }

  // GET /api/users/{id}/ — public profile of any user
  @GetMapping("/users/{id}")
  public UserProfileResponse profile(@PathVariable long id) {
    return userService.getProfile(id, CurrentUser.id());
  }
}

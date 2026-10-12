package com.hatz.twitter.modules.follows;

import com.hatz.twitter.common.ApiError;
import com.hatz.twitter.security.CurrentUser;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/{userId}/follow")
public class FollowController {
  private final FollowService followService;

  public FollowController(FollowService followService) {
    this.followService = followService;
  }

  // POST /api/users/{userId}/follow/ — mirrors Django's status codes
  @PostMapping
  public ResponseEntity<Map<String, String>> toggle(@PathVariable long userId) {
    long followerId = CurrentUser.requireId();

    Boolean followed;
    try {
      followed = followService.toggleFollow(followerId, userId);
    } catch (RuntimeException e) {
      if (FollowService.isFollowYourself(e)) {
        throw ApiError.detail(400, "Cannot follow yourself. ");
      }
      throw e;
    }

    if (followed == null) {
      throw ApiError.detail(409, "Already following this user.");
    }
    if (!followed) {
      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.status(201).body(Map.of("detail", "Followed successfully"));
  }
}

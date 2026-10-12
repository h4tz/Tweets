package com.hatz.twitter.modules.likes;

import com.hatz.twitter.common.ApiError;
import com.hatz.twitter.security.CurrentUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tweets/{tweetId}/like")
public class LikeController {
  private final LikeService likeService;

  public LikeController(LikeService likeService) {
    this.likeService = likeService;
  }

  // POST /api/tweets/{tweetId}/like/ — 201 {"detail":"Tweet Liked"} / 204 empty
  @PostMapping
  public ResponseEntity<java.util.Map<String, String>> toggle(@PathVariable long tweetId) {
    long userId = CurrentUser.requireId();
    boolean liked = likeService.toggleLike(userId, tweetId);
    if (!liked) {
      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.status(201).body(java.util.Map.of("detail", "Tweet Liked"));
  }
}

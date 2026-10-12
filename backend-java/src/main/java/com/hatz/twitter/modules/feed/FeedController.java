package com.hatz.twitter.modules.feed;

import com.hatz.twitter.common.Cursor;
import com.hatz.twitter.common.Pagination;
import com.hatz.twitter.modules.tweets.TweetSerializer;
import com.hatz.twitter.security.CurrentUser;
import java.util.Optional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feed")
public class FeedController {
  private final FeedService feedService;

  public FeedController(FeedService feedService) {
    this.feedService = feedService;
  }

  // GET /api/feed/ — tweets from accounts the authenticated user follows
  @GetMapping
  public Pagination.Page<TweetSerializer.Response> feed(
      @RequestParam(required = false) String cursor) {
    long userId = CurrentUser.requireId();
    return feedService.listFeed(userId, Cursor.decode(cursor));
  }
}

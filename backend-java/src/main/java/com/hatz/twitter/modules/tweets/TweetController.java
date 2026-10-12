package com.hatz.twitter.modules.tweets;

import com.hatz.twitter.common.Cursor;
import com.hatz.twitter.common.Pagination;
import com.hatz.twitter.security.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tweets")
public class TweetController {
  private final TweetService tweetService;

  public TweetController(TweetService tweetService) {
    this.tweetService = tweetService;
  }

  public record CreateBody(
      @NotBlank(message = "This field may not be blank.") String content) {}

  // GET /api/tweets/ — global timeline, cursor paginated (public read)
  @GetMapping
  public Pagination.Page<TweetSerializer.Response> list(
      @RequestParam(required = false) String cursor) {
    return tweetService.list(Cursor.decode(cursor), CurrentUser.id());
  }

  // POST /api/tweets/ — create a tweet (authenticated)
  @PostMapping
  public ResponseEntity<TweetSerializer.Response> create(@Valid @RequestBody CreateBody body) {
    long userId = CurrentUser.requireId();
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(tweetService.create(userId, body.content(), userId));
  }

  // GET /api/tweets/{id}/ — single tweet
  @GetMapping("/{id}")
  public TweetSerializer.Response get(@PathVariable long id) {
    return tweetService.get(id, CurrentUser.id());
  }

  // PUT/PATCH /api/tweets/{id}/ — update (owner only)
  @PutMapping("/{id}")
  public TweetSerializer.Response put(
      @PathVariable long id, @Valid @RequestBody CreateBody body) {
    return tweetService.update(id, body.content(), CurrentUser.requireId());
  }

  @PatchMapping("/{id}")
  public TweetSerializer.Response patch(
      @PathVariable long id, @Valid @RequestBody CreateBody body) {
    return tweetService.update(id, body.content(), CurrentUser.requireId());
  }

  // DELETE /api/tweets/{id}/ — delete (owner only)
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> destroy(@PathVariable long id) {
    tweetService.destroy(id, CurrentUser.requireId());
    return ResponseEntity.noContent().build();
  }
}

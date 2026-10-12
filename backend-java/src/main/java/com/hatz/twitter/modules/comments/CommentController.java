package com.hatz.twitter.modules.comments;

import com.hatz.twitter.common.Cursor;
import com.hatz.twitter.common.Pagination;
import com.hatz.twitter.security.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tweets/{tweetId}/comments")
public class CommentController {
  private final CommentService commentService;

  public CommentController(CommentService commentService) {
    this.commentService = commentService;
  }

  public record CreateBody(
      @NotBlank(message = "This field may not be blank.") String content,
      Long parent_comment) {}

  // GET /api/tweets/{tweetId}/comments/ — paginated comments
  @GetMapping
  public Pagination.Page<CommentSerializer.Response> list(
      @PathVariable long tweetId, @RequestParam(required = false) String cursor) {
    return commentService.list(tweetId, Cursor.decode(cursor), CurrentUser.id());
  }

  // POST /api/tweets/{tweetId}/comments/ — add a comment or reply
  @PostMapping
  public ResponseEntity<CommentSerializer.Response> create(
      @PathVariable long tweetId, @Valid @RequestBody CreateBody body) {
    long userId = CurrentUser.requireId();
    CommentSerializer.Response comment =
        commentService.create(tweetId, userId, body.content(), body.parent_comment(), userId);
    return ResponseEntity.status(HttpStatus.CREATED).body(comment);
  }
}

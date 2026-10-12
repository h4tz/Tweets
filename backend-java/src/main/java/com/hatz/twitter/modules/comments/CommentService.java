package com.hatz.twitter.modules.comments;

import com.hatz.twitter.common.ApiError;
import com.hatz.twitter.common.Cursor;
import com.hatz.twitter.common.Pagination;
import com.hatz.twitter.common.ValidationError;
import com.hatz.twitter.modules.tweets.Tweet;
import com.hatz.twitter.modules.tweets.TweetRepository;
import com.hatz.twitter.modules.users.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService {
  private final CommentRepository commentRepository;
  private final TweetRepository tweetRepository;
  private final UserRepository userRepository;
  private final CommentSerializer commentSerializer;

  public CommentService(
      CommentRepository commentRepository,
      TweetRepository tweetRepository,
      UserRepository userRepository,
      CommentSerializer commentSerializer) {
    this.commentRepository = commentRepository;
    this.tweetRepository = tweetRepository;
    this.userRepository = userRepository;
    this.commentSerializer = commentSerializer;
  }

  private static Specification<Comment> scopedToTweet(long tweetId) {
    return (root, query, cb) -> cb.equal(root.get("tweet").get("id"), tweetId);
  }

  private static Specification<Comment> older(Cursor c) {
    return (root, query, cb) ->
        cb.or(
            cb.lessThan(root.get("createdAt"), c.t()),
            cb.and(cb.equal(root.get("createdAt"), c.t()), cb.lessThan(root.get("id"), c.id())));
  }

  private static Specification<Comment> newer(Cursor c) {
    return (root, query, cb) ->
        cb.or(
            cb.greaterThan(root.get("createdAt"), c.t()),
            cb.and(cb.equal(root.get("createdAt"), c.t()), cb.greaterThan(root.get("id"), c.id())));
  }

  /** Paginated comments on a tweet — mirrors GET /api/tweets/{id}/comments/. */
  @Transactional(readOnly = true)
  public Pagination.Page<CommentSerializer.Response> list(
      long tweetId, Optional<Cursor> cursor, Long viewerId) {
    Cursor c = cursor.orElse(null);
    Specification<Comment> base = scopedToTweet(tweetId);
    Specification<Comment> whereOlder = c == null ? null : older(c);
    Specification<Comment> whereNewer = c == null ? null : newer(c);

    Pagination.Page<Comment> page =
        Pagination.paginate(
            c,
            base,
            whereOlder,
            whereNewer,
            (spec, pageable) -> commentRepository.findAll(spec, pageable).getContent(),
            "/api/tweets/" + tweetId + "/comments/",
            Map.of(),
            Comment::getCreatedAt,
            Comment::getId);

    List<CommentSerializer.Response> results =
        page.results().stream().map(cm -> commentSerializer.serialize(cm, viewerId)).toList();
    return new Pagination.Page<>(page.next(), page.previous(), results);
  }

  /**
   * Mirrors Django's perform_create: the tweet must exist, and a parent comment
   * (when given) must belong to the same tweet.
   */
  @Transactional
  public CommentSerializer.Response create(
      long tweetId, long userId, String content, Long parentCommentId, Long viewerId) {
    if (content == null || content.isBlank()) {
      throw ValidationError.of("content", "This field may not be blank.");
    }
    Tweet tweet = tweetRepository.findById(tweetId).orElseThrow(ApiError::notFound);

    Comment parent = null;
    if (parentCommentId != null) {
      parent = commentRepository.findById(parentCommentId).orElseThrow(ApiError::notFound);
      if (!parent.getTweet().getId().equals(tweet.getId())) {
        throw ValidationError.of(
            "parent_comment", "Parent comment must belong to the same tweet.");
      }
    }

    var user = userRepository.findById(userId).orElseThrow(ApiError::notFound);
    Comment comment = commentRepository.save(new Comment(user, tweet, parent, content));
    return commentSerializer.serialize(comment, viewerId);
  }
}

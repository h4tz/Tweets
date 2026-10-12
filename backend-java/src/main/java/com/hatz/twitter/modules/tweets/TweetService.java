package com.hatz.twitter.modules.tweets;

import com.hatz.twitter.common.ApiError;
import com.hatz.twitter.common.Cursor;
import com.hatz.twitter.common.Pagination;
import com.hatz.twitter.common.ValidationError;
import com.hatz.twitter.modules.users.User;
import com.hatz.twitter.modules.users.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TweetService {
  private final TweetRepository tweetRepository;
  private final UserRepository userRepository;
  private final TweetSerializer tweetSerializer;

  public TweetService(
      TweetRepository tweetRepository, UserRepository userRepository, TweetSerializer tweetSerializer) {
    this.tweetRepository = tweetRepository;
    this.userRepository = userRepository;
    this.tweetSerializer = tweetSerializer;
  }

  private static Specification<Tweet> older(Cursor c) {
    return (root, query, cb) ->
        cb.or(
            cb.lessThan(root.get("createdAt"), c.t()),
            cb.and(cb.equal(root.get("createdAt"), c.t()), cb.lessThan(root.get("id"), c.id())));
  }

  private static Specification<Tweet> newer(Cursor c) {
    return (root, query, cb) ->
        cb.or(
            cb.greaterThan(root.get("createdAt"), c.t()),
            cb.and(cb.equal(root.get("createdAt"), c.t()), cb.greaterThan(root.get("id"), c.id())));
  }

  /** Global timeline, cursor paginated (public read) — mirrors GET /api/tweets/. */
  @Transactional(readOnly = true)
  public Pagination.Page<TweetSerializer.Response> list(Optional<Cursor> cursor, Long viewerId) {
    Pagination.Page<Tweet> page =
        Pagination.paginate(
            cursor.orElse(null),
            null,
            older(cursor.orElse(null)),
            newer(cursor.orElse(null)),
            (spec, pageable) ->
                spec == null
                    ? tweetRepository.findAll(pageable).getContent()
                    : tweetRepository.findAll(spec, pageable).getContent(),
            "/api/tweets/",
            Map.of(),
            Tweet::getCreatedAt,
            Tweet::getId);

    List<TweetSerializer.Response> results =
        page.results().stream().map(t -> tweetSerializer.serialize(t, viewerId)).toList();
    return new Pagination.Page<>(page.next(), page.previous(), results);
  }

  @Transactional(readOnly = true)
  public TweetSerializer.Response get(long id, Long viewerId) {
    Tweet tweet = tweetRepository.findById(id).orElseThrow(ApiError::notFound);
    return tweetSerializer.serialize(tweet, viewerId);
  }

  @Transactional
  public TweetSerializer.Response create(long userId, String content, Long viewerId) {
    if (content == null || content.isBlank()) {
      throw ValidationError.of("content", "This field may not be blank.");
    }
    User user = userRepository.findById(userId).orElseThrow(ApiError::notFound);
    Tweet tweet = tweetRepository.save(new Tweet(user, content));
    return tweetSerializer.serialize(tweet, viewerId);
  }

  /** IsOwnerOrReadOnly: only the author may update. */
  @Transactional
  public TweetSerializer.Response update(long id, String content, long viewerId) {
    if (content == null || content.isBlank()) {
      throw ValidationError.of("content", "This field may not be blank.");
    }
    Tweet tweet = tweetRepository.findById(id).orElseThrow(ApiError::notFound);
    if (!tweet.getUser().getId().equals(viewerId)) {
      throw ApiError.permissionDenied();
    }
    tweet.setContent(content);
    return tweetSerializer.serialize(tweetRepository.save(tweet), viewerId);
  }

  /** IsOwnerOrReadOnly: only the author may delete. */
  @Transactional
  public void destroy(long id, long viewerId) {
    Tweet tweet = tweetRepository.findById(id).orElseThrow(ApiError::notFound);
    if (!tweet.getUser().getId().equals(viewerId)) {
      throw ApiError.permissionDenied();
    }
    tweetRepository.delete(tweet);
  }
}

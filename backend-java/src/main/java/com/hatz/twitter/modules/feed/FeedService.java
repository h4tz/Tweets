package com.hatz.twitter.modules.feed;

import com.hatz.twitter.common.Cursor;
import com.hatz.twitter.common.Pagination;
import com.hatz.twitter.modules.follows.FollowRepository;
import com.hatz.twitter.modules.tweets.Tweet;
import com.hatz.twitter.modules.tweets.TweetRepository;
import com.hatz.twitter.modules.tweets.TweetSerializer;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedService {
  private final TweetRepository tweetRepository;
  private final FollowRepository followRepository;
  private final TweetSerializer tweetSerializer;

  public FeedService(
      TweetRepository tweetRepository,
      FollowRepository followRepository,
      TweetSerializer tweetSerializer) {
    this.tweetRepository = tweetRepository;
    this.followRepository = followRepository;
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

  /** Tweets from followed accounts — mirrors GET /api/feed/. */
  @Transactional(readOnly = true)
  public Pagination.Page<TweetSerializer.Response> listFeed(
      long userId, Optional<Cursor> cursor) {
    List<Long> followedIds = followRepository.findFollowedIdsByFollowerId(userId);
    Cursor c = cursor.orElse(null);

    Specification<Tweet> base =
        (root, query, cb) -> root.get("user").get("id").in(followedIds);
    Specification<Tweet> whereOlder = c == null ? null : older(c);
    Specification<Tweet> whereNewer = c == null ? null : newer(c);

    Pagination.Page<Tweet> page =
        Pagination.paginate(
            c,
            base,
            whereOlder,
            whereNewer,
            (spec, pageable) -> tweetRepository.findAll(spec, pageable).getContent(),
            "/api/feed/",
            Map.of(),
            Tweet::getCreatedAt,
            Tweet::getId);

    List<TweetSerializer.Response> results =
        page.results().stream().map(t -> tweetSerializer.serialize(t, userId)).toList();
    return new Pagination.Page<>(page.next(), page.previous(), results);
  }
}

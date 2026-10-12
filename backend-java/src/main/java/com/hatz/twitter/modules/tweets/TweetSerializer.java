package com.hatz.twitter.modules.tweets;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hatz.twitter.modules.comments.CommentRepository;
import com.hatz.twitter.modules.likes.LikeRepository;
import com.hatz.twitter.modules.users.User;
import com.hatz.twitter.modules.users.UserProfileResponse;
import com.hatz.twitter.modules.follows.FollowRepository;
import java.time.Instant;
import org.springframework.stereotype.Component;

/** Mirrors Django's TweetSerializer. */
@Component
public class TweetSerializer {
  private final LikeRepository likeRepository;
  private final CommentRepository commentRepository;
  private final FollowRepository followRepository;
  private final TweetRepository tweetRepository;

  public TweetSerializer(
      LikeRepository likeRepository,
      CommentRepository commentRepository,
      FollowRepository followRepository,
      TweetRepository tweetRepository) {
    this.likeRepository = likeRepository;
    this.commentRepository = commentRepository;
    this.followRepository = followRepository;
    this.tweetRepository = tweetRepository;
  }

  public record Response(
      Long id,
      UserProfileResponse user,
      String content,
      @JsonProperty("created_at") Instant createdAt,
      @JsonProperty("updated_at") Instant updatedAt,
      @JsonProperty("likes_count") long likesCount,
      @JsonProperty("comments_count") long commentsCount,
      @JsonProperty("is_liked") boolean isLiked) {}

  public Response serialize(Tweet tweet, Long viewerId) {
    User author = tweet.getUser();
    boolean isFollowing =
        viewerId != null && followRepository.existsByFollowerIdAndFollowedId(viewerId, author.getId());

    UserProfileResponse userProfile =
        new UserProfileResponse(
            author.getId(),
            author.getUsername(),
            author.getEmail(),
            followRepository.countByFollowedId(author.getId()),
            followRepository.countByFollowerId(author.getId()),
            tweetRepository.countByUserId(author.getId()),
            isFollowing);

    boolean isLiked =
        viewerId != null && likeRepository.existsByUserIdAndTweetId(viewerId, tweet.getId());

    return new Response(
        tweet.getId(),
        userProfile,
        tweet.getContent(),
        tweet.getCreatedAt(),
        tweet.getUpdatedAt(),
        likeRepository.countByTweetId(tweet.getId()),
        commentRepository.countByTweetId(tweet.getId()),
        isLiked);
  }
}

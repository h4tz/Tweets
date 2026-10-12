package com.hatz.twitter.modules.comments;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hatz.twitter.modules.follows.FollowRepository;
import com.hatz.twitter.modules.tweets.TweetRepository;
import com.hatz.twitter.modules.users.User;
import com.hatz.twitter.modules.users.UserProfileResponse;
import java.time.Instant;
import org.springframework.stereotype.Component;

/** Mirrors Django's CommentSerializer. */
@Component
public class CommentSerializer {
  private final FollowRepository followRepository;
  private final CommentRepository commentRepository;
  private final TweetRepository tweetRepository;

  public CommentSerializer(
      FollowRepository followRepository,
      CommentRepository commentRepository,
      TweetRepository tweetRepository) {
    this.followRepository = followRepository;
    this.commentRepository = commentRepository;
    this.tweetRepository = tweetRepository;
  }

  public record Response(
      Long id,
      UserProfileResponse user,
      Long tweet,
      @JsonProperty("parent_comment") Long parentComment,
      String content,
      @JsonProperty("created_at") Instant createdAt,
      @JsonProperty("replies_count") long repliesCount) {}

  public Response serialize(Comment comment, Long viewerId) {
    User author = comment.getUser();
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

    return new Response(
        comment.getId(),
        userProfile,
        comment.getTweet().getId(),
        comment.getParentComment() == null ? null : comment.getParentComment().getId(),
        comment.getContent(),
        comment.getCreatedAt(),
        commentRepository.countByParentCommentId(comment.getId()));
  }
}

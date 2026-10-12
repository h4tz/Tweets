package com.hatz.twitter.modules.users;

import com.hatz.twitter.common.ApiError;
import com.hatz.twitter.modules.follows.FollowRepository;
import com.hatz.twitter.modules.tweets.TweetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
  private final UserRepository userRepository;
  private final FollowRepository followRepository;
  private final TweetRepository tweetRepository;

  public UserService(
      UserRepository userRepository,
      FollowRepository followRepository,
      TweetRepository tweetRepository) {
    this.userRepository = userRepository;
    this.followRepository = followRepository;
    this.tweetRepository = tweetRepository;
  }

  /** Mirrors Django's UserProfileSerializer: profile fields + counts + is_following. */
  @Transactional(readOnly = true)
  public UserProfileResponse getProfile(long userId, Long viewerId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(ApiError::notFound);

    boolean isFollowing =
        viewerId != null && followRepository.existsByFollowerIdAndFollowedId(viewerId, userId);

    return new UserProfileResponse(
        user.getId(),
        user.getUsername(),
        user.getEmail(),
        followRepository.countByFollowedId(userId),
        followRepository.countByFollowerId(userId),
        tweetRepository.countByUserId(userId),
        isFollowing);
  }
}

package com.hatz.twitter.modules.follows;

import com.hatz.twitter.common.ApiError;
import com.hatz.twitter.modules.users.UserRepository;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Raised when a user tries to follow themselves (Django's FollowYourselfError). */
class FollowYourselfError extends RuntimeException {
  FollowYourselfError() {
    super("Cannot follow yourself.");
  }
}

@Service
public class FollowService {
  private final FollowRepository followRepository;
  private final UserRepository userRepository;

  public FollowService(FollowRepository followRepository, UserRepository userRepository) {
    this.followRepository = followRepository;
    this.userRepository = userRepository;
  }

  /**
   * Toggle follow. Returns true = followed, false = unfollowed, null = already
   * following (unique-constraint race -> 409), matching Django's status codes.
   */
  @Transactional
  public Boolean toggleFollow(long followerId, long followedId) {
    if (!userRepository.existsById(followedId)) {
      throw ApiError.notFound();
    }
    if (followerId == followedId) {
      throw new FollowYourselfError();
    }

    Optional<Follow> existing = followRepository.findByFollowerIdAndFollowedId(followerId, followedId);
    if (existing.isPresent()) {
      followRepository.delete(existing.get());
      return false;
    }

    var follower = userRepository.findById(followerId).orElseThrow(ApiError::notFound);
    var followed = userRepository.findById(followedId).orElseThrow(ApiError::notFound);
    try {
      followRepository.saveAndFlush(new Follow(follower, followed));
    } catch (DataIntegrityViolationException e) {
      return null;
    }
    return true;
  }

  public static boolean isFollowYourself(Throwable t) {
    return t instanceof FollowYourselfError;
  }
}

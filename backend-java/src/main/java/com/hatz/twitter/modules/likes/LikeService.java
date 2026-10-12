package com.hatz.twitter.modules.likes;

import com.hatz.twitter.common.ApiError;
import com.hatz.twitter.modules.tweets.TweetRepository;
import com.hatz.twitter.modules.users.UserRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LikeService {
  private final LikeRepository likeRepository;
  private final TweetRepository tweetRepository;
  private final UserRepository userRepository;

  public LikeService(
      LikeRepository likeRepository, TweetRepository tweetRepository, UserRepository userRepository) {
    this.likeRepository = likeRepository;
    this.tweetRepository = tweetRepository;
    this.userRepository = userRepository;
  }

  /** Toggle like; true = liked now, false = unliked. Mirrors Django's toggle_like. */
  @Transactional
  public boolean toggleLike(long userId, long tweetId) {
    if (!tweetRepository.existsById(tweetId)) {
      throw ApiError.notFound();
    }
    Optional<Like> existing = likeRepository.findByUserIdAndTweetId(userId, tweetId);
    if (existing.isPresent()) {
      likeRepository.delete(existing.get());
      return false;
    }
    var user = userRepository.findById(userId).orElseThrow(ApiError::notFound);
    var tweet = tweetRepository.findById(tweetId).orElseThrow(ApiError::notFound);
    likeRepository.save(new Like(user, tweet));
    return true;
  }
}

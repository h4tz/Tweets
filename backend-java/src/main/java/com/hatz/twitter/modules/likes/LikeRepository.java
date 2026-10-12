package com.hatz.twitter.modules.likes;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository
    extends JpaRepository<Like, Long>, JpaSpecificationExecutor<Like> {

  Optional<Like> findByUserIdAndTweetId(long userId, long tweetId);

  @Query("select count(l) from Like l where l.tweet.id = :tweetId")
  long countByTweetId(@Param("tweetId") long tweetId);

  @Query("select case when count(l) > 0 then true else false end from Like l where l.user.id = :userId and l.tweet.id = :tweetId")
  boolean existsByUserIdAndTweetId(@Param("userId") long userId, @Param("tweetId") long tweetId);

  @Modifying
  @Query("delete from Like l where l.user.id = :userId and l.tweet.id = :tweetId")
  void deleteByUserIdAndTweetId(@Param("userId") long userId, @Param("tweetId") long tweetId);
}

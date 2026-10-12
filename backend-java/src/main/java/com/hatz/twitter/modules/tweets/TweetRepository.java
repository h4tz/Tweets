package com.hatz.twitter.modules.tweets;

import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TweetRepository
    extends JpaRepository<Tweet, Long>, JpaSpecificationExecutor<Tweet> {

  @Query("select count(t) from Tweet t where t.user.id = :userId")
  long countByUserId(@Param("userId") long userId);

  Optional<Tweet> findById(Long id);
}

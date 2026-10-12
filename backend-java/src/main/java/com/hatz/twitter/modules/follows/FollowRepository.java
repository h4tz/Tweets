package com.hatz.twitter.modules.follows;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FollowRepository
    extends JpaRepository<Follow, Long>, JpaSpecificationExecutor<Follow> {

  Optional<Follow> findByFollowerIdAndFollowedId(long followerId, long followedId);

  @Query("select count(f) from Follow f where f.followed.id = :userId")
  long countByFollowedId(@Param("userId") long userId);

  @Query("select count(f) from Follow f where f.follower.id = :userId")
  long countByFollowerId(@Param("userId") long userId);

  @Query("select case when count(f) > 0 then true else false end from Follow f where f.follower.id = :followerId and f.followed.id = :followedId")
  boolean existsByFollowerIdAndFollowedId(
      @Param("followerId") long followerId, @Param("followedId") long followedId);

  @Query("select f.followed.id from Follow f where f.follower.id = :followerId")
  List<Long> findFollowedIdsByFollowerId(@Param("followerId") long followerId);
}

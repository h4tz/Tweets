package com.hatz.twitter.modules.comments;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository
    extends JpaRepository<Comment, Long>, JpaSpecificationExecutor<Comment> {

  Optional<Comment> findById(Long id);

  @Query("select count(c) from Comment c where c.tweet.id = :tweetId")
  long countByTweetId(@Param("tweetId") long tweetId);

  @Query("select count(c) from Comment c where c.parentComment.id = :commentId")
  long countByParentCommentId(@Param("commentId") long commentId);

  @Query("select c from Comment c where c.tweet.id = :tweetId")
  List<Comment> findAllByTweetId(@Param("tweetId") long tweetId);
}

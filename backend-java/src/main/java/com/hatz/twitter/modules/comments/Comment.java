package com.hatz.twitter.modules.comments;

import com.hatz.twitter.modules.tweets.Tweet;
import com.hatz.twitter.modules.users.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "comments")
public class Comment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "tweet_id", nullable = false)
  private Tweet tweet;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parent_comment_id")
  private Comment parentComment;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  protected Comment() {}

  public Comment(User user, Tweet tweet, Comment parentComment, String content) {
    this.user = user;
    this.tweet = tweet;
    this.parentComment = parentComment;
    this.content = content;
  }

  public Long getId() { return id; }
  public User getUser() { return user; }
  public Tweet getTweet() { return tweet; }
  public Comment getParentComment() { return parentComment; }
  public String getContent() { return content; }
  public Instant getCreatedAt() { return createdAt; }
}

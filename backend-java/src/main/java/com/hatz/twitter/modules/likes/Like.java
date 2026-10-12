package com.hatz.twitter.modules.likes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(
    name = "likes",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "tweet_id"}))
public class Like {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private com.hatz.twitter.modules.users.User user;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "tweet_id", nullable = false)
  private com.hatz.twitter.modules.tweets.Tweet tweet;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  protected Like() {}

  public Like(com.hatz.twitter.modules.users.User user, com.hatz.twitter.modules.tweets.Tweet tweet) {
    this.user = user;
    this.tweet = tweet;
  }

  public Long getId() { return id; }
  public com.hatz.twitter.modules.users.User getUser() { return user; }
  public com.hatz.twitter.modules.tweets.Tweet getTweet() { return tweet; }
  public Instant getCreatedAt() { return createdAt; }
}

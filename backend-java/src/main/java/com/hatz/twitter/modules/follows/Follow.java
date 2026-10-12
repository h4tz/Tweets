package com.hatz.twitter.modules.follows;

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
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(
    name = "follows",
    uniqueConstraints = @UniqueConstraint(columnNames = {"follower_id", "followed_id"}))
public class Follow {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JoinColumn(name = "follower_id", nullable = false)
  private User follower;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JoinColumn(name = "followed_id", nullable = false)
  private User followed;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  protected Follow() {}

  public Follow(User follower, User followed) {
    this.follower = follower;
    this.followed = followed;
  }

  public Long getId() { return id; }
  public User getFollower() { return follower; }
  public User getFollowed() { return followed; }
  public Instant getCreatedAt() { return createdAt; }
}

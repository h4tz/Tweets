package com.hatz.twitter.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final SecretKey accessKey;
  private final SecretKey refreshKey;
  private final long accessTtlMinutes;
  private final long refreshTtlDays;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.refresh-secret}") String refreshSecret,
      @Value("${app.jwt.access-ttl-minutes}") long accessTtlMinutes,
      @Value("${app.jwt.refresh-ttl-days}") long refreshTtlDays) {
    this.accessKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.refreshKey = Keys.hmacShaKeyFor(refreshSecret.getBytes(StandardCharsets.UTF_8));
    this.accessTtlMinutes = accessTtlMinutes;
    this.refreshTtlDays = refreshTtlDays;
  }

  public record Tokens(String refresh, String access) {}

  public Tokens generateTokens(long userId) {
    Instant now = Instant.now();
    String access =
        build(accessKey, userId, "access", now.plus(accessTtlMinutes, ChronoUnit.MINUTES));
    String refresh =
        build(refreshKey, userId, "refresh", now.plus(refreshTtlDays, ChronoUnit.DAYS));
    return new Tokens(refresh, access);
  }

  /** Returns the user id if the access token is valid, else null. */
  public Long parseAccess(String token) {
    return parse(token, accessKey, "access");
  }

  /** Returns the user id if the refresh token is valid, else null. */
  public Long parseRefresh(String token) {
    return parse(token, refreshKey, "refresh");
  }

  private String build(SecretKey key, long userId, String type, Instant expiry) {
    return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim("token_type", type)
        .issuedAt(Date.from(Instant.now()))
        .expiration(Date.from(expiry))
        .signWith(key)
        .compact();
  }

  private Long parse(String token, SecretKey key, String expectedType) {
    try {
      Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
      if (!expectedType.equals(claims.get("token_type", String.class))) {
        return null;
      }
      return Long.valueOf(claims.getSubject());
    } catch (JwtException | IllegalArgumentException e) {
      return null;
    }
  }
}

package com.hatz.twitter.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Reads the authenticated user id that JwtAuthFilter placed in the
 * SecurityContext (null when anonymous).
 */
public final class CurrentUser {
  private CurrentUser() {}

  public static Long id() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !(auth.getPrincipal() instanceof Long)) {
      return null;
    }
    return (Long) auth.getPrincipal();
  }

  /** For routes that require auth — returns the id or throws a 401. */
  public static long requireId() {
    Long id = id();
    if (id == null) {
      throw com.hatz.twitter.common.ApiError.notAuthenticated();
    }
    return id;
  }
}

package com.hatz.twitter.common;

import java.util.Map;

/**
 * HTTP error shaped like a Django REST Framework response so the Java API
 * returns the same bodies as the Django one.
 */
public class ApiError extends RuntimeException {
  private final int status;
  private final Map<String, Object> body;

  public ApiError(int status, Map<String, Object> body) {
    super(String.valueOf(body.getOrDefault("detail", "Error")));
    this.status = status;
    this.body = body;
  }

  public int getStatus() {
    return status;
  }

  public Map<String, Object> getBody() {
    return body;
  }

  public static ApiError notFound() {
    return new ApiError(404, Map.of("detail", "Not found."));
  }

  public static ApiError notAuthenticated() {
    return new ApiError(401, Map.of("detail", "Authentication credentials were not provided."));
  }

  public static ApiError invalidToken() {
    return new ApiError(401, Map.of("detail", "Given token not valid for any token type"));
  }

  public static ApiError permissionDenied() {
    return new ApiError(403, Map.of("detail", "You do not have permission to perform this action."));
  }

  public static ApiError detail(int status, String detail) {
    return new ApiError(status, Map.of("detail", detail));
  }
}

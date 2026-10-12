package com.hatz.twitter.common;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** DRF-style validation errors: { field: ["message", ...] }. */
public class ValidationError extends ApiError {
  private final Map<String, List<String>> errors;

  public ValidationError(Map<String, List<String>> errors) {
    super(400, new LinkedHashMap<>(errors));
    this.errors = errors;
  }

  public static ValidationError of(String field, String message) {
    Map<String, List<String>> errors = new LinkedHashMap<>();
    errors.put(field, List.of(message));
    return new ValidationError(errors);
  }

  public Map<String, List<String>> getErrors() {
    return errors;
  }
}

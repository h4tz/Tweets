package com.hatz.twitter.common;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/** Maps exceptions to DRF-style JSON bodies, matching the Django API. */
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ApiError.class)
  public ResponseEntity<Map<String, Object>> handleApiError(ApiError e) {
    return ResponseEntity.status(e.getStatus()).body(e.getBody());
  }

  /** @Valid failures become { field: ["message"] } like DRF serializers. */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
    Map<String, List<String>> errors = new LinkedHashMap<>();
    for (FieldError fe : e.getBindingResult().getFieldErrors()) {
      errors.computeIfAbsent(fe.getField(), k -> new java.util.ArrayList<>()).add(fe.getDefaultMessage());
    }
    return ResponseEntity.badRequest().body(new LinkedHashMap<>(errors));
  }

  /** Malformed JSON body -> 400 rather than a stack trace. */
  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<Map<String, Object>> handleUnreadable(HttpMessageNotReadableException e) {
    return ResponseEntity.badRequest().body(Map.of("detail", "Malformed request body"));
  }

  /** Unknown routes return Django's 404 shape instead of Spring's error page. */
  @ExceptionHandler(NoResourceFoundException.class)
  public ResponseEntity<Map<String, Object>> handleNoResource(NoResourceFoundException e) {
    return ResponseEntity.status(404).body(Map.of("detail", "Not found."));
  }
}

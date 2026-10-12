package com.hatz.twitter.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

/** Returns DRF's 403 body instead of a bare error. */
@Component
public class DrfAccessDeniedHandler implements AccessDeniedHandler {
  @Override
  public void handle(
      HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDenied)
      throws IOException {
    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
    response.setContentType("application/json");
    response
        .getWriter()
        .write("{\"detail\":\"You do not have permission to perform this action.\"}");
  }
}

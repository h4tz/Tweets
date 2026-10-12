package com.hatz.twitter.common;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

/**
 * Cursor encoding/decoding mirroring the TS version and DRF's CursorPagination:
 * a base64 JSON payload { t: created_at, id: <id>, d: "n"|"p" }.
 */
public record Cursor(Instant t, long id, Dir d) {
  public enum Dir {
    N, P;

    static Dir parse(String s) {
      return "p".equals(s) ? P : N;
    }
  }

  public static Optional<Cursor> decode(String raw) {
    if (raw == null || raw.isBlank()) {
      return Optional.empty();
    }
    try {
      String json = new String(Base64.getDecoder().decode(raw), StandardCharsets.UTF_8);
      // minimal parse: {"t":"...","id":123,"d":"n"}
      Instant t = Instant.parse(extract(json, "t"));
      long id = Long.parseLong(extract(json, "id"));
      Dir d = Dir.parse(extract(json, "d"));
      return Optional.of(new Cursor(t, id, d));
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  public String encode() {
    String json = "{\"t\":\"" + t + "\",\"id\":" + id + ",\"d\":\"" + (d == Dir.P ? "p" : "n") + "\"}";
    return Base64.getEncoder().encodeToString(json.getBytes(StandardCharsets.UTF_8));
  }

  private static String extract(String json, String key) {
    String marker = "\"" + key + "\":";
    int start = json.indexOf(marker);
    if (start < 0) {
      throw new IllegalArgumentException("missing " + key);
    }
    start += marker.length();
    if (json.charAt(start) == '"') {
      int end = json.indexOf('"', start + 1);
      return json.substring(start + 1, end);
    }
    int end = start;
    while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '-')) {
      end++;
    }
    return json.substring(start, end);
  }
}

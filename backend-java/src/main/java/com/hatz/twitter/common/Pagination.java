package com.hatz.twitter.common;

import java.time.Instant;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

/**
 * Cursor pagination mirroring DRF's CursorPagination (page size 20, ordered by
 * -created_at, { next, previous, results } with base64 cursors).
 */
public final class Pagination {
  public static final int PAGE_SIZE = 20;

  private Pagination() {}

  /** DRF-style page envelope. */
  public record Page<T>(String next, String previous, List<T> results) {}

  /**
   * @param finder runs the query for a page (size+1) and returns the raw rows
   * @param createdAt accessor for an item's timestamp (for building cursors)
   * @param idAccessor accessor for an item's id
   */
  public static <T> Page<T> paginate(
      Cursor cursor,
      Specification<T> baseSpec,
      Specification<T> whereOlder,
      Specification<T> whereNewer,
      Finder<T> finder,
      String baseUrl,
      Map<String, String> extraQuery,
      java.util.function.Function<T, Instant> createdAt,
      java.util.function.Function<T, Long> idAccessor) {

    Cursor.Dir dir = cursor == null ? Cursor.Dir.N : cursor.d();
    Sort sort =
        dir == Cursor.Dir.N
            ? Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))
            : Sort.by(Sort.Order.asc("createdAt"), Sort.Order.asc("id"));

    Specification<T> spec = baseSpec;
    if (cursor != null) {
      Specification<T> cursorSpec = dir == Cursor.Dir.N ? whereOlder : whereNewer;
      spec = baseSpec == null ? cursorSpec : baseSpec.and(cursorSpec);
    }

    List<T> found = finder.find(spec, PageRequest.of(0, PAGE_SIZE + 1, sort));
    boolean moreInFetchDirection = found.size() > PAGE_SIZE;
    // Spring Data's Page.getContent() may be immutable — copy before slicing/reversing
    List<T> rows =
        new java.util.ArrayList<>(
            moreInFetchDirection ? found.subList(0, PAGE_SIZE) : found);
    if (rows.isEmpty()) {
      return new Page<>(null, null, List.of());
    }
    if (dir == Cursor.Dir.P) {
      java.util.Collections.reverse(rows);
    }

    T oldest = rows.get(rows.size() - 1);
    T newest = rows.get(0);

    String next =
        switch (dir) {
          case N -> moreInFetchDirection ? buildUrl(baseUrl, cursorOf(createdAt.apply(oldest), idAccessor.apply(oldest), Cursor.Dir.N), extraQuery) : null;
          case P -> buildUrl(baseUrl, cursorOf(createdAt.apply(oldest), idAccessor.apply(oldest), Cursor.Dir.N), extraQuery);
        };
    String previous =
        cursor != null ? buildUrl(baseUrl, cursorOf(createdAt.apply(newest), idAccessor.apply(newest), Cursor.Dir.P), extraQuery) : null;

    return new Page<>(next, previous, rows);
  }

  public static Cursor cursorOf(Instant t, long id, Cursor.Dir d) {
    return new Cursor(t, id, d);
  }

  private static String buildUrl(String baseUrl, Cursor cursor, Map<String, String> extraQuery) {
    StringBuilder sb = new StringBuilder(baseUrl).append("?");
    for (Map.Entry<String, String> e : extraQuery.entrySet()) {
      sb.append(URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8))
          .append("=")
          .append(URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
          .append("&");
    }
    sb.append("cursor=")
        .append(URLEncoder.encode(cursor.encode(), StandardCharsets.UTF_8));
    return sb.toString();
  }

  @FunctionalInterface
  public interface Finder<T> {
    List<T> find(Specification<T> spec, PageRequest pageRequest);
  }
}

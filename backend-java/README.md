# Twitter Backend — Java (Spring Boot)

A Java rewrite of the Django tweet API, mirroring the same routes, JSON contracts
(snake_case fields, DRF-style `{detail: ...}` errors, cursor pagination), and JWT
auth behavior as the original Django project.

## Stack

- **Java 21**
- **Spring Boot 3.5** — Web, Security, Data JPA, Validation
- **SQLite** (via `org.xerial:sqlite-jdbc` + Hibernate community SQLite dialect)
- **JJWT** for JWT access/refresh tokens
- **BCrypt** for password hashing
- Maven (wrapper included: `./mvnw`)

## Run

```bash
cd backend-java
./mvnw spring-boot:run        # or: mvn spring-boot:run
```

The server starts on **http://localhost:4001** (the Django project runs on 8000
and the TypeScript version on 4000, so all three can run side by side).

SQLite creates `dev-java.db` on first run — it is gitignored, so the database is
per-machine and ephemeral.

> **JWT secrets:** `src/main/resources/application.yml` ships with placeholder
> secrets under `app.jwt.*`. Override them in production (e.g.
> `--app.jwt.secret=...` or environment variables), never commit real secrets.

## Parity with the Django API

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/register/` | 201 `{id, username, email}`; DRF-style field validation errors |
| POST | `/api/login/` | 200 `{refresh, access}`; 400 `{detail: "Invalid Credentials"}`; 404 `{detail: "User not found."}` |
| POST | `/api/refresh/` | 200 `{refresh, access}`; invalid token → same shape with nulls |
| GET | `/api/me/` | authenticated profile |
| GET | `/api/users/{id}/` | public profile with counts + `is_following` |
| GET/POST | `/api/tweets/` | public list (cursor paginated) / create |
| GET/PUT/PATCH/DELETE | `/api/tweets/{id}/` | owner-only update/delete (403 otherwise) |
| POST | `/api/tweets/{id}/like/` | 201 when liked, 204 when unliked |
| GET/POST | `/api/tweets/{id}/comments/` | paginated comments / add comment or reply |
| POST | `/api/users/{id}/follow/` | 201 followed, 204 unfollowed, 400 self, 409 duplicate |
| GET | `/api/feed/` | authenticated, tweets from followed accounts |
| GET | `/api/health/` | liveness probe |

### Pagination

Cursor pagination matches DRF's `CursorPagination`: page size **20**, ordered by
`-created_at`, cursors are base64 JSON `{t, id, d}`, responses are
`{next, previous, results}`.

### Error shapes

Errors use Django/DRF bodies:

- `{ "detail": "..." }` for auth/permission/not-found errors
- `{ "<field>": ["..."] }` for validation errors

Unauthenticated → `401 {"detail": "Authentication credentials are missing."}`.
Forbidden → `403 {"detail": "You do not have permission to perform this action."}`.

## Project layout

```
src/main/java/com/hatz/twitter/
  TwitterApplication.java        entry point
  common/                        API error, DRF-shaped exceptions, cursor pagination
  config/                        CORS, password encoder, trailing-slash match
  security/                      JWT service + auth filter, DRF-style 401/403 handlers
  modules/
    auth/     register, login, refresh
    users/    /me/ and /users/{id}/ profiles
    tweets/   timeline CRUD
    likes/    like toggle
    comments/ comment list/create + replies
    follows/  follow toggle
    feed/     followed-accounts timeline
    health/   liveness endpoint
```

Each module follows the same **Controller → Service → Repository** layering.
`*Serializer` classes build response DTOs (mirroring Django serializers) so
relations and counts are resolved explicitly rather than via lazy loading.

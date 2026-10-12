# Learnings: Django vs TypeScript vs Java

The same Twitter API was built three times — Django first (`tweet/`), then ported to Express + Prisma (`backend-ts/`) and Spring Boot + JPA (`backend-java/`), each with identical routes, status codes, and JSON bodies. This doc captures what actually differs between the stacks once the "hello world" phase is over and the contract has to match exactly.

## Side-by-side

| | Django (original) | TypeScript | Java |
| --- | --- | --- | --- |
| Folder | `tweet/` + `twitter/` | `backend-ts/` | `backend-java/` |
| Framework | Django 5.2 + DRF | Express 4 | Spring Boot 3.5 |
| Language | Python — dynamic, runtime checks | TypeScript — static, structural typing | Java — static, nominal typing |
| Database | Django ORM | Prisma (`schema.prisma`) | JPA / Hibernate (entities) |
| Schema setup | `makemigrations` + `migrate` (real migration history) | `prisma db push` (dev-style push, no history) | Hibernate `ddl-auto: update` (no migration tool at all) |
| Auth | `rest_framework_simplejwt` — batteries included | `jsonwebtoken` + middleware you write | Spring Security filter chain + `jjwt` — most ceremony |
| Validation | DRF serializers → `{field: [msgs]}` for free | `zod` schemas, shape rebuilt by hand | `jakarta.validation` annotations + `@Valid` |
| Pagination | `CustomCursorPagination(CursorPagination)`, 6 lines | hand-written cursor helper (~30 lines) | `Pageable`/`Specification` + hand-written cursor helper |
| Passwords | `make_password` / `check_password` | `bcryptjs` | Spring `BCryptPasswordEncoder` |
| Port | 8000 | 4000 | 4001 |
| Extras | admin, Swagger (drf-spectacular), browser UI | hot reload (`tsx watch`), Prisma Studio | compiled artifact, enterprise wiring |

## Architecture: same shape, three dialects

All three follow the same layering Django established:

```
HTTP layer  →  services (business rules)  →  repositories (data access)  →  DB
      ↕ serializers/DTOs shape the JSON on the way in and out
```

- **Django**: class-based views in `views.py` → `services.py` → `repositories.py`, DRF serializers.
- **TypeScript**: `modules/<api>/<api>.routes.ts` → `.service.ts` → `.repository.ts`, explicit serializer functions per DTO.
- **Java**: `*Controller` → `*Service` (`@Transactional`) → `*Repository` (Spring Data), response records.

The layering carries over cleanly, but the framework pulls weight in different places: Django makes the routing + validation + pagination code almost disappear; Express makes you assemble everything from small parts; Spring Boot replaces hand-written code with annotations and auto-configuration (less logic, more configuration).

## Differences that actually mattered

### 1. Trailing slashes
Django's URLs are natively written `/api/tweets/` and it rejects the slash-less form. Express matches **both** `/api/tweets` and `/api/tweets/` out of the box (a footgun if you care about strict parity). Spring Boot 3 matched **neither** with slashes by default — every Django-style URL 404'd until explicit trailing-slash matching was enabled (`cf048bd`). The most boring difference produced the first Java bug.

### 2. Where auth lives
- Django: simplejwt is a settings block plus `IsAuthenticated` on views — the least code.
- Express: `requireAuth` middleware you write, wired per route — easy to reason about, easy to forget on a new route.
- Spring Security: a `SecurityFilterChain` bean, a JWT filter, a `SecurityContext` setter — the most moving parts, but also the only version where "which URLs are public" is a single, greppable configuration block (`SecurityConfig`).

### 3. Validation and error parity
DRF serializers produce `{username: ["A user with that username already exists."]}` for free; matching that exact shape was the fiddliest part of both ports. TypeScript uses `zod` and a `ValidationError` that renders `{field: [msgs]}`. Java uses `jakarta.validation` annotations and an exception handler that formats `MethodArgumentNotValidException` into DRF's shape. Both rewrites needed an explicit "serializer" layer — otherwise Spring would return camelCase JSON and different error bodies than Django.

### 4. Pagination
Django's DRF cursor pagination (page size 20, `next`/`previous`, opaque base64 cursors) is deceptively subtle: cursors encode `{timestamp, id, direction}`, and `previous` requires reversing the current page *and* flipping the sort direction. That logic was rebuilt by hand in TypeScript and Java — roughly the same ~30 lines in each. It was also the source of the most interesting bugs (below).

### 5. Typing and where errors show up
- Python fails at runtime — a wrong field name in a serializer passes silently until a request hits it.
- TypeScript catches contract drift at `tsc --noEmit` time (`npm run typecheck`), but JSON serialization still trusts the shape of what you `res.json(...)`.
- Java is the strictest: response records make the wire format explicit, and a wrong field is a compile error. The trade-off is ceremony — one endpoint is 3-4 files and a pile of imports in Java vs one file in Express.

### 6. Database story
- **Django**: real migration history (`tweet/migrations/`) — the production-grade option.
- **Prisma**: `db push` + a typed client generated from `schema.prisma`; schema changes are one command, and queries are typed end-to-end. No migration history unless you adopt `prisma migrate`.
- **Hibernate**: `ddl-auto: update` keeps tables in sync for development, but it is *not* a migration strategy — the Java port would need Flyway/Liquibase for production.

### 7. Runtime footprint
Django's dev server and `tsx watch` start almost instantly; Spring Boot pays a JVM start-up cost every reload. In return, Java gives you a single deployable JAR, the strictest compile-time guarantees, and the ecosystem most big teams already use.

## Bugs the porting surfaced

Re-implementing the same contract end-to-end (register → login → tweet CRUD → like/comment/follow → feed → error cases, with the same curl matrix against all three servers) caught things that code review would not have:

- **TypeScript** — the first page of paginated endpoints ignored base filters: `/api/feed/` returned the *global* timeline for users with no follows, and tweet/comment lists leaked the wrong ordering on page 1 (`ebd5527`). Reading the code said "parity"; running the same request against both servers proved otherwise.
- **Java** — on the first smoke test, every request that should have been a 401 came back as a 500, and pagination threw `UnsupportedOperationException`. Two independent bugs were masking each other: Spring's `Page.getContent()` returns an *immutable* list (so reversing the page for `previous` crashed), and the error dispatch path (`/error`) was behind auth, so a plain 500 got re-interpreted as a 401 (`8555e9b`).
- **Java** — Django-style URLs with trailing slashes all 404'd on day one (`cf048bd`).
- **Both** — small status-code drift (201 vs 200, 204 vs 200, `{detail: ...}` vs `{error: ...}`) showed up only when diffing real responses. Exact parity lives in the boring details.

## When to use which

- **Django + DRF** — fastest path to a correct, documented API; admin and migrations for free; best when Python is the team's language.
- **Express + TypeScript** — minimal ceremony, instant hot reload, shared types with a JS frontend; best for small teams and full-stack JS.
- **Spring Boot + Java** — most explicit wiring and the strongest compile-time safety; best for large teams and long-lived, enterprise-shaped services.

The main takeaway: **the API contract (routes, status codes, error bodies, pagination semantics) is the real artifact — the framework underneath is replaceable.** The hard parts of a backend are the semantics you promise clients, not the language you write them in, and the only way to prove three implementations are equal is to run the same requests against all of them.

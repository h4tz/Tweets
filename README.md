# Twitter API — one contract, three backends

A Twitter-style REST API (tweets, likes, threaded comments, follows, feed, JWT auth) implemented **three times** in three different backend stacks:

| Backend | Stack | Folder | Port |
| ------- | ----- | ------ | ---- |
| **Django** (original) | Django 5 + DRF + SimpleJWT | `tweet/` + `twitter/` + `manage.py` | 8000 |
| **TypeScript** | Express + Prisma + SQLite | `backend-ts/` | 4000 |
| **Java** | Spring Boot 3 + JPA + SQLite | `backend-java/` | 4001 |

All three expose the **same routes, status codes, and JSON shapes** (DRF-style `snake_case` bodies, `{detail: ...}` errors, `{next, previous, results}` cursor pagination), so they are drop-in replacements for each other. [learnings.md](learnings.md) compares how the three differ in practice.

## API endpoints (shared by all three)

| Method | Route | Notes |
| ------ | ----- | ----- |
| POST | `/api/register/` | 201 `{id, username, email}`, 400 validation errors |
| POST | `/api/login/` | 200 `{refresh, access}`, 404 unknown user, 400 bad password |
| POST | `/api/refresh/` | *TS + Java only* — consumes the refresh token Django's login issues |
| GET | `/api/me/` | auth required, profile with follower/following/tweet counts |
| GET | `/api/users/:id/` | public profile + `is_following` for the viewer |
| GET | `/api/tweets/` | cursor paginated (page size 20) |
| POST | `/api/tweets/` | auth required |
| GET | `/api/tweets/:id/` | 404 `{detail: "Not found."}` |
| PUT/PATCH | `/api/tweets/:id/` | owner only, 403 otherwise |
| DELETE | `/api/tweets/:id/` | owner only, 204 |
| POST | `/api/tweets/:id/like/` | toggle: 201 liked / 204 unliked |
| GET | `/api/tweets/:id/comments/` | cursor paginated |
| POST | `/api/tweets/:id/comments/` | optional `parent_comment`, must belong to the same tweet |
| POST | `/api/users/:id/follow/` | toggle: 201 following / 204 unfollowed, 400 self-follow, 409 duplicate |
| GET | `/api/feed/` | tweets from followed users (self included), newest first |

**Auth**: `Authorization: Bearer <access>` on every endpoint except register/login/refresh. Tokens mirror `simplejwt`: 5-minute access, 1-day refresh.

## Running the Django backend (original)

```bash
python -m venv venv && source venv/bin/activate
pip install django djangorestframework djangorestframework-simplejwt drf-spectacular python-decouple

# create .env in the repo root (python-decouple reads it)
cat > .env <<'EOF'
SECRET_KEY=dev-secret-key
DEBUG=True
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=0
EOF

python manage.py migrate
python manage.py runserver        # http://127.0.0.1:8000
```

- Browser UI: `http://127.0.0.1:8000/` — register, log in, use every `/api/` feature from the page.
- Swagger UI: `http://127.0.0.1:8000/api/schema/swagger-ui/` (drf-spectacular).
- For PostgreSQL instead of SQLite, set the `DB_*` variables accordingly (see `twitter/settings.py`).

## Running the TypeScript backend

```bash
cd backend-ts
cp .env.example .env               # edit the JWT secrets
npm install
npx prisma db push                 # create the SQLite database
npm run db:seed                    # optional demo users: alice / bob (password123)
npm run dev                        # http://localhost:4000
```

- `npm run build` / `npm start` — compile to `dist/` and run
- `npm run typecheck` — `tsc --noEmit`
- `npm run db:studio` — browse the database in Prisma Studio

## Running the Java backend

```bash
cd backend-java
./mvnw spring-boot:run             # http://localhost:4001 — requires JDK 21
```

- The SQLite database (`backend-java/dev-java.db`) and schema are created automatically on first boot (Hibernate `ddl-auto: update`); register users through the API.
- `./mvnw clean package && java -jar target/twitter-0.0.1-SNAPSHOT.jar` also works.
- JWT secrets live in `backend-java/src/main/resources/application.yml` (`app.jwt.*`) — override them in production.

All three were verified against the same smoke-test matrix (register → login → tweet CRUD → like/comment/follow → feed → errors) and return identical bodies and status codes; see each backend's commit history for the parity work.

## Other folders

- `backend/` + `frontend/` — an **earlier, separate experiment**: a Django Ninja chat-backend auth prototype with a small React test app. Not part of the Twitter API.
- `learnings.md` — what differs between the three backends and what the porting work revealed.

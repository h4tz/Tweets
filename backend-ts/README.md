# twitter-backend-ts

A TypeScript rewrite of the Django REST API in `tweet/`, using **Express + Prisma + SQLite**. Same layered structure (routes → services → repositories), same URL routes, and same JSON contracts as the Django version, so it is a drop-in replacement for `/api/`.

## Run it

```bash
cd backend-ts
cp .env.example .env          # edit the JWT secrets
npm install
npx prisma db push            # create the SQLite database
npm run db:seed               # optional demo users: alice / bob (password123)
npm run dev                   # http://localhost:4000
```

- `npm run dev` — start with hot reload (tsx)
- `npm run build` / `npm start` — compile to `dist/` and run
- `npm run typecheck` — `tsc --noEmit`
- `npm run db:studio` — Prisma Studio (browse the DB)

## API parity with the Django version

| Method | Route | Notes |
| ------ | ----- | ----- |
| POST | `/api/register/` | 201 `{id, username, email}`, 400 validation errors |
| POST | `/api/login/` | 200 `{refresh, access}`, 404 unknown user, 400 bad password |
| POST | `/api/refresh/` | 200 fresh `{refresh, access}`, 401 on bad token |
| GET | `/api/me/` | auth required, full profile with counts |
| GET | `/api/users/:id/` | public profile, `is_following` for the viewer |
| GET | `/api/tweets/` | cursor paginated, `{next, previous, results}` |
| POST | `/api/tweets/` | auth required |
| GET | `/api/tweets/:id/` | 404 `{detail: "Not found."}` |
| PUT/PATCH | `/api/tweets/:id/` | owner only, 403 otherwise |
| DELETE | `/api/tweets/:id/` | owner only, 204 |
| POST | `/api/tweets/:tweet_id/like/` | toggle: 201 liked / 204 unliked |
| GET | `/api/tweets/:tweet_id/comments/` | cursor paginated |
| POST | `/api/tweets/:tweet_id/comments/` | optional `parent_comment`, must belong to same tweet |
| POST | `/api/users/:user_id/follow/` | toggle: 201 / 204, 400 self-follow, 409 already following |
| GET | `/api/feed/` | auth required, tweets from followed accounts |

Authentication uses `Authorization: Bearer <access>` like simplejwt: 5-minute access tokens, 1-day refresh tokens (configurable in `.env`).

## Structure

```
src/
  app.ts                 express app + router mounting
  server.ts              entrypoint
  config.ts              env config
  db.ts                  prisma client
  errors.ts              ApiError / ValidationError (DRF-shaped bodies)
  lib/
    jwt.ts               access/refresh token helpers
    password.ts          bcrypt hash/compare
    pagination.ts        DRF-style cursor pagination ({next, previous, results})
  middleware/
    auth.ts              requireAuth / optionalAuth (Bearer JWT)
    error.ts             async handler + DRF-style error responses
  serializers/           response shapes matching Django serializers
  modules/
    auth/                register, login, refresh
    users/               /me and /users/:id profiles
    tweets/              timeline + CRUD
    likes/               like toggle
    comments/            threaded comments
    follows/             follow toggle
    feed/                personalized feed
prisma/
  schema.prisma          User, Tweet, Like, Comment, Follow
  seed.ts                demo data
```

## Differences from Django

- **Database**: SQLite via Prisma (swap `datasource db` provider to `postgresql` and set `DATABASE_URL` to use Postgres instead — no code changes).
- **Cursor pagination**: cursors are base64 `{created_at, id, direction}` and support both `next` and `previous` navigation, mirroring DRF's `CursorPagination` (page size 20, ordered by `-created_at`).
- **No admin/schema/swagger routes**: only the `/api/` endpoints were ported.

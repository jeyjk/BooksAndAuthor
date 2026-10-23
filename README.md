# Node.js JWT + Books API

A starter backend implementing JWT authentication, PostgreSQL authors/books CRUD, Redis per-user rate limiting, and protected image uploads with Sharp.

## Requirements

- Node.js 20+
- PostgreSQL 14+
- Redis 6+

## 1. Configure

```bash
npm install
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL`, `REDIS_URL`, and a strong `JWT_SECRET` (at least 32 characters). Create a PostgreSQL database named `books_api` or change the URL to your database.

Example local services with Docker:

```bash
docker run --name books-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=books_api -p 5432:5432 -d postgres:16
docker run --name books-redis -p 6379:6379 -d redis:7
```

For those example commands, set `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/books_api?schema=public"` in `.env`.

## 2. Create database tables and start

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

Health check: `GET http://localhost:3000/health`.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account; bcrypt password hash |
| POST | `/api/auth/login` | No | Verify password; return JWT |
| GET | `/api/authors` | No | List authors and their books |
| GET | `/api/authors/:id` | No | Get author and books |
| POST | `/api/authors` | Bearer JWT | Create author |
| PUT | `/api/authors/:id` | Bearer JWT | Update author |
| DELETE | `/api/authors/:id` | Bearer JWT | Delete author (fails if books reference it) |
| GET | `/api/books` | No | List books and author names |
| GET | `/api/books/:id` | No | Get one book |
| POST | `/api/books` | Bearer JWT | Create book |
| PUT | `/api/books/:id` | Bearer JWT | Update book |
| DELETE | `/api/books/:id` | Bearer JWT | Delete book |
| POST | `/api/upload` | Bearer JWT | Upload and resize/compress image |

Write endpoints use a Redis fixed-window rate limit keyed by JWT user ID. Defaults are 10 requests per 60 seconds and can be changed using `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_SECONDS`. Register/login also have an IP-based attempt limit.

## Test with curl

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"jeya","email":"jeya@example.com","password":"StrongPass123"}'
```

### Login and copy token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"jeya@example.com","password":"StrongPass123"}'
```

Copy `token` from the response and use it in `Authorization: Bearer YOUR_TOKEN`.

### Create an author

```bash
curl -X POST http://localhost:3000/api/authors \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{"name":"J. K. Author","bio":"Example author biography"}'
```

### Create a book (replace authorId with the returned author ID)

```bash
curl -X POST http://localhost:3000/api/books \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{"title":"Example Book","description":"A demo book","authorId":1,"publishedAt":"2024-01-15"}'
```

### Upload image

```bash
curl -X POST http://localhost:3000/api/upload \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -F 'image=@./example.jpg'
```

The upload limit defaults to 5 MiB. The server accepts common image MIME types, validates content with Sharp, then stores a resized WebP copy under `uploads/`. The response includes a path such as `/uploads/<generated-id>.webp`.

## Notes before production

- Set a unique, high-entropy JWT secret in a secret manager; never commit `.env`.
- Add email verification, password reset, and a policy for account lockout if needed.
- Public author/book reads are intentional here; protect them too if your app requires it.
- Uploaded files are served publicly in this starter. For private uploads, remove the static `/uploads` route and implement an authenticated download endpoint or use private object storage.
- For production behind a proxy, configure Express `trust proxy` carefully before relying on IP-based limits.
- Use migrations in deployment (`prisma migrate deploy`) and backups for PostgreSQL/Redis as appropriate.
- This is a learning/assignment starter, not a complete production security review.

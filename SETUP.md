# 🚀 Setup Guide for Students

A working Next.js + Prisma + Postgres + Docker starter.
Read [README.md](./README.md) first to understand HOW the pieces talk.

---

## Option A — Run with Docker (easiest, recommended)

You only need **Docker Desktop** installed.

```bash
git clone <this-repo-url>
cd learn

# Start everything (Next.js + Postgres)
docker compose up --build
```

Wait until you see `Ready in ...ms`, then open:
👉 **http://localhost:3000**

The first time it runs, Prisma will create the table automatically.

To seed sample products (in another terminal):

```bash
docker compose exec web npx tsx prisma/seed.ts
```

To stop:

```bash
docker compose down
```

To wipe the database and start fresh:

```bash
docker compose down -v
```

---

## Option B — Run Next.js locally, Postgres in Docker

Useful when you want hot reload while editing code.

```bash
# 1. Start only Postgres
docker compose up db -d

# 2. Setup Next.js
npm install
cp .env.example .env
# IMPORTANT: in .env, change "db" → "localhost"
# DATABASE_URL="postgresql://student:student@localhost:5432/learn?schema=public"

# 3. Create tables + seed
npx prisma migrate dev --name init
npm run db:seed

# 4. Start Next.js with hot reload
npm run dev
```

Open 👉 **http://localhost:3000**

---

## What to try

1. **Add a product** in the form — watch it save to Postgres
2. **Refresh the page** — data persists (it's in the database!)
3. **Open Prisma Studio** to see the database visually:
   ```bash
   npm run db:studio
   ```
4. **Stop the `db` container** — what error do you see in the UI? Why?
5. **Add a new field** to `prisma/schema.prisma` (e.g. `description String?`)
   then run `npx prisma migrate dev --name add-description`

---

## Project map

```
learn/
├── app/
│   ├── page.tsx                   ← FRONTEND  (runs in browser)
│   ├── layout.tsx
│   └── api/
│       └── products/
│           ├── route.ts           ← BACKEND   GET, POST
│           └── [id]/route.ts      ← BACKEND   DELETE
├── lib/
│   └── prisma.ts                  ← Prisma client (singleton)
├── prisma/
│   ├── schema.prisma              ← Database shape
│   └── seed.ts                    ← Sample data
├── Dockerfile                     ← Build Next.js image
├── docker-compose.yml             ← Run web + db together
├── .env.example                   ← Copy to .env
├── README.md                      ← Visual learning guide
└── SETUP.md                       ← (this file)
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Can't reach database server at db:5432` | You're running Next.js locally — use `localhost` in `.env`, not `db` |
| Port 3000 already in use | Stop other apps, or change `3000:3000` in `docker-compose.yml` |
| Port 5432 already in use | You have Postgres running locally — stop it, or change the port |
| Changes to `schema.prisma` not applied | Run `npx prisma migrate dev` |
| Want to start fresh | `docker compose down -v` (deletes the database volume) |

---

## Next steps for students

- Add a `User` model with a relation to `Product` (one user has many products)
- Add input validation in the API route
- Add authentication (NextAuth.js)
- Deploy to Vercel + a hosted Postgres (Neon, Supabase, Railway)

# 🎓 Learning Guide: Next.js + Prisma + API + Docker + Postgres

A visual guide showing how each piece talks to the others.

---

## 1. The Big Picture (Who talks to who?)

```
┌────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│                    (Chrome / Firefox / Safari)                      │
└───────────────────────────────┬────────────────────────────────────┘
                                │  HTTP (https://yoursite.com)
                                │  Request: GET /products
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                      🐳 DOCKER HOST (server)                        │
│                                                                     │
│  ┌──────────────────────────┐      ┌──────────────────────────┐    │
│  │   Container: NEXT.JS     │      │   Container: POSTGRES    │    │
│  │                          │      │                          │    │
│  │  ┌────────────────────┐  │      │   ┌──────────────────┐   │    │
│  │  │   FRONTEND (UI)    │  │      │   │                  │   │    │
│  │  │   React pages      │  │      │   │   📦 Database    │   │    │
│  │  │   /app/page.tsx    │  │      │   │                  │   │    │
│  │  └─────────┬──────────┘  │      │   │   Tables:        │   │    │
│  │            │ fetch()      │      │   │   - users        │   │    │
│  │            ▼              │      │   │   - products     │   │    │
│  │  ┌────────────────────┐  │      │   │   - orders       │   │    │
│  │  │   API ROUTES       │  │      │   │                  │   │    │
│  │  │   /app/api/...     │◄─┼──────┼──►│                  │   │    │
│  │  │   (BACKEND)        │  │ SQL  │   │                  │   │    │
│  │  └─────────┬──────────┘  │      │   └──────────────────┘   │    │
│  │            │              │      │                          │    │
│  │            ▼              │      │   Port: 5432             │    │
│  │  ┌────────────────────┐  │      │                          │    │
│  │  │   PRISMA CLIENT    │  │      └──────────────────────────┘    │
│  │  │   (translator)     │  │                                       │
│  │  └────────────────────┘  │                                       │
│  │                          │                                       │
│  │   Port: 3000             │                                       │
│  └──────────────────────────┘                                       │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## 2. What does each part do?

| Layer | Role | Real-world analogy 🍔 |
|-------|------|----------------------|
| **Browser** | Shows the website to user | Customer in a restaurant |
| **Next.js Frontend** | Pages, buttons, forms | The menu and dining room |
| **Next.js API Routes** | Backend logic, rules | The waiter taking orders |
| **Prisma** | Translates JS ↔ SQL | The waiter's order pad → kitchen language |
| **Postgres** | Stores all data | The kitchen pantry/fridge |
| **Docker** | Packages everything | The food truck holding it all |

---

## 3. Step-by-step: A request's journey

Let's follow what happens when a student clicks **"Show Products"**:

```
STEP 1: User clicks button in browser
   │
   │  Browser → "GET /api/products"
   ▼
STEP 2: Next.js server receives request
   │
   │  File: app/api/products/route.ts runs
   ▼
STEP 3: API route calls Prisma
   │
   │  Code: await prisma.product.findMany()
   ▼
STEP 4: Prisma converts to SQL
   │
   │  SQL: SELECT * FROM "Product";
   ▼
STEP 5: Postgres runs the query
   │
   │  Returns rows from the table
   ▼
STEP 6: Prisma converts rows back to JS objects
   │
   │  [{id:1, name:"Apple"}, {id:2, name:"Bread"}]
   ▼
STEP 7: API sends JSON response
   │
   │  HTTP 200 + JSON body
   ▼
STEP 8: Browser shows products on page ✅
```

---

## 4. Frontend ↔ Backend (inside Next.js)

Next.js is special — frontend AND backend live together.

```
   FRONTEND                          BACKEND (API Routes)
   ─────────                         ────────────────────

   app/page.tsx                      app/api/products/route.ts
   ┌──────────────┐                  ┌──────────────────────┐
   │              │   fetch(...)     │                      │
   │  <button>    │ ───────────────► │  export async        │
   │   Click me   │                  │  function GET() {    │
   │  </button>   │                  │    return data       │
   │              │ ◄─────────────── │  }                   │
   │              │   JSON response  │                      │
   └──────────────┘                  └──────────────────────┘
   Runs in BROWSER                   Runs on SERVER
```

**Key idea:** the frontend NEVER talks to Postgres directly.
It always asks the API, and the API talks to the database.

---

## 5. Prisma — the translator 🔤

Prisma sits between your JavaScript code and the SQL database.

```
   You write JavaScript                Prisma turns it into SQL
   ───────────────────                 ────────────────────────

   prisma.user.findMany({       ───►   SELECT * FROM "User"
     where: { age: { gt:18 } }         WHERE age > 18;
   })

   prisma.user.create({         ───►   INSERT INTO "User"
     data: { name: "Ann" }             (name) VALUES ('Ann');
   })
```

**Schema file** `prisma/schema.prisma` describes your tables:

```prisma
model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String  @unique
}
```

Run `npx prisma migrate dev` → Prisma creates the table in Postgres.

---

## 6. Docker — packing everything 📦

Docker runs each service in its own **container** (mini-computer).
They talk over a private **network**.

```
   docker-compose.yml
   ──────────────────

   services:
     web:                 ┐
       image: next-app    │  Container "web"
       ports: 3000:3000   │  ──────────────────►  user can visit :3000
       depends_on: [db]   │
                          │
     db:                  │  Container "db"
       image: postgres    │  ──────────────────►  only "web" can reach it
       ports: 5432        │      (private network)
                          ┘
```

Inside the Next.js container, the database URL is:

```
DATABASE_URL="postgresql://user:pass@db:5432/mydb"
                                    ▲
                                    │
                          The container name "db"
                          becomes the hostname!
```

---

## 7. The full data flow (one diagram to remember)

```
  👤  USER
   │
   │  1. Click button
   ▼
  🌐  BROWSER (React UI) ──── Next.js frontend
   │
   │  2. fetch('/api/...')
   ▼
  ⚙️   API ROUTE ──────────── Next.js backend
   │
   │  3. prisma.xxx.find()
   ▼
  🔤  PRISMA CLIENT
   │
   │  4. SQL query
   ▼
  🐘  POSTGRES
   │
   │  5. Returns rows
   ▼
  (data flows back up the same path)
   │
   ▼
  👤  USER sees the result
```

---

## 8. Try it yourself — minimal project layout

```
my-app/
├── app/
│   ├── page.tsx                  ← FRONTEND page
│   └── api/
│       └── products/
│           └── route.ts          ← BACKEND API
├── prisma/
│   └── schema.prisma             ← Database shape
├── docker-compose.yml            ← Defines containers
├── Dockerfile                    ← How to build Next.js image
└── .env                          ← DATABASE_URL lives here
```

---

## 9. Quick exercise for students 🧠

Ask them to **draw arrows** showing the path of:

1. **A login request** — username/password → ??? → ??? → database
2. **Loading the homepage** — what runs on server vs browser?
3. **What happens if Postgres container stops?** — where does it break?

---

## 10. Cheatsheet

| Command | What it does |
|---------|-------------|
| `docker compose up` | Start all containers |
| `docker compose down` | Stop them |
| `npx prisma migrate dev` | Apply DB schema changes |
| `npx prisma studio` | Visual DB browser |
| `npm run dev` | Start Next.js (without Docker) |

---

✅ **Remember the golden rule:**
> Browser → API → Prisma → Postgres
> (and back the same way)

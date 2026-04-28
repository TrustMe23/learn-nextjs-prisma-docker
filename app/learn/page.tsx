"use client";

import { useState } from "react";

type StepKey = "browser" | "api" | "prisma" | "db";
type Action = "list" | "create" | "delete";

type Step = {
  key: StepKey;
  label: string;
  icon: string;
  desc: string;
  code: string;
};

const ACTIONS: Record<Action, { title: string; steps: Step[] }> = {
  list: {
    title: "GET all products",
    steps: [
      {
        key: "browser",
        label: "Browser",
        icon: "🌐",
        desc: "User opens the page. React calls fetch() to ask the server for products.",
        code: `fetch("/api/products")`,
      },
      {
        key: "api",
        label: "API Route",
        icon: "⚙️",
        desc: "Next.js receives the HTTP request and runs the GET handler.",
        code: `// app/api/products/route.ts
export async function GET() {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}`,
      },
      {
        key: "prisma",
        label: "Prisma",
        icon: "🔤",
        desc: "Prisma translates the JS call into a SQL query.",
        code: `SELECT * FROM "Product" ORDER BY id ASC;`,
      },
      {
        key: "db",
        label: "Postgres",
        icon: "🐘",
        desc: "Database executes the query and returns rows.",
        code: `[
  { id: 1, name: "Apple",  price: 1.2 },
  { id: 2, name: "Bread",  price: 2.5 },
  { id: 3, name: "Milk",   price: 1.8 }
]`,
      },
    ],
  },
  create: {
    title: "POST create a product",
    steps: [
      {
        key: "browser",
        label: "Browser",
        icon: "🌐",
        desc: "User submits the form. fetch() sends a POST with JSON body.",
        code: `fetch("/api/products", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Pizza", price: 9.99 })
})`,
      },
      {
        key: "api",
        label: "API Route",
        icon: "⚙️",
        desc: "Server reads the JSON body and asks Prisma to create the record.",
        code: `export async function POST(req) {
  const body = await req.json();
  const created = await prisma.product.create({
    data: { name: body.name, price: body.price }
  });
  return NextResponse.json(created, { status: 201 });
}`,
      },
      {
        key: "prisma",
        label: "Prisma",
        icon: "🔤",
        desc: "Prisma generates an INSERT statement.",
        code: `INSERT INTO "Product" (name, price, stock)
VALUES ('Pizza', 9.99, 0)
RETURNING *;`,
      },
      {
        key: "db",
        label: "Postgres",
        icon: "🐘",
        desc: "Postgres inserts the row, assigns an id, returns the new row.",
        code: `{ id: 5, name: "Pizza", price: 9.99, stock: 0 }`,
      },
    ],
  },
  delete: {
    title: "DELETE a product",
    steps: [
      {
        key: "browser",
        label: "Browser",
        icon: "🌐",
        desc: "User clicks 🗑️. fetch() sends a DELETE to /api/products/:id",
        code: `fetch("/api/products/3", { method: "DELETE" })`,
      },
      {
        key: "api",
        label: "API Route",
        icon: "⚙️",
        desc: "Dynamic route reads the id from the URL params.",
        code: `// app/api/products/[id]/route.ts
export async function DELETE(_req, { params }) {
  await prisma.product.delete({
    where: { id: Number(params.id) }
  });
  return NextResponse.json({ ok: true });
}`,
      },
      {
        key: "prisma",
        label: "Prisma",
        icon: "🔤",
        desc: "Prisma builds a DELETE statement.",
        code: `DELETE FROM "Product" WHERE id = 3;`,
      },
      {
        key: "db",
        label: "Postgres",
        icon: "🐘",
        desc: "Row is removed. Database returns success.",
        code: `{ ok: true }`,
      },
    ],
  },
};

const COLORS: Record<StepKey, string> = {
  browser: "#3b82f6",
  api: "#8b5cf6",
  prisma: "#06b6d4",
  db: "#10b981",
};

export default function LearnPage() {
  const [action, setAction] = useState<Action>("list");
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [direction, setDirection] = useState<"forward" | "backward" | null>(null);
  const [playing, setPlaying] = useState(false);

  const current = ACTIONS[action];

  async function play() {
    setPlaying(true);
    setActiveStep(-1);
    setDirection("forward");

    for (let i = 0; i < current.steps.length; i++) {
      setActiveStep(i);
      await sleep(1100);
    }

    setDirection("backward");
    for (let i = current.steps.length - 1; i >= 0; i--) {
      setActiveStep(i);
      await sleep(800);
    }

    setActiveStep(-1);
    setDirection(null);
    setPlaying(false);
  }

  function reset() {
    setActiveStep(-1);
    setDirection(null);
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto" }}>
      <h1>🎬 How a request flows</h1>
      <p style={{ color: "#666" }}>
        Pick an action and click <strong>Play</strong>. Watch the request travel through each layer.
      </p>

      <div style={{ display: "flex", gap: 8, margin: "20px 0", flexWrap: "wrap" }}>
        {(Object.keys(ACTIONS) as Action[]).map((a) => (
          <button
            key={a}
            onClick={() => {
              setAction(a);
              reset();
            }}
            disabled={playing}
            style={{
              padding: "8px 16px",
              border: action === a ? "2px solid #3b82f6" : "1px solid #ccc",
              background: action === a ? "#eff6ff" : "white",
              borderRadius: 8,
              cursor: playing ? "not-allowed" : "pointer",
              fontWeight: action === a ? 600 : 400,
            }}
          >
            {ACTIONS[a].title}
          </button>
        ))}
        <button
          onClick={play}
          disabled={playing}
          style={{
            padding: "8px 20px",
            background: playing ? "#9ca3af" : "#10b981",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: playing ? "not-allowed" : "pointer",
            fontWeight: 600,
            marginLeft: "auto",
          }}
        >
          {playing ? "▶ Playing…" : "▶ Play"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          alignItems: "stretch",
          position: "relative",
          marginBottom: 24,
        }}
      >
        {current.steps.map((step, i) => {
          const isActive = activeStep === i;
          const isPast = activeStep > i;
          const color = COLORS[step.key];

          return (
            <div key={step.key} style={{ position: "relative" }}>
              <div
                onClick={() => !playing && setActiveStep(i)}
                style={{
                  border: `2px solid ${isActive ? color : isPast ? color + "55" : "#e5e7eb"}`,
                  background: isActive ? color + "11" : "white",
                  borderRadius: 12,
                  padding: 16,
                  textAlign: "center",
                  cursor: playing ? "default" : "pointer",
                  transition: "all 0.3s ease",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                  boxShadow: isActive ? `0 0 20px ${color}55` : "none",
                  height: "100%",
                }}
              >
                <div style={{ fontSize: 42, marginBottom: 8 }}>{step.icon}</div>
                <div style={{ fontWeight: 700, color: isActive ? color : "#333" }}>
                  {step.label}
                </div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                  Step {i + 1}
                </div>
              </div>

              {i < current.steps.length - 1 && (
                <Arrow
                  active={
                    direction === "forward"
                      ? activeStep >= i
                      : direction === "backward"
                      ? activeStep <= i
                      : false
                  }
                  direction={direction}
                  color={color}
                />
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          minHeight: 240,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 20,
          background: "#fafafa",
        }}
      >
        {activeStep === -1 ? (
          <p style={{ color: "#888", textAlign: "center", margin: "60px 0" }}>
            Click a step or press <strong>▶ Play</strong> to see what happens.
          </p>
        ) : (
          <>
            <div
              style={{
                display: "inline-block",
                background: COLORS[current.steps[activeStep].key],
                color: "white",
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              {current.steps[activeStep].icon} {current.steps[activeStep].label}
            </div>
            <p style={{ margin: "0 0 12px 0", color: "#333" }}>
              {current.steps[activeStep].desc}
            </p>
            <pre
              style={{
                background: "#1e293b",
                color: "#e2e8f0",
                padding: 16,
                borderRadius: 8,
                overflow: "auto",
                fontSize: 13,
                margin: 0,
              }}
            >
              {current.steps[activeStep].code}
            </pre>
          </>
        )}
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: 8,
        }}
      >
        <strong>💡 Try this:</strong> open{" "}
        <a href="/" style={{ color: "#3b82f6" }}>
          the products page
        </a>{" "}
        in another tab. Add a product there → come back here → run "GET all products" to see the
        new row come back from the database.
      </div>

      <h2 style={{ marginTop: 40 }}>The full stack at a glance</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "8px 16px",
          fontSize: 14,
        }}
      >
        <div>🌐</div>
        <div><strong>Browser</strong> — runs React, draws the UI, sends fetch() requests</div>
        <div>⚙️</div>
        <div><strong>Next.js API route</strong> — runs server-side, reads/writes data</div>
        <div>🔤</div>
        <div><strong>Prisma</strong> — translator between JavaScript and SQL</div>
        <div>🐘</div>
        <div><strong>Postgres</strong> — actually stores the data</div>
        <div>🐳</div>
        <div><strong>Docker</strong> — runs Next.js and Postgres in isolated containers</div>
      </div>
    </main>
  );
}

function Arrow({
  active,
  direction,
  color,
}: {
  active: boolean;
  direction: "forward" | "backward" | null;
  color: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        right: -10,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 2,
        fontSize: 24,
        color: active ? color : "#d1d5db",
        transition: "color 0.3s",
        fontWeight: 900,
      }}
    >
      {direction === "backward" ? "←" : "→"}
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

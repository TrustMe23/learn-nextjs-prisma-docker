"use client";

import { useEffect, useState } from "react";

type Product = { id: number; name: string; price: number; stock: number };

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/products");
    setProducts(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) return;
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price: Number(price) }),
    });
    setName("");
    setPrice("");
    load();
  }

  async function remove(id: number) {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>🛒 Products</h1>
        <a
          href="/learn"
          style={{
            background: "#3b82f6",
            color: "white",
            padding: "8px 16px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          🎬 See how it works
        </a>
      </div>
      <p style={{ color: "#666" }}>
        Browser → <code>/api/products</code> → Prisma → Postgres
      </p>

      <form onSubmit={add} style={{ display: "flex", gap: 8, margin: "20px 0" }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <input
          placeholder="Price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ width: 100, padding: 8 }}
        />
        <button type="submit" style={{ padding: "8px 16px" }}>
          Add
        </button>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <ul style={{ padding: 0, listStyle: "none" }}>
          {products.map((p) => (
            <li
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <span>
                <strong>{p.name}</strong> — ${p.price.toFixed(2)} (stock: {p.stock})
              </span>
              <button onClick={() => remove(p.id)}>🗑️</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products  — list all products
export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(products);
}

// POST /api/products  — create a product
export async function POST(req: Request) {
  const body = await req.json();
  const created = await prisma.product.create({
    data: { name: body.name, price: body.price, stock: body.stock ?? 0 },
  });
  return NextResponse.json(created, { status: 201 });
}

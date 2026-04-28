import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/products/:id
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.product.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}

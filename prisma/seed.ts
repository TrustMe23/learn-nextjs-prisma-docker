import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();
  await prisma.product.createMany({
    data: [
      { name: "Apple", price: 1.2, stock: 50 },
      { name: "Bread", price: 2.5, stock: 20 },
      { name: "Milk", price: 1.8, stock: 30 },
      { name: "Cheese", price: 4.5, stock: 10 },
    ],
  });
  console.log("✅ Seeded products");
}

main().finally(() => prisma.$disconnect());

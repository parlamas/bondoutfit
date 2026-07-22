// scripts/seed-demo.ts
import { prisma } from "../src/lib/prisma";

async function seedDemo() {
  // 1. Find the demo store (owned by the STORE_MANAGER demo account)
  const store = await prisma.store.findFirst({
    where: {
      manager: { email: "horistics@outlook.com" },
    },
  });

  if (!store) {
    throw new Error("Demo store not found — check the manager's email/store link.");
  }

  // 2. Upsert demo items — edit these values whenever you want the demo to change
  await prisma.storeItem.upsert({
    where: { sku: "DEMO-SHIRT-001" },
    update: {
      name: "Linen Shirt",
      price: 4900, // stored in cents
      stockQuantity: 12,
      visible: true,
    },
    create: {
      storeId: store.id,
      sku: "DEMO-SHIRT-001",
      name: "Linen Shirt",
      category: "CLOTHING",
      price: 4900,
      currency: "EUR",
      stockQuantity: 12,
      isInStock: true,
      visible: true,
    },
  });

  // 3. Upsert a demo discount
  await prisma.discount.upsert({
    where: { id: "demo-discount-001" },
    update: {
      title: "Welcome Discount",
      discountPercent: 15,
      validFrom: new Date("2026-01-01"),
      validTo: new Date("2027-01-01"),
    },
    create: {
      id: "demo-discount-001",
      storeId: store.id,
      title: "Welcome Discount",
      description: "10 minute demo — enjoy 15% off",
      discountPercent: 15,
      type: "PERCENTAGE",
      validFrom: new Date("2026-01-01"),
      validTo: new Date("2027-01-01"),
    },
  });
}

seedDemo()
  .then(() => {
    console.log("Demo store seeded successfully.");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });



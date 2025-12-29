//scripts/test-store-table.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  try {
    const stores = await prisma.store.findMany();
    console.log("✅ Store table exists. Rows:", stores.length);
  } catch (err) {
    console.error("❌ Store table does NOT exist:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();

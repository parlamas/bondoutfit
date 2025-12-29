//scripts/manual-signup-test.cjs

// scripts/manual-signup-test.cjs

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.create({
      data: {
        email: "test@store.com",
        name: "Test Store Owner",
        phoneNumber: "123456789",
        city: "Salem",
        state: "Oregon",
        zip: "97301",
        role: "STORE_MANAGER",
      },
    });

    console.log("✅ User created:", user.id);
  } catch (err) {
    console.error("❌ Error creating user:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();


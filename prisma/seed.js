const { PrismaClient, UserRole } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  try {
    // Create store manager
    const managerPassword = await bcrypt.hash("manager123", 10);
    const manager = await prisma.user.create({
      data: {
        email: "manager@example.com",
        name: "Store Manager",
        password: managerPassword,
        emailVerified: new Date(),
        role: UserRole.STORE_MANAGER,
        phoneNumber: "1234567890",
        city: "New York",
        state: "NY",
        zip: "10001",
      },
    });

    // Create customer
    const customerPassword = await bcrypt.hash("customer123", 10);
    const customer = await prisma.user.create({
      data: {
        email: "customer@example.com",
        name: "John Customer",
        password: customerPassword,
        emailVerified: new Date(),
        role: UserRole.CUSTOMER,
        phoneNumber: "5551234567",
        city: "Los Angeles",
        state: "CA",
        age: 30,
        gender: "Male",
      },
    });

    // Create a store
    const store = await prisma.store.create({
      data: {
        name: "Fashion Boutique",
        managerId: manager.id,
        email: "store@example.com",
        phoneNumber: "1234567890",
        country: "USA",
        city: "New York",
        state: "NY",
        zip: "10001",
        street: "5th Avenue",
        streetNumber: "123",
        acceptedCurrencies: ["USD", "EUR"],
        categories: ["CLOTHING", "ACCESSORIES"],
      },
    });

    console.log("✅ Database seeded successfully!");
    console.log(`🏪 Store: ${store.name}`);
    console.log(`👤 Manager: ${manager.email} / manager123`);
    console.log(`🛍️ Customer: ${customer.email} / customer123`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

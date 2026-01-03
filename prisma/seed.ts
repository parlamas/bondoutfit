// prisma/seed.ts - UPDATED VERSION
import { PrismaClient, UserRole, StoreImageType } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user (ADMIN role doesn't exist, use STORE_MANAGER or CUSTOMER)
  const adminPassword = await hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      emailVerified: new Date(),
      role: UserRole.STORE_MANAGER, // Changed from ADMIN to STORE_MANAGER
      phoneNumber: '1234567890',
      city: 'San Francisco',
      state: 'CA'
      // removed: preferredCurrency: 'USD' (field doesn't exist)
    }
  })

  // Create store manager
  const managerPassword = await hash('manager123', 10)
  const manager = await prisma.user.create({
    data: {
      email: 'manager@fashionstore.com',
      name: 'Store Manager',
      password: managerPassword,
      emailVerified: new Date(),
      role: UserRole.STORE_MANAGER,
      phoneNumber: '9876543210',
      city: 'New York',
      state: 'NY',
      zip: '10001'
      // removed: preferredCurrency: 'USD'
    }
  })

  // Create customer
  const customerPassword = await hash('customer123', 10)
  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      name: 'John Customer',
      password: customerPassword,
      emailVerified: new Date(),
      role: UserRole.CUSTOMER,
      phoneNumber: '5551234567',
      city: 'Los Angeles',
      state: 'CA',
      age: 30,
      gender: 'Male'
      // removed: preferredCurrency: 'USD'
    }
  })

  // Create a store with all new fields
  const store = await prisma.store.create({
    data: {
      name: 'Urban Fashion Boutique',
      // removed: description: 'Modern clothing store with the latest trends and styles',
      managerId: manager.id,
      email: 'contact@urbanfashion.com',
      // removed: website: 'https://urbanfashion.com',
      phoneCountry: '+1',
      phoneArea: '212',
      phoneNumber: '5550199',
      // removed: supportEmail: 'support@urbanfashion.com',
      country: 'USA',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      street: 'Broadway',
      streetNumber: '123',
      floor: 'Ground Floor',
      // removed: latitude: 40.7128,
      // removed: longitude: -74.0060,
      acceptedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      categories: ['CLOTHING', 'FOOTWEAR', 'ACCESSORIES'],
      // removed: tags: ['fashion', 'trendy', 'urban', 'boutique'],
      // removed: isActive: true,
      // removed: isVerified: true,
      // removed: rating: 4.5,
      // removed: totalReviews: 42,
      // removed: facebookUrl: 'https://facebook.com/urbanfashion',
      // removed: instagramUrl: 'https://instagram.com/urbanfashion',
      // removed: twitterUrl: 'https://twitter.com/urbanfashion',
      // removed: openingHours: JSON.stringify([
      //   { day: 'Monday', open: '09:00', close: '18:00', closed: false },
      //   { day: 'Tuesday', open: '09:00', close: '18:00', closed: false },
      //   { day: 'Wednesday', open: '09:00', close: '18:00', closed: false },
      //   { day: 'Thursday', open: '09:00', close: '20:00', closed: false },
      //   { day: 'Friday', open: '09:00', close: '20:00', closed: false },
      //   { day: 'Saturday', open: '10:00', close: '18:00', closed: false },
      //   { day: 'Sunday', open: '11:00', close: '17:00', closed: false }
      // ])
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Admin: ${admin.email} / admin123`)
  console.log(`🏪 Manager: ${manager.email} / manager123`)
  console.log(`🛍️ Customer: ${customer.email} / customer123`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

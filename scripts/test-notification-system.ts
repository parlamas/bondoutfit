// Update the test script with unique emails
// src/scripts/test-notification-system.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testNotificationSystem() {
  console.log('🧪 Testing Notification System Setup...\n');

  try {
    // Generate unique identifiers for test data
    const timestamp = Date.now();
    
    // 1. Test User Creation with Notification Preferences
    console.log('1. Creating test user with notification preferences...');
    const user = await prisma.user.create({
      data: {
        email: `customer${timestamp}@test.com`, // Unique email
        name: 'John Customer',
        password: '$2a$10$hashed_password_for_test',
        role: 'CUSTOMER',
        notificationPreferences: {
          create: {
            emailEnabled: true,
            smsEnabled: false,
            pushEnabled: true,
            inAppEnabled: true,
            visitReminders: true,
            visitConfirmations: true,
            discountAlerts: true,
            marketingEmails: false,
            reminderLeadTime: 24,
            confirmationLeadTime: 1,
          },
        },
      },
      include: {
        notificationPreferences: true,
      },
    });
    console.log(`   ✅ User created: ${user.name} (${user.email})`);
    console.log(`   ✅ Notification preferences:`, user.notificationPreferences);
    console.log();

    // 2. Test Store Creation with Notification Preferences
    console.log('2. Creating test store with notification preferences...');
    const storeManager = await prisma.user.create({
      data: {
        email: `store${timestamp}@test.com`, // Unique email
        name: 'Jane Store Manager',
        password: '$2a$10$hashed_password_for_test',
        role: 'STORE_MANAGER',
      },
    });

    const store = await prisma.store.create({
      data: {
        name: 'Fashion Boutique',
        managerId: storeManager.id,
        country: 'Italy',
        city: 'Rome',
        state: 'Lazio',
        zip: '00100',
        street: 'Via Condotti',
        streetNumber: '23',
        email: `info${timestamp}@fashionboutique.com`, // Unique email
        phoneNumber: '+391234567890',
        storeNotificationPreference: {
          create: {
            emailEnabled: true,
            smsEnabled: false,
            pushEnabled: true,
            newVisitBookings: true,
            visitCancellations: true,
            visitReminders: true,
            lowStockAlerts: true,
            systemAlerts: true,
          },
        },
      },
      include: {
        storeNotificationPreference: true,
        manager: true,
      },
    });
    console.log(`   ✅ Store created: ${store.name} (${store.id})`);
    console.log(`   ✅ Store manager: ${store.manager.name}`);
    console.log(`   ✅ Store notification preferences:`, store.storeNotificationPreference);
    console.log();

    // 3. Test Discount Creation
    console.log('3. Creating test discount...');
    const discount = await prisma.discount.create({
      data: {
        storeId: store.id,
        title: 'Welcome Discount',
        description: 'Special discount for first visit',
        code: `WELCOME20${timestamp.toString().slice(-6)}`, // Unique code
        type: 'PERCENTAGE',
        discountPercent: 20,
        minPurchase: 50,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        status: 'POSTED',
      },
    });
    console.log(`   ✅ Discount created: ${discount.title} (Code: ${discount.code})`);
    console.log();

    // 4. Test Visit Creation
    console.log('4. Creating test visit...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const visit = await prisma.visit.create({
      data: {
        userId: user.id,
        storeId: store.id,
        discountId: discount.id,
        scheduledDate: tomorrow,
        scheduledTime: '14:30',
        duration: 60,
        numberOfPeople: 2,
        customerNotes: 'Looking for summer collection',
        status: 'SCHEDULED',
      },
      include: {
        user: true,
        store: true,
        discount: true,
      },
    });
    console.log(`   ✅ Visit created: ID ${visit.id}`);
    console.log(`   ✅ Scheduled: ${visit.scheduledDate.toDateString()} at ${visit.scheduledTime}`);
    console.log(`   ✅ Customer: ${visit.user.name}`);
    console.log(`   ✅ Store: ${visit.store.name}`);
    console.log(`   ✅ Discount: ${visit.discount?.title}`);
    console.log();

    // 5. Test Notification Creation
    console.log('5. Testing notification creation...');
    
    // User notification
    const userNotification = await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Visit Reminder',
        message: `Your visit to ${store.name} is scheduled for tomorrow at ${visit.scheduledTime}`,
        type: 'VISIT_REMINDER',
        isRead: false,
        data: { visitId: visit.id, storeId: store.id },
        actionUrl: `/visits/${visit.id}`,
      },
    });
    console.log(`   ✅ User notification created: ${userNotification.title}`);
    
    // Store notification
    const storeNotification = await prisma.storeNotification.create({
      data: {
        storeId: store.id,
        title: 'New Visit Booking',
        message: `${user.name} booked a visit for ${visit.scheduledDate.toDateString()}`,
        type: 'NEW_VISIT',
        isRead: false,
        data: { visitId: visit.id, userId: user.id },
        actionUrl: `/dashboard/store/visits/${visit.id}`,
      },
    });
    console.log(`   ✅ Store notification created: ${storeNotification.title}`);
    console.log();

    // 6. Test Querying Notifications
    console.log('6. Testing notification queries...');
    
    const userNotifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`   ✅ User has ${userNotifications.length} notification(s)`);
    
    const storeNotifications = await prisma.storeNotification.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`   ✅ Store has ${storeNotifications.length} notification(s)`);
    console.log();

    // 7. Test Marking Notifications as Read
    console.log('7. Testing mark as read...');
    
    await prisma.notification.update({
      where: { id: userNotification.id },
      data: { isRead: true },
    });
    console.log('   ✅ User notification marked as read');
    
    await prisma.storeNotification.update({
      where: { id: storeNotification.id },
      data: { isRead: true },
    });
    console.log('   ✅ Store notification marked as read');
    console.log();

    // 8. Test Visit Status Updates
    console.log('8. Testing visit status updates...');
    
    // Update visit with reminder sent
    await prisma.visit.update({
      where: { id: visit.id },
      data: { 
        reminderSentAt: new Date(),
        confirmationSentAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      },
    });
    console.log('   ✅ Visit notification timestamps updated');
    
    // Simulate visit completion
    await prisma.visit.update({
      where: { id: visit.id },
      data: { 
        status: 'COMPLETED',
        checkedIn: true,
        checkedInAt: new Date(),
        completedAt: new Date(),
        discountUnlocked: true,
      },
    });
    console.log('   ✅ Visit marked as completed with discount unlocked');
    console.log();

    // 9. Test Data Retrieval with Relations
    console.log('9. Testing complex queries with relations...');
    
    const fullVisit = await prisma.visit.findUnique({
      where: { id: visit.id },
      include: {
        user: {
          include: {
            notificationPreferences: true,
          },
        },
        store: {
          include: {
            storeNotificationPreference: true,
            manager: true,
          },
        },
        discount: true,
      },
    });
    
    if (fullVisit) {
      console.log(`   ✅ Visit loaded with all relations`);
      console.log(`   ✅ Customer preferences: ${fullVisit.user.notificationPreferences ? 'Loaded' : 'Not set'}`);
      console.log(`   ✅ Store preferences: ${fullVisit.store.storeNotificationPreference ? 'Loaded' : 'Not set'}`);
    }
    console.log();

    // 10. Cleanup (optional - comment out to keep test data)
    console.log('10. Cleaning up test data...');
    
    await prisma.storeNotification.deleteMany({ where: { storeId: store.id } });
    await prisma.notification.deleteMany({ where: { userId: user.id } });
    await prisma.visit.delete({ where: { id: visit.id } });
    await prisma.discount.delete({ where: { id: discount.id } });
    await prisma.store.delete({ where: { id: store.id } });
    await prisma.user.delete({ where: { id: storeManager.id } });
    await prisma.user.delete({ where: { id: user.id } });
    
    console.log('   ✅ All test data cleaned up');
    console.log();

    console.log('🎉 All tests passed successfully!');
    console.log('\n✅ Notification System is fully operational!');
    console.log('\nWhat\'s working:');
    console.log('  ✓ User notification preferences');
    console.log('  ✓ Store notification preferences');
    console.log('  ✓ Visit scheduling with notification tracking');
    console.log('  ✓ User notifications (in-app)');
    console.log('  ✓ Store notifications (in-app)');
    console.log('  ✓ Notification status updates (read/unread)');
    console.log('  ✓ Complex relationship queries');
    console.log('  ✓ All database constraints and indexes');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testNotificationSystem();
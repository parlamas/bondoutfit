// src/scripts/test-email-service.ts

import { sendNotificationEmail } from '@/lib/email';
import { NotificationService } from '@/lib/notifications/notification-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testEmailService() {
  console.log('📧 Testing Email Service...\n');

  try {
    // Test 1: Direct email template
    console.log('1. Testing email templates...');
    
    const testData = {
      storeName: 'Test Store',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      scheduledTime: '14:30',
      storeAddress: '123 Test Street, Test City',
      numberOfPeople: 2,
      visitId: 'test-visit-123',
    };

    // This will send a real email - use a test email address
    await sendNotificationEmail(
      'test@example.com', // Replace with your test email
      'Test Email',
      'visit-reminder',
      testData
    );
    
    console.log('   ✅ Email sent successfully (check spam folder)');
    console.log();

    // Test 2: Notification Service integration
    console.log('2. Testing Notification Service...');
    
    const notificationService = new NotificationService();
    
    // Create test data for notification service
    const user = await prisma.user.create({
      data: {
        email: 'testemail@example.com', // Replace with your test email
        name: 'Email Test User',
        password: 'test',
        role: 'CUSTOMER',
        notificationPreferences: {
          create: {
            emailEnabled: true,
            visitReminders: true,
          },
        },
      },
    });

    const store = await prisma.store.create({
      data: {
        name: 'Email Test Store',
        managerId: user.id,
        country: 'Test',
        city: 'Test',
        state: 'Test',
        zip: '12345',
        street: 'Test',
        streetNumber: '123',
        email: 'store@test.com',
        storeNotificationPreference: {
          create: {
            emailEnabled: true,
            newVisitBookings: true,
          },
        },
      },
    });

    const visit = await prisma.visit.create({
      data: {
        userId: user.id,
        storeId: store.id,
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        scheduledTime: '15:00',
        status: 'SCHEDULED',
      },
    });

    console.log('   ✅ Test data created');
    console.log('   ⚠️  Uncomment the lines below to send actual notifications');
    console.log();
    
    // Uncomment to test actual notification sending:
    /*
    console.log('   Sending store notification...');
    await notificationService.notifyStoreNewVisit(visit.id);
    console.log('   ✅ Store notification sent');
    
    console.log('   Sending visit reminder...');
    await notificationService.sendVisitReminder(visit.id);
    console.log('   ✅ Visit reminder sent');
    */

    // Cleanup
    await prisma.visit.delete({ where: { id: visit.id } });
    await prisma.store.delete({ where: { id: store.id } });
    await prisma.user.delete({ where: { id: user.id } });

    console.log('   ✅ Test data cleaned up');
    console.log();

    console.log('🎉 Email Service Test Complete!');
    console.log('\nNext steps:');
    console.log('1. Update test email addresses to real ones');
    console.log('2. Uncomment notification sending code');
    console.log('3. Check your email inbox (and spam folder)');

  } catch (error) {
    console.error('❌ Email test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEmailService();
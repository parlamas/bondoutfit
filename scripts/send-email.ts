//test-send-email.ts

import { sendNotificationEmail } from '../src/lib/email';

async function test() {
  console.log('📧 Testing email sending...');
  
  try {
    await sendNotificationEmail(
      'test@example.com', // Replace with your email
      'Test Notification',
      'visit-reminder',
      {
        storeName: 'Test Store',
        scheduledDate: new Date(),
        scheduledTime: '14:30',
        storeAddress: '123 Test St',
        numberOfPeople: 2,
        visitId: 'test-123',
      }
    );
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
}

test();

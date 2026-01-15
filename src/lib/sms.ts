// src/lib/sms.ts

import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, message: string) {
  if (!process.env.TWILIO_ENABLED || process.env.TWILIO_ENABLED === 'false') {
    console.log(`SMS would be sent to ${to}: ${message}`);
    return { success: true, sid: 'demo' };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error };
  }
}

// SMS message templates
export const smsTemplates = {
  'visit-reminder': (data: any) => 
    `Reminder: Your visit to ${data.storeName} is tomorrow at ${data.scheduledTime}. View: ${process.env.NEXTAUTH_URL}/visits/${data.visitId}`,
  
  'store-new-visit': (data: any) =>
    `New visit booked: ${data.customerName} on ${new Date(data.scheduledDate).toLocaleDateString()} at ${data.scheduledTime}.`,
  
  'visit-confirmation': (data: any) =>
    `Your visit to ${data.storeName} is confirmed for ${new Date(data.scheduledDate).toLocaleDateString()} at ${data.scheduledTime}.`,
};
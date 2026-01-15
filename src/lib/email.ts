// src/lib/email.ts - COMPLETE FILE (400+ lines)

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// ==================== SINGLE TRANSPORTER DEFINITION ====================
// Using SMTP configuration
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASSWORD || 'testpass',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ==================== EMAIL CONFIG CHECK ====================
export async function checkEmailConfig() {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to take messages');
    return true;
  } catch (error) {
    console.warn('⚠️  Email server not configured. Notifications will be logged but not sent.');
    console.warn('   Set EMAIL_USER and EMAIL_PASSWORD in .env file');
    return false;
  }
}

// ==================== PASSWORD RESET EMAIL ====================
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  role: "CUSTOMER" | "STORE_MANAGER" | "ADMIN"
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}&type=${
    role === "STORE_MANAGER" || role === "ADMIN" ? "store" : "customer"
  }`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"BondOutfit SVD" <noreply@bondoutfit.com>',
    to: email,
    subject: 'Reset your BondOutfit password',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your BondOutfit account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
}

// ==================== VERIFICATION EMAIL ====================
export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"BondOutfit SVD" <noreply@bondoutfit.com>',
    to: email,
    subject: 'Verify your BondOutfit account',
    html: `
      <h2>Welcome to BondOutfit SVD!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

// ==================== NOTIFICATION EMAILS TEMPLATES ====================
export async function sendNotificationEmail(
  to: string,
  subject: string,
  template: string,
  data: Record<string, any>
) {
  // Define email templates
  const templates = {
    'visit-reminder': {
      subject: `Visit Reminder: ${data.storeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">BondOutfit SVD</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Visit Reminder</h2>
            <p style="color: #666; font-size: 16px;">Your visit to <strong>${data.storeName}</strong> is scheduled for:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>📅 Date:</strong> ${new Date(data.scheduledDate).toLocaleDateString()}</p>
              <p style="margin: 10px 0;"><strong>⏰ Time:</strong> ${data.scheduledTime}</p>
              <p style="margin: 10px 0;"><strong>📍 Location:</strong> ${data.storeAddress || data.storeName}</p>
              ${data.numberOfPeople ? `<p style="margin: 10px 0;"><strong>👥 Number of people:</strong> ${data.numberOfPeople}</p>` : ''}
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/visits/${data.visitId}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Visit Details
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Need to reschedule or cancel? Visit your dashboard to manage your visit.</p>
          </div>
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© ${new Date().getFullYear()} BondOutfit SVD. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    },
    'store-new-visit': {
      subject: `New Visit Booking: ${data.customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">BondOutfit Store</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">New Visit Booked! 🎉</h2>
            <p style="color: #666; font-size: 16px;"><strong>${data.customerName}</strong> has booked a visit to your store.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>👤 Customer:</strong> ${data.customerName}</p>
              <p style="margin: 10px 0;"><strong>📅 Date:</strong> ${new Date(data.scheduledDate).toLocaleDateString()}</p>
              <p style="margin: 10px 0;"><strong>⏰ Time:</strong> ${data.scheduledTime}</p>
              <p style="margin: 10px 0;"><strong>👥 Number of people:</strong> ${data.numberOfPeople}</p>
              ${data.customerNotes ? `<p style="margin: 10px 0;"><strong>📝 Notes:</strong> ${data.customerNotes}</p>` : ''}
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard/store/visits/${data.visitId}" 
                 style="background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Manage Visit
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Please prepare for the customer's visit and ensure your store is ready.</p>
          </div>
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© ${new Date().getFullYear()} BondOutfit SVD. All rights reserved.</p>
            <p>This is an automated notification from your BondOutfit store dashboard.</p>
          </div>
        </div>
      `,
    },
    'visit-confirmation': {
      subject: `Visit Confirmed: ${data.storeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Visit Confirmed ✓</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Your visit has been confirmed!</h2>
            <p style="color: #666; font-size: 16px;">Your visit to <strong>${data.storeName}</strong> is confirmed for:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>📅 Date:</strong> ${new Date(data.scheduledDate).toLocaleDateString()}</p>
              <p style="margin: 10px 0;"><strong>⏰ Time:</strong> ${data.scheduledTime}</p>
              <p style="margin: 10px 0;"><strong>📍 Address:</strong> ${data.storeAddress}</p>
              ${data.discountCode ? `
                <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin-top: 15px;">
                  <p style="margin: 0; color: #2e7d32;"><strong>🎁 Your Discount Code:</strong> ${data.discountCode}</p>
                  <p style="margin: 5px 0 0 0; font-size: 14px;">Show this code at the store to claim your discount!</p>
                </div>
              ` : ''}
            </div>
            <p style="color: #666; font-size: 14px;">We look forward to seeing you at the store!</p>
          </div>
        </div>
      `,
    },
    'visit-cancelled': {
      subject: `Visit Cancelled: ${data.storeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Visit Cancelled</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Visit Cancellation Notice</h2>
            <p style="color: #666; font-size: 16px;">Your visit to <strong>${data.storeName}</strong> has been cancelled.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Original Date:</strong> ${new Date(data.scheduledDate).toLocaleDateString()}</p>
              <p style="margin: 10px 0;"><strong>Original Time:</strong> ${data.scheduledTime}</p>
              ${data.cancellationReason ? `<p style="margin: 10px 0;"><strong>Reason:</strong> ${data.cancellationReason}</p>` : ''}
            </div>
            <p style="color: #666; font-size: 14px;">We're sorry to see you go! You can always book a new visit when you're ready.</p>
          </div>
        </div>
      `,
    },
    'visit-missed': {
      subject: `Missed Visit: ${data.storeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Missed Visit</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">We noticed you missed your visit</h2>
            <p style="color: #666; font-size: 16px;">Your visit to <strong>${data.storeName}</strong> was scheduled for:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>📅 Date:</strong> ${new Date(data.scheduledDate).toLocaleDateString()}</p>
              <p style="margin: 10px 0;"><strong>⏰ Time:</strong> ${data.scheduledTime}</p>
              ${data.storeAddress ? `<p style="margin: 10px 0;"><strong>📍 Address:</strong> ${data.storeAddress}</p>` : ''}
            </div>
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ Important:</strong> Multiple missed visits may affect your ability to book future visits.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/schedule/${data.storeId}" 
                 style="background: #ee5a52; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reschedule Visit
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">If there was an issue preventing you from attending, please contact the store directly.</p>
          </div>
        </div>
      `,
    },
    'store-missed-visit': {
      subject: `Customer Missed Visit: ${data.customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Customer Missed Visit</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">A customer missed their scheduled visit</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>👤 Customer:</strong> ${data.customerName}</p>
              <p style="margin: 10px 0;"><strong>📅 Scheduled Date:</strong> ${new Date(data.scheduledDate).toLocaleDateString()}</p>
              <p style="margin: 10px 0;"><strong>⏰ Scheduled Time:</strong> ${data.scheduledTime}</p>
              ${data.customerEmail ? `<p style="margin: 10px 0;"><strong>📧 Email:</strong> ${data.customerEmail}</p>` : ''}
              ${data.customerPhone ? `<p style="margin: 10px 0;"><strong>📱 Phone:</strong> ${data.customerPhone}</p>` : ''}
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #666;">
                <strong>💡 Tip:</strong> Consider following up with the customer to understand why they missed the visit and offer to reschedule.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard/store/visits" 
                 style="background: #a8edea; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View All Visits
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">This is an automated notification for missed visits.</p>
          </div>
        </div>
      `,
    },
    'visit-missed-reminder': {
      subject: `You Missed Your Visit to ${data.storeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Visit Missed</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Did you forget about your visit?</h2>
            <p style="color: #666; font-size: 16px;">You had a visit scheduled with <strong>${data.storeName}</strong>:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>📅 Date:</strong> ${new Date(data.scheduledDate).toLocaleDateString()}</p>
              <p style="margin: 10px 0;"><strong>⏰ Time:</strong> ${data.scheduledTime}</p>
              ${data.storeAddress ? `<p style="margin: 10px 0;"><strong>📍 Address:</strong> ${data.storeAddress}</p>` : ''}
              ${data.storePhone ? `<p style="margin: 10px 0;"><strong>📞 Phone:</strong> ${data.storePhone}</p>` : ''}
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/schedule/${data.storeId}" 
                 style="background: #19547b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
                Reschedule
              </a>
              <a href="${process.env.NEXTAUTH_URL}/stores/${data.storeId}" 
                 style="background: #ffd89b; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Store
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">If you had an emergency or unexpected issue, we understand. Please contact the store directly if needed.</p>
          </div>
        </div>
      `,
    },
    'discount-available': {
      subject: `Your Discount is Ready! - ${data.storeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Discount Unlocked! 🎉</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Congratulations on completing your visit!</h2>
            <p style="color: #666; font-size: 16px;">You've earned a special discount at <strong>${data.storeName}</strong>.</p>
            <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border: 2px dashed #43e97b;">
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #43e97b; margin-bottom: 10px;">
                  ${data.discountCode}
                </div>
                <p style="margin: 5px 0; font-size: 18px;">
                  ${data.discountType === 'PERCENTAGE' ? 
                    `${data.discountAmount}% OFF` : 
                    data.discountType === 'AMOUNT' ? 
                    `$${data.discountAmount} OFF` : 
                    'FREE SHIPPING'}
                </p>
                ${data.validTo ? `
                  <p style="margin: 5px 0; color: #666; font-size: 14px;">
                    Valid until: ${new Date(data.validTo).toLocaleDateString()}
                  </p>
                ` : ''}
              </div>
            </div>
            <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #2e7d32;">
                <strong>💡 How to use:</strong> Present this code at checkout when making a purchase at ${data.storeName}.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/stores/${data.storeId}" 
                 style="background: #43e97b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Shop Now
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Thank you for visiting! We hope to see you again soon.</p>
          </div>
        </div>
      `,
    },
    'visit-completed': {
      subject: `Visit Completed - ${data.storeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Visit Completed ✓</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Thank you for your visit!</h2>
            <p style="color: #666; font-size: 16px;">Your visit to <strong>${data.storeName}</strong> has been marked as completed.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>📅 Visit Date:</strong> ${new Date(data.visitDate).toLocaleDateString()}</p>
              <p style="margin: 10px 0;"><strong>⏰ Visit Time:</strong> ${data.visitTime}</p>
              ${data.storeAddress ? `<p style="margin: 10px 0;"><strong>📍 Store:</strong> ${data.storeAddress}</p>` : ''}
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/visits/${data.visitId}" 
                 style="background: #fa709a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
                View Visit Details
              </a>
              <a href="${process.env.NEXTAUTH_URL}/stores/${data.storeId}" 
                 style="background: #fee140; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Visit Store Again
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">We hope you enjoyed your experience! Consider leaving a review to help other customers.</p>
          </div>
        </div>
      `,
    },
    'store-visit-completed': {
      subject: `Visit Completed - ${data.customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8EC5FC 0%, #E0C3FC 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Visit Completed</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Customer visit completed successfully</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>👤 Customer:</strong> ${data.customerName}</p>
              <p style="margin: 10px 0;"><strong>📅 Visit Date:</strong> ${new Date(data.visitDate).toLocaleDateString()}</p>
              <p style="margin: 10px 0;"><strong>⏰ Visit Time:</strong> ${data.visitTime}</p>
              ${data.numberOfPeople ? `<p style="margin: 10px 0;"><strong>👥 Number of people:</strong> ${data.numberOfPeople}</p>` : ''}
              ${data.customerNotes ? `<p style="margin: 10px 0;"><strong>📝 Customer Notes:</strong> ${data.customerNotes}</p>` : ''}
            </div>
            <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #0066cc;">
                <strong>📊 Analytics:</strong> This visit contributes to your store's performance metrics.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard/store/visits" 
                 style="background: #8EC5FC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View All Visits
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">This is an automated notification for completed visits.</p>
          </div>
        </div>
      `,
    },
    'review-reminder': {
      subject: `How was your visit to ${data.storeName}?`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF9A8B 0%, #FF6A88 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Share Your Experience</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">How was your visit to ${data.storeName}?</h2>
            <p style="color: #666; font-size: 16px;">Your feedback helps other customers and improves our stores.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>📅 Visit Date:</strong> ${new Date(data.visitDate).toLocaleDateString()}</p>
              <p style="margin: 10px 0;"><strong>🏪 Store:</strong> ${data.storeName}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/visits/${data.visitId}/review" 
                 style="background: #FF6A88; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
                Leave a Review
              </a>
              <a href="${process.env.NEXTAUTH_URL}/stores/${data.storeId}" 
                 style="background: #FF9A8B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Store
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Your honest review helps both the store and future customers. Thank you!</p>
          </div>
        </div>
      `,
    },
  };

  const templateData = templates[template as keyof typeof templates];
  if (!templateData) {
    throw new Error(`Template ${template} not found`);
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"BondOutfit SVD" <noreply@bondoutfit.com>',
    to,
    subject: templateData.subject,
    html: templateData.html,
  });
}
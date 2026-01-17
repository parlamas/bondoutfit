// src/lib/email-service.ts

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!to) {
    console.warn('No recipient email provided');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@bondoutfit.com',
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''), // Fallback to plain text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
//src/app/api/user/preferences/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        city: true,
        country: true,
        marketingOptIn: true,
        notificationPreferences: true,
      },
    });

    // Get user's favorite categories from their visits or favorites
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        store: {
          select: {
            categories: true,
          },
        },
      },
    });

    // Extract categories from favorites
    const clothingInterests = favorites
      .flatMap(f => f.store?.categories || [])
      .filter((value, index, self) => self.indexOf(value) === index); // deduplicate

    return NextResponse.json({ 
      preferences: {
        clothingInterests: clothingInterests.slice(0, 5), // Limit to 5
        sizePreferences: '', // Store this in a new field if needed
        notifications: user?.marketingOptIn ?? true,
        name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || '',
        email: user?.email,
        phone: user?.phoneNumber || '',
        location: user?.city && user?.country ? `${user.city}, ${user.country}` : '',
      }
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clothingInterests, sizePreferences, notifications, name, email, phone } = body;

    // Parse name into firstName and lastName
    let firstName = session.user.name || '';
    let lastName = '';
    
    if (name && name !== session.user.name) {
      const nameParts = name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // Update user data
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName,
        email: email || session.user.email,
        phoneNumber: phone,
        marketingOptIn: notifications,
        // Note: clothingInterests and sizePreferences would need new fields in your schema
        // For now, we'll just update the user and ignore these
      },
    });

    // Update notification preferences if they exist
    const notificationPref = await prisma.userNotificationPreference.findUnique({
      where: { userId: session.user.id },
    });

    if (notificationPref) {
      await prisma.userNotificationPreference.update({
        where: { userId: session.user.id },
        data: {
          marketingEmails: notifications,
        },
      });
    } else {
      await prisma.userNotificationPreference.create({
        data: {
          userId: session.user.id,
          marketingEmails: notifications,
          emailEnabled: true,
          inAppEnabled: true,
          visitReminders: true,
          visitConfirmations: true,
          discountAlerts: true,
          reminderLeadTime: 24,
          confirmationLeadTime: 1,
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
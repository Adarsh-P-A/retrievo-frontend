import { auth } from '@/auth';
import { ProfileClient } from '@/app/profile/profile-client';
import { SessionProvider } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const session = await auth();

    // Check authentication
    if (!session?.user) {
        redirect('/auth/signin?callbackUrl=/profile');
    }

    // Check if user needs onboarding
    const needsOnboarding = !session.user.hostel || !session.user.phone;
    if (needsOnboarding) {
        redirect('/onboarding');
    }

    return (
        <SessionProvider>
            <ProfileClient />
        </SessionProvider>
    );
}
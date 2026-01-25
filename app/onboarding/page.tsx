import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import OnboardingClient from './onboarding-client';
import { SessionProvider } from 'next-auth/react';

export default async function OnboardingPage() {
    const session = await auth();

    // Check authentication
    if (!session?.user) {
        redirect('/auth/signin?callbackUrl=/onboarding');
    }

    // If already onboarded, redirect to profile
    const needsOnboarding = !session.user.hostel || !session.user.phone;
    if (!needsOnboarding) {
        redirect('/profile');
    }

    return (
        <SessionProvider>
            <OnboardingClient />
        </SessionProvider>
    );
}

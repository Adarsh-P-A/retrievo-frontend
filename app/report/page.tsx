import { auth } from '@/auth';
import { ItemFormClient } from './item-form-client';
import { redirect } from 'next/navigation';

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
    const { type } = await searchParams;

    if (!type || (type !== 'lost' && type !== 'found')) {
        redirect('/report?type=lost');
    }

    const session = await auth();

    // Check authentication
    if (!session?.user) {
        redirect(`/auth/signin?callbackUrl=/report?type=${type}`);
    }

    // Check if user needs onboarding
    const needsOnboarding = !session.user.hostel || !session.user.phone;
    if (needsOnboarding) {
        redirect('/onboarding');
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ItemFormClient session={session} type={type} />
        </div>
    );
}

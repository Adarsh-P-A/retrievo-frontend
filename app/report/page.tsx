import { auth } from '@/auth';
import { ItemFormClient } from '@/components/item-form-client';
import { redirect } from 'next/navigation';

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ type?: string }>; }) {
    const session = await auth();
    const { type } = await searchParams;

    if (session?.user.hostel === null) {
        redirect(`/profile?reason=hostel_required`);
    }

    if (type !== 'lost' && type !== 'found' && type !== undefined) {
        redirect(`/report`);
    }

    if (!session) {
        redirect(`/auth/signin?callbackUrl=/report?type=${type}`);
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ItemFormClient type={type} session={session} />
        </div>
    );
}

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ClientMatchPage from '@/app/items/[id]/match/matchpage-client';
import { fetchFoundUserItems, UnauthorizedError } from '@/lib/api';

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    if (!session) {
        redirect(`/auth/signin?callbackUrl=/items/${id}/match`);
    }

    let userFoundItems;

    try {
        userFoundItems = await fetchFoundUserItems('others', session.backendToken);
    } catch (err) {
        if (err instanceof UnauthorizedError) {
            redirect(`/auth/signin?callbackUrl=/items/${id}/match`);
        }

        throw err;
    }

    return (
        <ClientMatchPage
            userFoundItems={userFoundItems}
            itemId={id}
        />
    );
}
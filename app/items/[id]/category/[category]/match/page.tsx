import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ClientMatchPage from '@/app/items/[id]/category/[category]/match/matchpage-client';
import { fetchFoundUserItems, UnauthorizedError } from '@/lib/api';

export default async function MatchPage({ params }: { params: Promise<{ id: string, category: string }> }) {
    const { id, category } = await params;
    const session = await auth();

    if (!session) {
        redirect(`/auth/signin?callbackUrl=/items/${id}/category/${category}/match`);
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
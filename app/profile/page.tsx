import { auth } from '@/auth';
import { ProfileClient } from '@/app/profile/profile-client';
import { fetchAllUserItems, UnauthorizedError } from '@/lib/api';
import { Item } from '@/types/items';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const session = await auth();

    if (!session) {
        redirect('/auth/signin?callbackUrl=/profile');
    }

    let foundItems: Item[] = [];
    let lostItems: Item[] = [];

    try {
        const data = await fetchAllUserItems(session.backendToken);

        foundItems = data.found_items;
        lostItems = data.lost_items;
    } catch (err) {
        if (err instanceof UnauthorizedError) {
            redirect('/auth/signin?callbackUrl=/profile');
        }

        throw err;
    }

    return (
        <ProfileClient
            session={session}
            lostItems={lostItems}
            foundItems={foundItems}
        />
    );
}
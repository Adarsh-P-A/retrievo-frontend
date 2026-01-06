import { UserProfileClient } from './user-profile-client';

export default async function UserPage({ params }: { params: Promise<{ id: string; }> }) {
    const { id } = await params;

    return <UserProfileClient public_id={id} />;
}
export type ItemType = 'lost' | 'found';

export interface Item {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    location: string;
    type: ItemType;
    image: string;
    status: 'open' | 'claimed' | 'resolved';
    finderId?: string;
    ownerId?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
}

export const MOCK_ITEMS: Item[] = [
    {
        id: '1',
        title: 'Blue Backpack',
        description: 'Lost my blue Jansport backpack near the library. It has a laptop inside.',
        category: 'Bags',
        date: '25-10-2025',
        location: 'Central Library',
        type: 'lost',
        image: 'https://placehold.co/600x400/2563eb/ffffff?text=Blue+Backpack',
        status: 'open',
        ownerId: 'user1',
    },
    {
        id: '2',
        title: 'iPhone 13 Pro',
        description: 'Found a black iPhone 13 Pro on a bench in the creative zone.',
        category: 'Electronics',
        date: '26-10-2025',
        location: 'Creative Zone',
        type: 'found',
        image: 'https://placehold.co/600x400/000000/ffffff?text=iPhone+13',
        status: 'open',
        finderId: 'user2',
    },
    {
        id: '3',
        title: 'Water Bottle',
        description: 'Found a water bottle near the workshop area.',
        category: 'Others',
        date: '27-10-2025',
        location: 'Workshop Area',
        type: 'found',
        image: 'https://placehold.co/600x400/d97706/ffffff?text=Water+Bottle',
        status: 'open',
        finderId: 'user1',
    },
    {
        id: '4',
        title: 'Car Keys',
        description: 'Lost a set of keys with a Toyota fob.',
        category: 'Keys & Wallets',
        date: '24-10-2025',
        location: 'Parking Lot B',
        type: 'lost',
        image: 'https://placehold.co/600x400/4b5563/ffffff?text=Keys',
        status: 'resolved',
        ownerId: 'user1',
    },
    {
        id: '5',
        title: 'Wallet',
        description: 'Lost a brown Wallet with some cash and cards.',
        category: 'Keys & Wallets',
        date: '24-10-2025',
        location: 'Parking Lot C',
        type: 'found',
        image: 'https://placehold.co/600x400/4b5563/ffffff?text=Wallet',
        status: 'open',
        finderId: 'user1',
    },
    {
        id: '6',
        title: 'Phone Charger',
        description: 'Lost a white Samsung phone charger at the cafe.',
        category: 'Electronics',
        date: '24-10-2025',
        location: 'Canteen Area',
        type: 'found',
        image: 'https://placehold.co/600x400/4b5563/ffffff?text=Phone+Charger',
        status: 'open',
        finderId: 'user1',
    },
];

export const MOCK_USER: User = {
    id: 'user1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: 'https://placehold.co/100x100/2563eb/ffffff?text=AJ',
};

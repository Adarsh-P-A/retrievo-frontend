export class UnauthorizedError extends Error {
    constructor(message = "Unauthorized") {
        super(message);
        this.name = "UnauthorizedError";
    }
}

export async function postLostFoundItem(type: "lost" | "found", formData: FormData, token?: string) {
    const endpoint =
        type === "lost"
            ? "http://127.0.0.1:8000/lost-item/"
            : "http://127.0.0.1:8000/found-item/";

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (response.status === 401) throw new UnauthorizedError();

    if (!response.ok) {
        return {
            ok: false,
            status: response.status,
        };
    }

    return response.json();
}

export async function fetchAllItems() {
    const res = await fetch("http://127.0.0.1:8000/items/all");
    if (!res.ok) return { lost_items: [], found_items: [] };
    return res.json();
}

export async function fetchItem(itemId: string, itemType: string) {
    const res = await fetch(`http://127.0.0.1:8000/items/${itemId}/${itemType}`);
    if (!res.ok) return null;
    return res.json();
}

export async function fetchAllUserItems(token?: string) {
    const res = await fetch("http://127.0.0.1:8000/profile/my-items", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (res.status === 401) {
        throw new UnauthorizedError();
    }

    if (!res.ok) {
        return {
            found_items: [],
            lost_items: [],
        };
    }

    return res.json();
}

export async function fetchFoundUserItems(lostItemCategory: string, token?: string) {
    const VALID_CATEGORIES = [
        "electronics",
        "clothing",
        "bags",
        "keys_wallets",
        "documents",
        "others",
    ];

    if (!VALID_CATEGORIES.includes(lostItemCategory)) {
        throw new Error("Invalid category");
    }

    const res = await fetch(
        `http://127.0.0.1:8000/profile/found-items?category=${lostItemCategory}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (res.status === 401) {
        throw new UnauthorizedError();
    }

    if (!res.ok) return [];

    return res.json();
}
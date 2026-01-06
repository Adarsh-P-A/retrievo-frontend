import { safeJson } from "./helpers";

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL;

// GET: Single Item by ID along with Reporter Info and Claim Status
export async function fetchItem(itemId: string, token?: string) {
    try {
        const res = await fetch(
            `${BACKEND_URL}/items/${itemId}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            }
        });

        if (!res.ok) {
            console.error("fetchItem failed:", res.status);
            return { ok: false, data: null, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        console.error("fetchItem error:", err);
        return { ok: false, data: null, error: String(err) };
    }
}

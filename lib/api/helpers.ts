// Custom Error for Unauthorized Access
export class UnauthorizedError extends Error {
    constructor(message = "Unauthorized") {
        super(message);
        this.name = "UnauthorizedError";
    }
}

// Helper function to safely parse JSON
export async function safeJson(res: Response) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}
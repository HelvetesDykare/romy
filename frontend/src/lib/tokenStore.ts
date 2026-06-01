const STORE_KEY = "romy_auth";
const LEGACY_KEY = "emilie_auth"; // kept for backwards-compat: migrates existing sessions on first read, then removes the old key

interface StoredAuth {
    token: string;
    userId: string;
    email: string;
}

export function getStoredAuth(): StoredAuth | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) return JSON.parse(raw) as StoredAuth;
        // One-time migration: move existing session from the old key
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy) {
            localStorage.setItem(STORE_KEY, legacy);
            localStorage.removeItem(LEGACY_KEY);
            return JSON.parse(legacy) as StoredAuth;
        }
        return null;
    } catch {
        return null;
    }
}

export function setStoredAuth(auth: StoredAuth): void {
    localStorage.setItem(STORE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
    localStorage.removeItem(STORE_KEY);
    localStorage.removeItem(LEGACY_KEY);
}

export function getToken(): string | null {
    return getStoredAuth()?.token ?? null;
}

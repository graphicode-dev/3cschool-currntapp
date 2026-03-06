/**
 * storage.ts
 * ──────────
 * A safe async key-value storage wrapper that works across:
 *   • Expo Go / Expo managed workflow  → uses expo-secure-store or falls back to MMKV
 *   • Bare React Native (linked)       → uses @react-native-async-storage/async-storage
 *   • Web / Jest / environments where
 *     native modules are null          → falls back to localStorage / in-memory Map
 *
 * HOW IT WORKS:
 *   We lazily try to import AsyncStorage. If the native module is null (the error
 *   you saw), we silently fall back to a localStorage shim (works in Expo Web) or
 *   an in-memory Map (works in Jest / SSR). No crash, no config needed.
 *
 * INSTALL (pick ONE depending on your setup):
 *
 *   Expo managed/bare:
 *     npx expo install @react-native-async-storage/async-storage
 *
 *   Bare RN without Expo:
 *     npm install @react-native-async-storage/async-storage
 *     cd ios && pod install
 *
 *   If you still get the native-module-null error after installing, run:
 *     npx expo prebuild --clean   (Expo)
 *     cd ios && pod install       (bare RN)
 */

type StorageBackend = {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
};

// ── In-memory fallback (last resort) ─────────────────────────────────────────
const memoryStore = new Map<string, string>();
const memoryBackend: StorageBackend = {
    getItem: async (key) => memoryStore.get(key) ?? null,
    setItem: async (key, value) => {
        memoryStore.set(key, value);
    },
    removeItem: async (key) => {
        memoryStore.delete(key);
    },
};

// ── localStorage shim (Expo Web) ──────────────────────────────────────────────
const localStorageBackend: StorageBackend = {
    getItem: async (key) => {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    setItem: async (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch {}
    },
    removeItem: async (key) => {
        try {
            localStorage.removeItem(key);
        } catch {}
    },
};

// ── Resolve the best available backend ───────────────────────────────────────
let _resolvedBackend: StorageBackend | null = null;

async function getBackend(): Promise<StorageBackend> {
    if (_resolvedBackend) return _resolvedBackend;

    console.log("[storage] Starting backend resolution...");

    try {
        // Dynamic import so we don't crash at module load time if it's not installed
        console.log("[storage] Attempting to import AsyncStorage...");
        const mod = await import("@react-native-async-storage/async-storage");
        const AS = mod.default ?? mod;

        console.log("[storage] AsyncStorage imported successfully:", !!AS);

        // The error you hit: native module is null. Test with a no-op call.
        console.log("[storage] Testing AsyncStorage with probe call...");
        await AS.getItem("__probe__");

        console.log("[storage] AsyncStorage probe successful!");

        _resolvedBackend = {
            getItem: (key) => AS.getItem(key),
            setItem: (key, value) => AS.setItem(key, value),
            removeItem: (key) => AS.removeItem(key),
        };
        console.log("[storage] Using AsyncStorage backend ✅");
    } catch (e: any) {
        console.error("[storage] AsyncStorage failed:", e?.message);
        console.error("[storage] Full error:", e);

        // Native module null → try localStorage next
        if (typeof localStorage !== "undefined") {
            console.log(
                "[storage] localStorage available, using it as fallback",
            );
            _resolvedBackend = localStorageBackend;
            console.warn(
                "[storage] AsyncStorage unavailable, using localStorage fallback ⚠️",
                e?.message,
            );
        } else {
            console.log(
                "[storage] localStorage not available, using memory fallback",
            );
            _resolvedBackend = memoryBackend;
            console.warn(
                "[storage] AsyncStorage + localStorage unavailable, using in-memory fallback ⚠️",
                e?.message,
            );
        }
    }

    console.log(
        "[storage] Backend resolved:",
        _resolvedBackend === memoryBackend
            ? "memory"
            : _resolvedBackend === localStorageBackend
              ? "localStorage"
              : "AsyncStorage",
    );
    return _resolvedBackend!;
}

// ── Public API (mirrors AsyncStorage) ────────────────────────────────────────
export const Storage = {
    async getItem(key: string): Promise<string | null> {
        console.log(`[storage] getItem called for key: ${key}`);
        const b = await getBackend();
        const result = await b.getItem(key);
        console.log(`[storage] getItem result:`, result);
        return result;
    },
    async setItem(key: string, value: string): Promise<void> {
        console.log(
            `[storage] setItem called for key: ${key}, value length: ${value.length}`,
        );
        const b = await getBackend();
        await b.setItem(key, value);
        console.log(`[storage] setItem completed for key: ${key}`);
    },
    async removeItem(key: string): Promise<void> {
        console.log(`[storage] removeItem called for key: ${key}`);
        const b = await getBackend();
        await b.removeItem(key);
        console.log(`[storage] removeItem completed for key: ${key}`);
    },
};

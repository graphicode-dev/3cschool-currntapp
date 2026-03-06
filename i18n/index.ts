/**
 * i18n/index.ts
 *
 * Initializes i18next with react-i18next, handles RTL switching,
 * and provides language persistence helpers used by LanguageContext.
 *
 * ⚠️  IMPORTANT: No AsyncStorage / SecureStore calls at module scope.
 *     Native modules are not ready when this file is first imported.
 *     All storage access happens lazily inside the exported async functions.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";

import ar from "@/i18n/locales/ar.json";
import en from "@/i18n/locales/en.json";

const LANGUAGE_KEY = "app_language";

// ─── Init i18next (synchronous — no native calls) ─────────────────────────────

i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    lng: "en",
    fallbackLng: "en",
    resources: {
        en: { translation: en },
        ar: { translation: ar },
    },
    interpolation: { escapeValue: false },
});

export default i18n;

// ─── RTL helper (synchronous — safe at any time) ─────────────────────────────

/**
 * Forces RTL for Arabic, LTR for English.
 * I18nManager changes only take visual effect after a full app restart.
 * Always call this BEFORE triggering the restart.
 */
export const applyRTL = (lang: string): void => {
    const shouldBeRTL = lang === "ar";
    if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
    }
};

// ─── Persistence helpers (lazy — only called from useEffect / callbacks) ──────

/**
 * Persists the chosen language using expo-secure-store.
 * Called only from within React callbacks — never at module load time.
 */
export const saveLanguage = async (lang: string): Promise<void> => {
    const SecureStore = await import("expo-secure-store");
    await SecureStore.setItemAsync(LANGUAGE_KEY, lang);
};

/**
 * Loads the persisted language.
 * Called only from within useEffect — never at module load time.
 */
export const loadSavedLanguage = async (): Promise<string> => {
    const SecureStore = await import("expo-secure-store");
    const saved = await SecureStore.getItemAsync(LANGUAGE_KEY);
    return saved ?? "en";
};

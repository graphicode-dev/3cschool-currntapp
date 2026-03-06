/**
 * language-context.tsx
 *
 * Provides language switching with full RTL support.
 * On language change:
 *   1. Persists the new language to AsyncStorage
 *   2. Calls i18next.changeLanguage() for immediate text updates
 *   3. Calls I18nManager.forceRTL() to queue the layout direction change
 *   4. Restarts the app so React Native picks up the new RTL flag
 *
 * The restart is the ONLY reliable way to flip RTL in React Native —
 * I18nManager changes are ignored until the JS bundle reloads.
 */

import { applyRTL, loadSavedLanguage, saveLanguage } from "@/i18n";
import * as Updates from "expo-updates";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Alert, I18nManager } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LanguageContextType {
    language: string;
    isRTL: boolean;
    isReady: boolean;
    toggleLanguage: () => void;
    setLanguage: (lang: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const LanguageContext = createContext<LanguageContextType>({
    language: "en",
    isRTL: false,
    isReady: false,
    toggleLanguage: () => {},
    setLanguage: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { i18n } = useTranslation();
    const [language, setLang] = useState(i18n.language);
    const [isReady, setIsReady] = useState(false);

    // On mount — restore persisted language and apply its RTL setting
    useEffect(() => {
        loadSavedLanguage().then((lang) => {
            i18n.changeLanguage(lang);
            applyRTL(lang);
            setLang(lang);
            setIsReady(true);
        });
    }, []);

    /**
     * Changes language, persists it, applies RTL flag, then restarts the app.
     * The Alert gives the user a clear heads-up before the restart.
     */
    const changeLanguage = useCallback(
        async (lang: string) => {
            if (lang === language) return;

            const directionWillChange = (lang === "ar") !== I18nManager.isRTL;

            // Persist + update i18next immediately (text changes happen at once)
            await saveLanguage(lang);
            await i18n.changeLanguage(lang);
            setLang(lang);

            if (directionWillChange) {
                // Queue the RTL/LTR flip — takes effect only after restart
                applyRTL(lang);

                Alert.alert(
                    lang === "ar" ? "إعادة تشغيل التطبيق" : "Restart Required",
                    lang === "ar"
                        ? "سيتم إعادة تشغيل التطبيق لتطبيق اتجاه العربية."
                        : "The app will restart to apply the language direction.",
                    [
                        {
                            text: lang === "ar" ? "حسناً" : "OK",
                            onPress: restartApp,
                        },
                    ],
                    { cancelable: false },
                );
            } else {
                // Same direction (shouldn't happen in a 2-language setup, but safe)
                await i18n.changeLanguage(lang);
            }
        },
        [language, i18n],
    );

    const toggleLanguage = useCallback(() => {
        const next = language === "en" ? "ar" : "en";
        changeLanguage(next);
    }, [language, changeLanguage]);

    const isRTL = language === "ar";

    return (
        <LanguageContext.Provider
            value={{
                language,
                isRTL,
                isReady,
                toggleLanguage,
                setLanguage: changeLanguage,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

// ─── Restart helper ───────────────────────────────────────────────────────────

/**
 * Restarts the React Native JS bundle.
 * - In production (EAS / standalone): expo-updates reloads the bundle.
 * - In development (Expo Go / Metro): falls back to the dev-only DevSettings.
 */
async function restartApp(): Promise<void> {
    try {
        await Updates.reloadAsync();
    } catch {
        // expo-updates is not available in Expo Go dev mode — use DevSettings
        try {
            const { DevSettings } = require("react-native");
            DevSettings.reload();
        } catch {
            // Last resort: no-op (shouldn't happen on a real device)
        }
    }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useLanguage = () => useContext(LanguageContext);

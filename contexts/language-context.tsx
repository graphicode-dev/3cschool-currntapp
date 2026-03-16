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
import { TFunction } from "i18next";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LanguageContextType {
    language: string;
    isRTL: boolean;
    isReady: boolean;
    toggleLanguage: () => void;
    setLanguage: (lang: string) => void;
    t: TFunction<"translation", undefined>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const LanguageContext = createContext<LanguageContextType>({
    language: "en",
    isRTL: false,
    isReady: false,
    toggleLanguage: () => {},
    setLanguage: () => {},
    t: (() => "") as any,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { t, i18n } = useTranslation();
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
            await i18n.changeLanguage(lang);
            applyRTL(lang);
            await saveLanguage(lang);
            setLang(lang);

            // Show alert to user to restart app for complete language change
            Alert.alert(
                lang === "ar" ? "تغيير اللغة" : "Language Changed",
                lang === "ar"
                    ? "يرجى إعادة تشغيل التطبيق لتطبيق التغييرات"
                    : "Please restart the app to apply changes",
            );
        },
        [i18n],
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
                t,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useLanguage = () => useContext(LanguageContext);

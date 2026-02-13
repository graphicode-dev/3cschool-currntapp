import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import React, { createContext, useContext, useEffect, useState } from "react";
import { I18nManager } from "react-native";

import i18n from "@/i18n";

const LANGUAGE_KEY = "@app_language";

type Language = "en" | "ar";

interface LanguageContextType {
    language: Language;
    isRTL: boolean;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: string, options?: object) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");
    const [isRTL, setIsRTL] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved language on mount
    useEffect(() => {
        loadSavedLanguage();
    }, []);

    const loadSavedLanguage = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
            
            if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
                // Use saved language
                applyLanguage(savedLanguage as Language);
            } else {
                // Use device language as default
                const deviceLocale = getLocales()[0]?.languageCode || "en";
                const defaultLang: Language = deviceLocale === "ar" ? "ar" : "en";
                applyLanguage(defaultLang);
            }
        } catch (error) {
            console.log("Error loading language:", error);
            applyLanguage("en");
        } finally {
            setIsLoaded(true);
        }
    };

    const applyLanguage = (lang: Language) => {
        i18n.locale = lang;
        setLanguageState(lang);
        setIsRTL(lang === "ar");
        
        // Note: RTL changes require app restart to take full effect
        if (I18nManager.isRTL !== (lang === "ar")) {
            I18nManager.allowRTL(lang === "ar");
            I18nManager.forceRTL(lang === "ar");
        }
    };

    const setLanguage = async (lang: Language) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, lang);
            applyLanguage(lang);
        } catch (error) {
            console.log("Error saving language:", error);
        }
    };

    const t = (key: string, options?: object) => {
        return i18n.t(key, options);
    };

    if (!isLoaded) {
        return null; // Or a loading spinner
    }

    return (
        <LanguageContext.Provider value={{ language, isRTL, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}

// Simple hook for translations only
export function useTranslation() {
    const { t, isRTL, language } = useLanguage();
    return { t, isRTL, language };
}

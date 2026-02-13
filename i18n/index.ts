import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

import ar from "./translations/ar";
import en from "./translations/en";

const i18n = new I18n({
    en,
    ar,
});

// Get device locale
const deviceLocale = getLocales()[0]?.languageCode || "en";

// Set the locale once at the beginning of your app
i18n.locale = deviceLocale;
i18n.enableFallback = true;
i18n.defaultLocale = "en";

export default i18n;

// Helper function to check if current language is RTL
export const isRTL = () => {
    return i18n.locale === "ar";
};

// Get current locale
export const getCurrentLocale = () => {
    return i18n.locale;
};

// Set locale
export const setLocale = (locale: "en" | "ar") => {
    i18n.locale = locale;
};

// Supported languages
export const SUPPORTED_LANGUAGES = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "ar", name: "Arabic", nativeName: "العربية" },
];

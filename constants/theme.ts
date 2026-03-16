/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#3D2212";
const tintColorDark = "#fff";

export const Palette = {
    brand: {
        50: "#E9F7FC",
        100: "#BBE6F6",
        200: "#6DC5F3",
        300: "#04AFEE",
        400: "#00B5E3",
        500: "#00AEED",
        600: "#00A2E0",
        700: "#0096D3",
        800: "#008AC6",
        900: "#003A5B",
    },
    yellow: {
        50: "#FDF8EA",
        100: "#FAE9BF",
        200: "#F8DDB3",
        300: "#F6D2A6",
        400: "#DDBC64",
        500: "#F4C430",
        600: "#F1B000",
        700: "#FAC610",
        800: "#EDBD24",
        900: "#8F6B00",
    },
    slate50: "#F2F3F7",
    slate100: "#E7EAF0",
    slate200: "#DEE2E9",
    slate300: "#D5DAE4",
    slate400: "#CCD2DE",
    slate500: "#ABB4C6",
    slate600: "#ABB4C6",
    slate700: "#7E8698",
    slate800: "#575E6B",
    slate900: "#1C202A",

    emerald500: "#10B981",
    emerald50: "#ECFDF5",
    emerald600: "#059669",
    emerald200: "#A7F3D0",

    amber500: "#F59E0B",
    amber50: "#FFFBEB",
    amber600: "#D97706",
    amber200: "#FDE68A",

    red400: "#F87171",
    white: "#FFFFFF",
    black: "#141B34",
    brandLight: "#EEF2FF", // brand-500/10
    brandBorder: "#E0E7FF", // brand-500/20
    background: "#F8F8F8",
    card: "#FCF6EC",
};

export const Colors = {
    light: {
        text: "#11181C",
        background: Palette.background,
        tint: tintColorLight,
        icon: "#687076",
        tabIconDefault: "#000000",
        tabIconSelected: Palette.brand[500],
        tabBarBackground: "rgba(255,255,255,0.67)",
        tabBarBorder: Palette.brand[50],
    },
    dark: {
        text: "#ECEDEE",
        background: "#151718",
        tint: tintColorDark,
        icon: "#9BA1A6",
        tabIconDefault: "#9BA1A6",
        tabIconSelected: Palette.brand[500],
        tabBarBackground: "rgba(30,30,30,0.67)",
        tabBarBorder: Palette.brand[500],
    },
};

export const Typography = {
    sizes: {
        xs: 8,
        sm: 10,
        md: 11,
        base: 12,
        lg: 14,
        xl: 16,
        "2xl": 18,
        "3xl": 20,
        "4xl": 24,
        "5xl": 28,
    },
    weights: {
        regular: "400" as const,
        medium: "500" as const,
        semiBold: "600" as const,
        bold: "700" as const,
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
};

export const Radii = {
    sm: 8,
    md: 10,
    lg: 14,
    xl: 20,
    "2xl": 24,
    pill: 62,
    full: 999,
};

export const Shadows = {
    card: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 4.3,
        elevation: 2,
    },
};

export const Fonts = Platform.select({
    android: {
        /** English fonts */
        poppins: "Poppins-Regular",
        poppinsMedium: "Poppins-Medium",
        poppinsSemiBold: "Poppins-SemiBold",
        poppinsBold: "Poppins-Bold",
        /** Arabic fonts */
        tajawal: "Tajawal-Regular",
        tajawalMedium: "Tajawal-Medium",
        tajawalBold: "Tajawal-Bold",
    },
    ios: {
        /** English fonts */
        poppins: "Poppins-Regular",
        poppinsMedium: "Poppins-Medium",
        poppinsSemiBold: "Poppins-SemiBold",
        poppinsBold: "Poppins-Bold",
        /** Arabic fonts */
        tajawal: "Tajawal-Regular",
        tajawalMedium: "Tajawal-Medium",
        tajawalBold: "Tajawal-Bold",
    },
    default: {
        /** English fonts */
        poppins: "Poppins-Regular",
        poppinsMedium: "Poppins-Medium",
        poppinsSemiBold: "Poppins-SemiBold",
        poppinsBold: "Poppins-Bold",
        /** Arabic fonts */
        tajawal: "Tajawal-Regular",
        tajawalMedium: "Tajawal-Medium",
        tajawalBold: "Tajawal-Bold",
    },
    web: {
        /** English fonts */
        poppins: "'Poppins', sans-serif",
        poppinsMedium: "'Poppins', sans-serif",
        poppinsSemiBold: "'Poppins', sans-serif",
        poppinsBold: "'Poppins', sans-serif",
        /** Arabic fonts */
        tajawal: "'Tajawal', sans-serif",
        tajawalMedium: "'Tajawal', sans-serif",
        tajawalBold: "'Tajawal', sans-serif",
    },
});

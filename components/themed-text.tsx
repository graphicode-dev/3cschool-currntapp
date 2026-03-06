import { StyleSheet, Text, type TextProps } from "react-native";

import { Fonts } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useTranslation } from "react-i18next";

export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
    style,
    lightColor,
    darkColor,
    type = "default",
    ...rest
}: ThemedTextProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
    const { i18n } = useTranslation();
    const lang = i18n.language === "ar" ? "ar" : "en";

    // Get font based on language and type
    const getFontFamily = () => {
        const isArabic = lang === "ar";

        switch (type) {
            case "title":
                return isArabic ? Fonts.tajawalBold : Fonts.poppinsBold;
            case "subtitle":
                return isArabic ? Fonts.tajawalBold : Fonts.poppinsSemiBold;
            case "defaultSemiBold":
                return isArabic ? Fonts.tajawalMedium : Fonts.poppinsSemiBold;
            case "link":
                return isArabic ? Fonts.tajawalMedium : Fonts.poppinsMedium;
            case "default":
            default:
                return isArabic ? Fonts.tajawal : Fonts.poppins;
        }
    };

    return (
        <Text
            style={[
                { color, fontFamily: getFontFamily() },
                type === "default" ? styles.default : undefined,
                type === "title" ? styles.title : undefined,
                type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
                type === "subtitle" ? styles.subtitle : undefined,
                type === "link" ? styles.link : undefined,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    default: {
        fontSize: 16,
        lineHeight: 24,
    },
    defaultSemiBold: {
        fontSize: 16,
        lineHeight: 24,
    },
    title: {
        fontSize: 32,
        lineHeight: 32,
    },
    subtitle: {
        fontSize: 20,
    },
    link: {
        lineHeight: 30,
        fontSize: 16,
        color: "#0a7ea4",
    },
});

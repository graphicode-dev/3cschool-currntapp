import {
    StyleSheet,
    Text,
    type TextProps,
    useWindowDimensions,
} from "react-native";

import { Fonts } from "@/constants/theme";
import { useTranslation } from "react-i18next";

export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
    fontSize?: number;
};

export function ThemedText({
    style,
    lightColor,
    darkColor,
    type = "default",
    fontSize,
    ...rest
}: ThemedTextProps) {
    const { i18n } = useTranslation();
    const { width } = useWindowDimensions();
    const lang = i18n.language === "ar" ? "ar" : "en";

    // Scale fontSize responsively based on screen width
    const responsiveFontSize =
        fontSize !== undefined
            ? Math.round((width / 375) * fontSize)
            : undefined;

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
                { fontFamily: getFontFamily() },
                type === "default" ? styles.default : undefined,
                type === "title" ? styles.title : undefined,
                type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
                type === "subtitle" ? styles.subtitle : undefined,
                type === "link" ? styles.link : undefined,
                responsiveFontSize !== undefined && {
                    fontSize: responsiveFontSize,
                },
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

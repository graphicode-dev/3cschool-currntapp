import {
    StyleSheet,
    Text,
    type TextProps,
    useWindowDimensions,
} from "react-native";

import { Fonts } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";

export type ThemedTextProps = TextProps & {
    type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
    fontSize?: number;
    fontWeight?: "regular" | "medium" | "bold";
};

export function ThemedText({
    style,
    type = "default",
    fontSize,
    fontWeight = "regular",
    ...rest
}: ThemedTextProps) {
    const { isRTL } = useLanguage();
    const { width } = useWindowDimensions();

    // Scale fontSize responsively based on screen width
    const responsiveFontSize =
        fontSize !== undefined
            ? Math.round((width / 375) * fontSize)
            : undefined;

    // Get font based on language and type
    const getFontFamily = () => {
        const isArabic = isRTL;

        // If fontWeight is provided, map it to the appropriate font family
        if (fontWeight !== undefined) {
            if (isArabic) {
                // Arabic font mapping
                if (fontWeight === "bold") return Fonts.tajawalBold;
                if (fontWeight === "medium") return Fonts.tajawalMedium;
                if (fontWeight === "regular") return Fonts.tajawal;
                return Fonts.tajawal;
            } else {
                // English font mapping
                if (fontWeight === "bold") return Fonts.poppinsBold;
                if (fontWeight === "medium") return Fonts.poppinsMedium;
                if (fontWeight === "regular") return Fonts.poppins;
                return Fonts.poppins;
            }
        }

        // Default behavior based on type when no fontWeight is provided
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

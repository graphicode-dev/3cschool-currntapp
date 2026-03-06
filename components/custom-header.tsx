import { Icons } from "@/constants/icons";
import { Palette } from "@/constants/theme";
import { Href, router } from "expo-router";
import { JSX } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Avatar from "./avatar";
import { ThemedText } from "./themed-text";

type Props = {
    title: string;
    href?: Href;
    divider?: boolean;
    avatar?: {
        name?: string;
        image?: string;
        icon?: JSX.Element;
        size?: number;
    };
};

const CustomHeader = ({ title, href, divider, avatar }: Props) => {
    return (
        <View>
            <TouchableOpacity
                onPress={() => (href ? router.push(href) : router.back())}
                style={styles.container}
            >
                <Icons.ArrowIcon
                    color={Palette.brand[500]}
                    size={24}
                    direction={{
                        left: true,
                    }}
                />
                {avatar && (
                    <Avatar
                        name={avatar.name}
                        image={avatar.image}
                        size={avatar.size}
                        icon={avatar.icon}
                    />
                )}
                <ThemedText style={styles.title}>{title}</ThemedText>
            </TouchableOpacity>
            {divider && <View style={styles.headerDivider} />}
        </View>
    );
};
export default CustomHeader;
const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
    },
    headerDivider: {
        height: 1,
        backgroundColor: Palette.brand[100],
        opacity: 0.6,
    },
});

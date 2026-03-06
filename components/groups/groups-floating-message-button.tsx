import { Icons } from "@/constants/icons";
import { Palette } from "@/constants/theme";
import { router } from "expo-router";
import { useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../themed-text";

interface Props {
    groupId: string;
}

const GroupsFloatingMessageButton = ({ groupId }: Props) => {
    const [pressed, setPressed] = useState(false);

    const groupAnim = useState(new Animated.Value(0))[0];
    const instructorAnim = useState(new Animated.Value(0))[0];

    const toggle = (show: boolean) => {
        setPressed(show);
        Animated.spring(groupAnim, {
            toValue: show ? 1 : 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
        setTimeout(() => {
            Animated.spring(instructorAnim, {
                toValue: show ? 1 : 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        }, show ? 80 : 0);
    };

    const dismiss = () => toggle(false);

    const onPressInstructor = () => {
        dismiss();
        router.push({
            pathname: "/(app)/(tabs)/groups/chat/instructor",
            params: { groupId },
        });
    };

    const onPressGroup = () => {
        dismiss();
        router.push({
            pathname: "/(app)/(tabs)/groups/chat/group",
            params: { groupId },
        });
    };

    const animStyle = (anim: Animated.Value) => ({
        transform: [
            {
                translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                }),
            },
            {
                scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                }),
            },
        ],
        opacity: anim,
    });

    return (
        <>
            <TouchableOpacity
                style={styles.container}
                onPress={() => toggle(!pressed)}
            >
                <Icons.SingleChatIcon color="white" size={40} />
            </TouchableOpacity>

            {pressed && (
                <View style={styles.popUpContainer}>
                    <Animated.View style={[styles.popUpItem, animStyle(groupAnim)]}>
                        <TouchableOpacity
                            style={styles.popUpItemContent}
                            onPress={onPressGroup}
                        >
                            <Icons.ChatIcon color={Palette.brand[500]} size={16} />
                            <ThemedText style={styles.popUpItemText}>
                                Chat Group
                            </ThemedText>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View
                        style={[styles.popUpItem, animStyle(instructorAnim)]}
                    >
                        <TouchableOpacity
                            style={styles.popUpItemContent}
                            onPress={onPressInstructor}
                        >
                            <Icons.QuizIcon color={Palette.brand[500]} size={16} />
                            <ThemedText style={styles.popUpItemText}>
                                Ask Instructor
                            </ThemedText>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            )}
        </>
    );
};

export default GroupsFloatingMessageButton;

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 120,
        right: 20,
        width: 70,
        height: 70,
        backgroundColor: Palette.brand[500],
        padding: 10,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    popUpContainer: {
        position: "absolute",
        bottom: 200,
        right: 20,
        gap: 10,
    },
    popUpItem: {
        borderRadius: 15,
        backgroundColor: Palette.brand[50],
        borderColor: Palette.brand[500],
        borderWidth: 1,
        padding: 10,
    },
    popUpItemContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    popUpItemText: {
        color: Palette.brand[500],
        fontSize: 14,
    },
});
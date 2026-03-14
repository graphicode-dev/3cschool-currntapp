import { Palette } from "@/constants/theme";
import React, {
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
    SlideInUp,
    SlideOutUp,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { ThemedText } from "../themed-text";

const TOAST_MARGIN = 16;
const AUTO_DISMISS_MS = 3500;

type ToastType = "success" | "error" | "info" | "warning";

interface ToastConfig {
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    onDismiss?: () => void;
}

interface ToastItem extends ToastConfig {
    id: number;
}

// Icons
function SuccessIcon({ size = 22 }: { size?: number }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" fill="#34C759" />
            <Path
                d="M8 12.5L10.5 15L16 9.5"
                stroke="#fff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function ErrorIcon({ size = 22 }: { size?: number }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" fill="#FF3B30" />
            <Path
                d="M15 9L9 15M9 9L15 15"
                stroke="#fff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function InfoIcon({ size = 22 }: { size?: number }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" fill="#007AFF" />
            <Path
                d="M12 16V12M12 8H12.01"
                stroke="#fff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function WarningIcon({ size = 22 }: { size?: number }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                fill="#FF9500"
            />
            <Path
                d="M12 9V13M12 17H12.01"
                stroke="#fff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

const iconMap: Record<ToastType, React.FC<{ size?: number }>> = {
    success: SuccessIcon,
    error: ErrorIcon,
    info: InfoIcon,
    warning: WarningIcon,
};

const bgColorMap: Record<ToastType, string> = {
    success: "#F0FFF4",
    error: "#FFF5F5",
    info: "#EBF8FF",
    warning: "#FFFBEB",
};

const borderColorMap: Record<ToastType, string> = {
    success: "#34C759",
    error: "#FF3B30",
    info: "#007AFF",
    warning: "#FF9500",
};

function ToastItemComponent({
    item,
    onDismiss,
}: {
    item: ToastItem;
    onDismiss: (id: number) => void;
}) {
    const progress = useSharedValue(1);

    useEffect(() => {
        const duration = item.duration || AUTO_DISMISS_MS;
        progress.value = withTiming(0, { duration });
        const timer = setTimeout(() => {
            onDismiss(item.id);
            item.onDismiss?.();
        }, duration);
        return () => clearTimeout(timer);
    }, [item, onDismiss, progress]);

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    const Icon = iconMap[item.type];

    return (
        <Animated.View
            entering={SlideInUp.damping(18).stiffness(140)}
            exiting={SlideOutUp.duration(250)}
            style={[
                styles.toast,
                {
                    backgroundColor: bgColorMap[item.type],
                    borderLeftColor: borderColorMap[item.type],
                },
            ]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                    onDismiss(item.id);
                    item.onDismiss?.();
                }}
                style={styles.toastContent}>
                <View style={styles.iconContainer}>
                    <Icon size={24} />
                </View>
                <View style={styles.textContainer}>
                    <ThemedText
                        style={styles.title}
                        fontSize={15}
                        numberOfLines={1}>
                        {item.title}
                    </ThemedText>
                    {item.message ? (
                        <ThemedText
                            style={styles.message}
                            fontSize={13}
                            numberOfLines={2}>
                            {item.message}
                        </ThemedText>
                    ) : null}
                </View>
            </TouchableOpacity>
            <View style={styles.progressBar}>
                <Animated.View
                    style={[
                        styles.progressFill,
                        { backgroundColor: borderColorMap[item.type] },
                        progressStyle,
                    ]}
                />
            </View>
        </Animated.View>
    );
}

// Toast ref for imperative API
export interface ToastRef {
    show: (config: ToastConfig) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
}

let globalToastRef: ToastRef | null = null;

export function setGlobalToastRef(ref: ToastRef | null) {
    globalToastRef = ref;
}

// Global toast helper — call from anywhere
export const toast = {
    show: (config: ToastConfig) => globalToastRef?.show(config),
    success: (title: string, message?: string) =>
        globalToastRef?.success(title, message),
    error: (title: string, message?: string) =>
        globalToastRef?.error(title, message),
    info: (title: string, message?: string) =>
        globalToastRef?.info(title, message),
    warning: (title: string, message?: string) =>
        globalToastRef?.warning(title, message),
};

export const ToastProvider = React.forwardRef<
    ToastRef,
    { children: React.ReactNode }
>(function ToastProviderComponent({ children }, ref) {
    const insets = useSafeAreaInsets();
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const idCounter = useRef(0);

    const show = useCallback((config: ToastConfig) => {
        const id = ++idCounter.current;
        setToasts((prev) => [...prev.slice(-2), { ...config, id }]);
    }, []);

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const api = useMemo(
        () => ({
            show,
            success: (title: string, message?: string) =>
                show({ type: "success", title, message }),
            error: (title: string, message?: string) =>
                show({ type: "error", title, message }),
            info: (title: string, message?: string) =>
                show({ type: "info", title, message }),
            warning: (title: string, message?: string) =>
                show({ type: "warning", title, message }),
        }),
        [show],
    );

    useImperativeHandle(ref, () => api);

    useEffect(() => {
        setGlobalToastRef(api);
        return () => setGlobalToastRef(null);
    }, [api]);

    return (
        <View style={{ flex: 1 }}>
            {children}
            <View
                style={[styles.container, { top: insets.top + 8 }]}
                pointerEvents="box-none">
                {toasts.map((item) => (
                    <ToastItemComponent
                        key={item.id}
                        item={item}
                        onDismiss={dismiss}
                    />
                ))}
            </View>
        </View>
    );
});

ToastProvider.displayName = "ToastProvider";

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: TOAST_MARGIN,
        right: TOAST_MARGIN,
        zIndex: 9999,
        alignItems: "center",
        gap: 8,
    },
    toast: {
        width: "100%",
        borderRadius: 14,
        borderLeftWidth: 4,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    toastContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    iconContainer: {
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    textContainer: {
        flex: 1,
        gap: 2,
    },
    title: {
        fontWeight: "600",
        color: Palette.black,
        letterSpacing: -0.2,
    },
    message: {
        color: Palette.brand[300],
        lineHeight: 18,
    },
    progressBar: {
        height: 3,
        backgroundColor: "rgba(0,0,0,0.05)",
    },
    progressFill: {
        height: "100%",
        borderRadius: 2,
    },
});

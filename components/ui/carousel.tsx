import { Palette, Radii, Spacing } from "@/constants/theme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    View,
    ViewToken,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_WIDTH = SCREEN_WIDTH - 31; // Account for 2px padding on each side

const DOT_INACTIVE_SIZE = 8;
const DOT_ACTIVE_WIDTH = 28;
const DOT_HEIGHT = 8;
const ANIMATION_DURATION = 250;

interface BannerCarouselProps {
    sources: (any | React.ReactNode)[];
    height?: number;
}

function Dot({ isActive }: { isActive: boolean }) {
    const width = useSharedValue(
        isActive ? DOT_ACTIVE_WIDTH : DOT_INACTIVE_SIZE,
    );
    const opacity = useSharedValue(isActive ? 1 : 0.5);

    React.useEffect(() => {
        width.value = withTiming(
            isActive ? DOT_ACTIVE_WIDTH : DOT_INACTIVE_SIZE,
            {
                duration: ANIMATION_DURATION,
            },
        );
        opacity.value = withTiming(isActive ? 1 : 0.5, {
            duration: ANIMATION_DURATION,
        });
    }, [isActive]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: width.value,
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[styles.dot, animatedStyle, !isActive && styles.dotInactive]}
        >
            {isActive && (
                <LinearGradient
                    colors={[Palette.brand[600], Palette.brand[500]]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            )}
        </Animated.View>
    );
}

const Carousel = ({
    sources,
    height = 160,
    autoSlide = true,
    autoSlideInterval = 3000,
}: BannerCarouselProps & {
    autoSlide?: boolean;
    autoSlideInterval?: number;
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    // Create infinite data by duplicating sources
    const infiniteData =
        sources.length > 1 ? [...sources, ...sources, ...sources] : sources;
    const initialIndex = sources.length; // Start at the middle copy

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index != null) {
                const realIndex = viewableItems[0].index % sources.length;
                setActiveIndex(realIndex);
            }
        },
    ).current;

    const viewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50,
    }).current;

    const handleScrollEnd = useCallback(
        (event: any) => {
            if (sources.length <= 1) return;

            const contentOffsetX = event.nativeEvent.contentOffset.x;
            const slideWidth = SLIDE_WIDTH + Spacing.sm; // Account for spacing
            const currentIndex = Math.round(contentOffsetX / slideWidth);

            // If we're at the beginning or end of the infinite list, jump to the middle
            if (currentIndex < sources.length) {
                flatListRef.current?.scrollToIndex({
                    index: currentIndex + sources.length,
                    animated: false,
                });
            } else if (currentIndex >= sources.length * 2) {
                flatListRef.current?.scrollToIndex({
                    index: currentIndex - sources.length,
                    animated: false,
                });
            }
        },
        [sources.length],
    );

    React.useEffect(() => {
        if (!autoSlide || sources.length <= 1) return;

        const interval = setInterval(() => {
            const slideWidth = SLIDE_WIDTH + Spacing.sm; // Account for spacing
            flatListRef.current?.scrollToOffset({
                offset: (activeIndex + initialIndex + 1) * slideWidth,
                animated: true,
            });
        }, autoSlideInterval);

        return () => clearInterval(interval);
    }, [
        autoSlide,
        autoSlideInterval,
        activeIndex,
        sources.length,
        initialIndex,
    ]);

    const renderItem = useCallback(
        ({ item }: { item: any }) => {
            if (React.isValidElement(item)) {
                return <View style={[styles.slide, { height }]}>{item}</View>;
            }

            return (
                <View style={[styles.slide, { height }]}>
                    <Image
                        source={item}
                        style={styles.image}
                        contentFit="cover"
                        transition={200}
                    />
                </View>
            );
        },
        [height],
    );

    const getItemLayout = useCallback(
        (_: any, index: number) => ({
            length: SLIDE_WIDTH + Spacing.sm, // Account for spacing
            offset: (SLIDE_WIDTH + Spacing.sm) * index,
            index,
        }),
        [],
    );

    return (
        <View>
            <FlatList
                ref={flatListRef}
                data={infiniteData}
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={SLIDE_WIDTH + Spacing.sm}
                decelerationRate="fast"
                contentContainerStyle={styles.listContent}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                onMomentumScrollEnd={handleScrollEnd}
                initialScrollIndex={initialIndex}
                getItemLayout={getItemLayout}
            />
            {sources.length > 1 && (
                <View style={styles.dotsContainer}>
                    {sources.map((_, index) => (
                        <Dot key={index} isActive={index === activeIndex} />
                    ))}
                </View>
            )}
        </View>
    );
};

export default Carousel;

const styles = StyleSheet.create({
    listContent: {
        gap: Spacing.sm,
    },
    slide: {
        width: SLIDE_WIDTH,
        borderRadius: Radii.xl,
        overflow: "hidden",
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    dotsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: Spacing.md,
        gap: Spacing.xs,
    },
    dot: {
        height: DOT_HEIGHT,
        borderRadius: DOT_HEIGHT / 2,
        overflow: "hidden",
    },
    dotInactive: {
        backgroundColor: Palette.brand[100],
        width: DOT_INACTIVE_SIZE,
    },
});

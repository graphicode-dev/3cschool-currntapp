import { Palette } from "@/constants/theme";
import { useBannersList, type Banner } from "@/services/banner";
import { useEvent } from "expo";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    AppState,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewToken,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { RenderSection } from "../RenderSection";

// ─── Constants ────────────────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDE_WIDTH = SCREEN_WIDTH;
const BANNER_HEIGHT = 220;

const DOT_ACTIVE_WIDTH = 28;
const DOT_INACTIVE_SIZE = 8;
const DOT_HEIGHT = 8;

// ─── Animated Dot ─────────────────────────────────────────────────────────────
function Dot({ isActive }: { isActive: boolean }) {
    const width = useSharedValue(
        isActive ? DOT_ACTIVE_WIDTH : DOT_INACTIVE_SIZE,
    );
    const scale = useSharedValue(isActive ? 1.1 : 1);

    useEffect(() => {
        width.value = withSpring(
            isActive ? DOT_ACTIVE_WIDTH : DOT_INACTIVE_SIZE,
            { damping: 14, stiffness: 200 },
        );
        scale.value = withSpring(isActive ? 1.1 : 1);
    }, [isActive]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: width.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.dot, animatedStyle]}>
            <LinearGradient
                colors={
                    isActive
                        ? [Palette.brand[500], Palette.brand[600]]
                        : [Palette.brand[200], Palette.brand[100]]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
            />
        </Animated.View>
    );
}

// ─── Inline Video Card ────────────────────────────────────────────────────────
const InlineVideoCard = ({
    banner,
    onPlayingChange,
}: {
    banner: Banner;
    onPlayingChange: (isPlaying: boolean) => void;
}) => {
    const player = useVideoPlayer(banner.media_url, (p) => {
        p.loop = false;
    });

    const { isPlaying } = useEvent(player, "playingChange", {
        isPlaying: false, // always start as false — never assume playing on init
    });

    useEffect(() => {
        onPlayingChange(isPlaying);
    }, [isPlaying]);

    useEffect(() => {
        const sub = AppState.addEventListener("change", (state) => {
            if (state.match(/inactive|background/)) {
                try {
                    player.pause();
                } catch (_) {}
            }
        });
        return () => sub.remove();
    }, [player]);

    return (
        <View style={styles.slide}>
            <VideoView
                style={styles.videoView}
                player={player}
                contentFit="cover"
                allowsFullscreen
                allowsPictureInPicture
            />
        </View>
    );
};

// ─── Image Banner Card ────────────────────────────────────────────────────────
const ImageBannerCard = ({ banner }: { banner: Banner }) => {
    const handlePress = async () => {
        if (banner.link) {
            try {
                await Linking.openURL(banner.link);
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <TouchableOpacity
            style={styles.slide}
            onPress={handlePress}
            activeOpacity={0.95}>
            <Image
                source={{ uri: banner.media_url }}
                style={styles.cardImage}
            />
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.18)", "rgba(0,0,0,0.72)"]}
                locations={[0.3, 0.6, 1]}
                style={styles.gradient}
            />
            <LinearGradient
                colors={["rgba(0,0,0,0.25)", "transparent"]}
                style={styles.topStrip}
            />

            {/* Badge */}
            <View style={styles.badgeWrapper} pointerEvents="none">
                <LinearGradient
                    colors={[Palette.brand[400], Palette.brand[500]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.badge}>
                    <Text style={styles.badgeText}>🖼 IMAGE</Text>
                </LinearGradient>
            </View>

            <View style={styles.contentArea}>
                <Text style={styles.titleText} numberOfLines={2}>
                    {banner.title}
                </Text>
                <Text style={styles.descriptionText} numberOfLines={1}>
                    {banner.description}
                </Text>
                <LinearGradient
                    colors={[Palette.brand[400], Palette.brand[500]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ctaButton}>
                    <Text style={styles.ctaText}>→ Explore</Text>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );
};

// ─── Main Section ─────────────────────────────────────────────────────────────
const HomeBannerSection = () => {
    const { data: banners = [], isLoading, error } = useBannersList();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const autoSlideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const isVideoPlayingRef = useRef(false);
    const activeIndexRef = useRef(0);
    const initialIndexRef = useRef(0);

    const sortedBanners = [...banners].sort((a, b) => a.order - b.order);
    const infiniteData =
        sortedBanners.length > 1
            ? [...sortedBanners, ...sortedBanners, ...sortedBanners]
            : sortedBanners;
    const initialIndex = sortedBanners.length;
    initialIndexRef.current = initialIndex;

    const stopAutoSlide = useCallback(() => {
        if (autoSlideTimer.current) {
            clearInterval(autoSlideTimer.current);
            autoSlideTimer.current = null;
        }
    }, []);

    const startAutoSlide = useCallback(() => {
        if (sortedBanners.length <= 1) return;
        stopAutoSlide();
        autoSlideTimer.current = setInterval(() => {
            if (isVideoPlayingRef.current) return;
            flatListRef.current?.scrollToOffset({
                offset:
                    (activeIndexRef.current + initialIndexRef.current + 1) *
                    SLIDE_WIDTH,
                animated: true,
            });
        }, 3500);
    }, [sortedBanners.length, stopAutoSlide]);

    const handlePlayingChange = useCallback(
        (playing: boolean) => {
            isVideoPlayingRef.current = playing;
            if (playing) {
                stopAutoSlide();
            } else {
                startAutoSlide();
            }
        },
        [startAutoSlide, stopAutoSlide],
    );

    useEffect(() => {
        startAutoSlide();
        return () => stopAutoSlide();
    }, [sortedBanners.length]);

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index != null) {
                const next = viewableItems[0].index % sortedBanners.length;
                activeIndexRef.current = next;
                setActiveIndex(next);
            }
        },
    ).current;

    const viewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50,
    }).current;

    const handleScrollEnd = useCallback(
        (event: any) => {
            if (sortedBanners.length <= 1) return;
            const x = event.nativeEvent.contentOffset.x;
            const current = Math.round(x / SLIDE_WIDTH);
            if (current < sortedBanners.length) {
                flatListRef.current?.scrollToIndex({
                    index: current + sortedBanners.length,
                    animated: false,
                });
            } else if (current >= sortedBanners.length * 2) {
                flatListRef.current?.scrollToIndex({
                    index: current - sortedBanners.length,
                    animated: false,
                });
            }
        },
        [sortedBanners.length],
    );

    const renderItem = useCallback(
        ({ item }: { item: Banner }) =>
            item.type === "video" ? (
                <InlineVideoCard
                    banner={item}
                    onPlayingChange={handlePlayingChange}
                />
            ) : (
                <ImageBannerCard banner={item} />
            ),
        [handlePlayingChange],
    );

    const getItemLayout = useCallback(
        (_: any, index: number) => ({
            length: SLIDE_WIDTH,
            offset: SLIDE_WIDTH * index,
            index,
        }),
        [],
    );

    return (
        <RenderSection
            isLoading={isLoading}
            error={error?.message || ""}
            data={banners}>
            <View style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    data={infiniteData}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={renderItem}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={SLIDE_WIDTH}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    onMomentumScrollEnd={handleScrollEnd}
                    initialScrollIndex={initialIndex}
                    getItemLayout={getItemLayout}
                    contentContainerStyle={styles.flatListContent}
                    contentInset={{ left: 0, right: 0, top: 0, bottom: 0 }}
                />

                {sortedBanners.length > 1 && (
                    <View style={styles.dotsRow}>
                        {sortedBanners.map((_, i) => (
                            <Dot key={i} isActive={i === activeIndex} />
                        ))}
                    </View>
                )}
            </View>
        </RenderSection>
    );
};

export default HomeBannerSection;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
    },
    flatListContent: {
        padding: 0,
    },
    slide: {
        width: SLIDE_WIDTH,
        height: BANNER_HEIGHT,
        overflow: "hidden",
        backgroundColor: "#111",
    },
    cardImage: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    videoView: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    topStrip: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    badgeWrapper: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 10,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "800",
        color: "white",
        letterSpacing: 0.8,
    },
    contentArea: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 18,
        gap: 5,
    },
    titleText: {
        fontSize: 18,
        fontWeight: "900",
        color: "#FFFFFF",
        letterSpacing: 0.2,
        textShadowColor: "rgba(0,0,0,0.7)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
        lineHeight: 24,
    },
    descriptionText: {
        fontSize: 12,
        color: "rgba(255,255,255,0.85)",
        lineHeight: 17,
        textShadowColor: "rgba(0,0,0,0.5)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    ctaButton: {
        alignSelf: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 24,
        marginTop: 4,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    ctaText: {
        fontSize: 13,
        fontWeight: "800",
        color: "white",
        letterSpacing: 0.4,
    },
    dotsRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
        gap: 5,
    },
    dot: {
        height: DOT_HEIGHT,
        borderRadius: DOT_HEIGHT / 2,
        overflow: "hidden",
        minWidth: DOT_INACTIVE_SIZE,
    },
});

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
import { ThemedText } from "../themed-text";

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
    isActive,
}: {
    banner: Banner;
    onPlayingChange: (isPlaying: boolean) => void;
    isActive: boolean;
}) => {
    const [hasFinished, setHasFinished] = useState(false);
    const [userTappedPlay, setUserTappedPlay] = useState(false);

    const videoUrl = encodeURI(banner.media_url)
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29");

    const player = useVideoPlayer(videoUrl, (p) => {
        p.loop = false;
    });

    const { isPlaying } = useEvent(player, "playingChange", {
        isPlaying: false,
    });

    useEffect(() => {
        const sub = player.addListener("playToEnd", () => {
            setHasFinished(true);
            setUserTappedPlay(false);
            onPlayingChange(false);
        });
        return () => sub.remove();
    }, [player, onPlayingChange]);

    const handlePlay = useCallback(() => {
        if (hasFinished) return;
        onPlayingChange(true);
        setUserTappedPlay(true);
        try {
            player.play();
        } catch (_) {}
    }, [player, hasFinished, onPlayingChange]);

    useEffect(() => {
        if (!isActive) {
            try {
                player.pause();
            } catch (_) {}
            if (!isPlaying) {
                setUserTappedPlay(false);
                onPlayingChange(false);
            }
        }
    }, [isActive, player, isPlaying, onPlayingChange]);

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

    // Show overlay: before user taps play, or after video finishes
    const showOverlay = !userTappedPlay || hasFinished;

    return (
        <View style={styles.slide}>
            {/* Thumbnail poster — visible until video starts playing */}
            {banner.thumbnail_url && showOverlay && (
                <Image
                    source={{ uri: encodeURI(banner.thumbnail_url) }}
                    style={styles.cardImage}
                />
            )}

            {/* Video layer — sits behind overlays, NOT inside TouchableOpacity */}
            <VideoView
                style={styles.videoView}
                player={player}
                contentFit="cover"
                allowsPictureInPicture
            />

            {/* Gradient overlay */}
            <LinearGradient
                colors={[
                    "rgba(0,0,0,0.0)",
                    "rgba(0,0,0,0.0)",
                    "rgba(0,0,0,0.4)",
                ]}
                locations={[0, 0.55, 1]}
                style={styles.gradient}
                pointerEvents="none"
            />

            {/* Tap handler — transparent overlay on top */}
            {showOverlay && (
                <TouchableOpacity
                    style={styles.videoPlayOverlay}
                    activeOpacity={0.8}
                    onPress={handlePlay}>
                    {hasFinished ? (
                        <View style={styles.videoFinishedBadge}>
                            <ThemedText
                                style={styles.videoFinishedIcon}
                                fontSize={18}>
                                ✓
                            </ThemedText>
                            <ThemedText
                                style={styles.videoFinishedText}
                                fontSize={14}>
                                Watched
                            </ThemedText>
                        </View>
                    ) : (
                        <View style={styles.videoPlayButton}>
                            <ThemedText
                                style={styles.videoPlayIcon}
                                fontSize={22}>
                                ▶
                            </ThemedText>
                        </View>
                    )}
                </TouchableOpacity>
            )}

            <View style={styles.badgeWrapper} pointerEvents="none">
                <LinearGradient
                    colors={[Palette.brand[400], Palette.brand[500]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.badge}>
                    <ThemedText style={styles.badgeText} fontSize={11}>
                        🎬 VIDEO
                    </ThemedText>
                </LinearGradient>
            </View>

            <View style={styles.contentArea} pointerEvents="none">
                <ThemedText
                    style={styles.titleText}
                    numberOfLines={2}
                    fontSize={18}>
                    {banner.title}
                </ThemedText>
                <ThemedText
                    style={styles.descriptionText}
                    numberOfLines={1}
                    fontSize={12}>
                    {banner.description}
                </ThemedText>
                <LinearGradient
                    colors={[Palette.brand[400], Palette.brand[500]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ctaButton}>
                    <ThemedText style={styles.ctaText} fontSize={13}>
                        {hasFinished ? "✓ Watched" : "▶ Play"}
                    </ThemedText>
                </LinearGradient>
            </View>
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
                source={{ uri: encodeURI(banner.media_url) }}
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
                    <ThemedText style={styles.badgeText} fontSize={11}>
                        🖼 IMAGE
                    </ThemedText>
                </LinearGradient>
            </View>

            <View style={styles.contentArea}>
                <ThemedText
                    style={styles.titleText}
                    numberOfLines={2}
                    fontSize={18}>
                    {banner.title}
                </ThemedText>
                <ThemedText
                    style={styles.descriptionText}
                    numberOfLines={1}
                    fontSize={12}>
                    {banner.description}
                </ThemedText>
                <LinearGradient
                    colors={[Palette.brand[400], Palette.brand[500]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ctaButton}>
                    <ThemedText style={styles.ctaText} fontSize={13}>
                        → Explore
                    </ThemedText>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );
};

// ─── Main Section ─────────────────────────────────────────────────────────────
const HomeBannerSection = () => {
    const { data: banners = [], isLoading, error } = useBannersList();

    useEffect(() => {
        if (banners.length > 0) {
            console.log(
                "📺 Banners API response:",
                JSON.stringify(banners, null, 2),
            );
        }
    }, [banners]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeInfiniteIndex, setActiveInfiniteIndex] = useState(0);
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

    useEffect(() => {
        if (sortedBanners.length <= 0) return;
        setActiveInfiniteIndex(initialIndex);
        activeIndexRef.current = 0;
        setActiveIndex(0);
    }, [initialIndex, sortedBanners.length]);

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
                setActiveInfiniteIndex(viewableItems[0].index);
                if (sortedBanners.length <= 0) return;
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
        ({ item, index }: { item: Banner; index: number }) =>
            item.type === "video" ? (
                <InlineVideoCard
                    banner={item}
                    onPlayingChange={handlePlayingChange}
                    isActive={index === activeInfiniteIndex}
                />
            ) : (
                <ImageBannerCard banner={item} />
            ),
        [handlePlayingChange, activeInfiniteIndex],
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
    videoPlayOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
    },
    videoPlayButton: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: "rgba(0,0,0,0.55)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
    },
    videoPlayIcon: {
        color: "#fff",
        fontWeight: "900",
        marginLeft: 3,
    },
    videoFinishedBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 24,
        gap: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
    },
    videoFinishedIcon: {
        color: "#22c55e",
        fontWeight: "900",
    },
    videoFinishedText: {
        color: "#fff",
        fontWeight: "700",
        letterSpacing: 0.3,
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
        fontWeight: "900",
        color: "#FFFFFF",
        letterSpacing: 0.2,
        textShadowColor: "rgba(0,0,0,0.7)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
        lineHeight: 24,
    },
    descriptionText: {
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

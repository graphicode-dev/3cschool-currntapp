import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../themed-text";
import Carousel from "../ui/carousel";

type Video = {
    title: string;
    description: string;
};

const VideoComponent = ({ video }: { video: Video }) => {
    return (
        <View style={styles.videoSlide}>
            <View style={styles.videoOverlay}>
                <ThemedText style={styles.videoTitle}>{video.title}</ThemedText>
                <ThemedText style={styles.videoDescription}>
                    {video.description}
                </ThemedText>
                <TouchableOpacity style={styles.playButton}>
                    <ThemedText style={styles.playButtonText}>
                        ▶ Play
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const HomeVideoSection = ({ videos }: { videos: Video[] }) => {
    const videoComponents = videos.map((video, index) => (
        <VideoComponent key={`video-${index}`} video={video} />
    ));
    return (
        <Carousel
            sources={videoComponents}
            height={200}
            autoSlide
            autoSlideInterval={3000}
        />
    );
};
export default HomeVideoSection;
const styles = StyleSheet.create({
    videoSlide: {
        backgroundColor: "#2a2a2a",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
    },
    videoOverlay: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        alignItems: "flex-start",
    },
    videoTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        marginBottom: 8,
    },
    videoDescription: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.8)",
        marginBottom: 16,
        lineHeight: 20,
    },
    playButton: {
        backgroundColor: "#00AEED",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
    },
    playButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
});

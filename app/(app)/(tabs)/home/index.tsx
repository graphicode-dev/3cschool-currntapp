import HomeHeader from "@/components/home/home-header";
import HomeInfoSection from "@/components/home/home-info-section";
import HomeUpcomingSessions from "@/components/home/home-upcoming-sessions";
import HomeVideoSection from "@/components/home/home-video-section";
import { RenderSection } from "@/components/RenderSection";
import ScreenWrapper from "@/components/ScreenWrapper";
import { PullToRefreshScrollView } from "@/components/ui/Pulltorefresh";
import { Spacing } from "@/constants/theme";
import { authStore } from "@/services/auth/auth.store";
import { StyleSheet } from "react-native";

const videosMockdata = [
    {
        title: "Featured Video",
        description: "Watch our latest content and stay updated",
    },
    {
        title: "Tutorial Video",
        description: "Learn how to use our platform effectively",
    },
];

const infoMockData = {
    motivational: "You're Doing Great! Keep Going!",
    continueButtonText: "Continue Session",
    shareIdeasText: "Share ideas and learn as a team.",
    chatText: "Chat with your classmates.",
};

const HomeScreen = () => {
    const { user } = authStore();

    if (!user) return null;
    return (
        <ScreenWrapper>
            <HomeHeader user={user!} />
            <PullToRefreshScrollView
                refetches={[]}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Video Section */}
                <RenderSection isLoading={false} error="" data={videosMockdata}>
                    <HomeVideoSection videos={videosMockdata} />
                </RenderSection>
                {/* Info Section */}
                <RenderSection isLoading={false} error="" data={infoMockData}>
                    <HomeInfoSection {...infoMockData} />
                </RenderSection>
                {/* Upcoming Sessions List */}
                <HomeUpcomingSessions />
            </PullToRefreshScrollView>
        </ScreenWrapper>
    );
};
export default HomeScreen;
const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        paddingVertical: Spacing.md,
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 100,
        gap: 50,
    },
});

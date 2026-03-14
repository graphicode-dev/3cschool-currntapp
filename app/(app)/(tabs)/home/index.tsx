import HomeBannerSection from "@/components/home/home-banner-section";
import HomeHeader from "@/components/home/home-header";
import HomeInfoSection from "@/components/home/home-info-section";
import HomeUpcomingSessions from "@/components/home/home-upcoming-sessions";
import { RenderSection } from "@/components/RenderSection";
import ScreenWrapper from "@/components/ScreenWrapper";
import { PullToRefreshScrollView } from "@/components/ui/Pulltorefresh";
import { Spacing } from "@/constants/theme";
import { authStore } from "@/services/auth/auth.store";
import { StyleSheet } from "react-native";

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
                contentContainerStyle={styles.scrollContent}>
                {/* Banner Section */}
                <HomeBannerSection />
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

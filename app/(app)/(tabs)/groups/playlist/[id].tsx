import CustomHeader from "@/components/custom-header";
import GroupsSessionPlaylist from "@/components/groups/groups-session-playlist";
import { RenderSection } from "@/components/RenderSection";
import ScreenWrapper from "@/components/ScreenWrapper";
import { PullToRefreshScrollView } from "@/components/ui/Pulltorefresh";
import { Spacing } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useRecordedSession } from "@/services/groups/groups.queries";
import { useLocalSearchParams } from "expo-router";
import * as ScreenCapture from "expo-screen-capture";
import { useEffect } from "react";
import { Alert, StyleSheet } from "react-native";

const PlaylistScreen = () => {
    useEffect(() => {
        let subscription: { remove: () => void } | undefined;

        const setupScreenCapture = async () => {
            await ScreenCapture.preventScreenCaptureAsync().catch((e) => {
                console.log(e);
            });

            const { status } = await ScreenCapture.requestPermissionsAsync();
            if (status === "granted") {
                subscription = ScreenCapture.addScreenshotListener(() => {
                    Alert.alert(
                        "Not Allowed",
                        "This action is not allowed for our policies. Screenshots and screen recording are prohibited on this screen.",
                    );
                });
            } else {
                console.error(
                    "Permissions needed to subscribe to screenshot events are missing!",
                );
            }
        };

        setupScreenCapture();

        return () => {
            subscription?.remove();
            ScreenCapture.allowScreenCaptureAsync().catch(() => {});
        };
    }, []);

    const { t } = useLanguage();
    const { id, sessionId } = useLocalSearchParams<{
        id: string;
        sessionId?: string;
    }>();
    const groupId = id as string;
    const sid = (sessionId as string) || "";

    const {
        data: recordedData,
        isLoading,
        error,
        refetch,
    } = useRecordedSession(groupId, sid, {
        enabled: !!groupId && !!sid,
    });

    const videos = recordedData?.items ?? [];
    return (
        <ScreenWrapper>
            <CustomHeader title={t("groups.playlist.title")} />

            <PullToRefreshScrollView
                refetches={[refetch]}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <RenderSection
                    isLoading={isLoading}
                    error={error?.message ?? ""}
                    data={videos}
                >
                    <GroupsSessionPlaylist videos={videos} />
                </RenderSection>
            </PullToRefreshScrollView>
        </ScreenWrapper>
    );
};

export default PlaylistScreen;

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        paddingVertical: Spacing.md,
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 100,
        paddingHorizontal: 20,
        gap: 50,
    },
});

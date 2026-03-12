import CustomHeader from "@/components/custom-header";
import { RenderSection } from "@/components/RenderSection";
import ScreenWrapper from "@/components/ScreenWrapper";
import SessionsList from "@/components/sessions/sessions-list";
import { PullToRefreshScrollView } from "@/components/ui/Pulltorefresh";
import { Spacing } from "@/constants/theme";
import { useGroup } from "@/services/groups/groups.queries";
import { useGroupSessions } from "@/services/sessions/sessions.queries";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";

const GroupDetailsScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const groupId = id as string;

    const { data: groupDetail } = useGroup(groupId, { enabled: !!groupId });

    const {
        data: sessionsData,
        isLoading,
        error,
        refetch,
    } = useGroupSessions(groupId, { enabled: !!groupId });

    const sessions = sessionsData?.sessions ?? [];
    const groupName =
        groupDetail?.group?.name ?? sessionsData?.group_name ?? "Group Details";

    return (
        <ScreenWrapper>
            <CustomHeader title={groupName} />

            <PullToRefreshScrollView
                refetches={[refetch]}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <RenderSection
                    isLoading={isLoading}
                    error={error?.message ?? ""}
                    data={sessions}
                >
                    <SessionsList
                        sessions={sessions}
                        title="Sessions"
                        count={sessions.length}
                    />
                </RenderSection>
            </PullToRefreshScrollView>

            {/* <GroupsFloatingMessageButton
                groupId={groupDetail!.group.id.toString()}
            /> */}
        </ScreenWrapper>
    );
};

export default GroupDetailsScreen;

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

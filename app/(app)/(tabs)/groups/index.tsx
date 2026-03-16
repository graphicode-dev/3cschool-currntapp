/**
 * Groups Tab Screen
 *
 * Layout:
 *   1. Session banner  – current ongoing session, else next upcoming.
 *      Progress card overlaid at bottom of banner.
 *   2. My Groups       – carousel of group cards (real API, image fallback).
 *   3. My To-Do        – Zustand-powered task list with filter tabs.
 */

import GroupsList from "@/components/groups/groups-list";
import GroupsMyTasks from "@/components/groups/groups-my-todo";
import { ProgressCard } from "@/components/groups/groups-progress-card";
import { GroupsSearch } from "@/components/groups/groups-search";
import { SessionCard } from "@/components/groups/groups-session-card";
import { RenderSection } from "@/components/RenderSection";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/themed-text";
import { PullToRefreshScrollView } from "@/components/ui/Pulltorefresh";
import { useLanguage } from "@/contexts/language-context";
import { useDebounce } from "@/hooks/useDebounce";
import { useGroupsList } from "@/services/groups/groups.queries";
import { useAllSessions } from "@/services/sessions/sessions.queries";
import { Session } from "@/services/sessions/sessions.types";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

// ─── Banner session picker ────────────────────────────────────────────────────

function pickBannerSession(upcoming: Session[]): Session | null {
    if (!upcoming.length) return null;

    const now = new Date();

    // 1. Prefer ongoing (started within the past 3 h and not yet finished)
    const ongoing = upcoming.find((s) => {
        try {
            const start = new Date(`${s.start_date}T${s.start_time}`);
            const ms = now.getTime() - start.getTime();
            return ms >= 0 && ms < 3 * 60 * 60 * 1000;
        } catch {
            return false;
        }
    });
    if (ongoing) return ongoing;

    // 2. Earliest future session
    const future = upcoming
        .filter((s) => {
            try {
                return new Date(`${s.start_date}T${s.start_time}`) > now;
            } catch {
                return false;
            }
        })
        .sort(
            (a, b) =>
                new Date(`${a.start_date}T${a.start_time}`).getTime() -
                new Date(`${b.start_date}T${b.start_time}`).getTime(),
        );

    return future[0] ?? upcoming[0];
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function GroupsScreen() {
    const { t } = useLanguage();
    // Search and filter state
    const [searchText, setSearchText] = useState("");

    // Debounced search value to avoid excessive API calls
    const debouncedSearch = useDebounce(searchText, 500);

    // Combine search and filter for API call
    const searchParams = useMemo(() => {
        const params: { search?: string; filter?: string } = {};
        if (debouncedSearch.trim()) {
            params.search = debouncedSearch.trim();
        }
        return params;
    }, [debouncedSearch]);

    const {
        data: groups = [],
        isLoading: groupsLoading,
        error: groupsError,
        refetch: refetchGroups,
    } = useGroupsList(searchParams);

    const {
        data: sessionsData,
        isLoading: sessionsLoading,
        refetch: refetchSessions,
    } = useAllSessions();

    const bannerSession = useMemo(
        () => pickBannerSession(sessionsData?.upcoming ?? []),
        [sessionsData?.upcoming],
    );

    const totalSessions =
        (sessionsData?.total_upcoming ?? 0) + (sessionsData?.past?.length ?? 0);
    const doneSessions = sessionsData?.past?.length ?? 0;

    // Earliest strictly-future session for the donut countdown.
    // bannerSession may be ongoing or past — this always looks ahead.
    const nextSessionDate = useMemo(() => {
        const now = Date.now();

        const future = (sessionsData?.upcoming ?? [])
            .filter((s) => {
                try {
                    // Parse date properly - handle both date formats
                    let sessionDate: Date;

                    // If start_date already includes time, use it directly
                    if (
                        s.start_date.includes(" ") &&
                        s.start_date.includes(":")
                    ) {
                        sessionDate = new Date(s.start_date);
                    } else {
                        // Otherwise combine start_date and start_time
                        sessionDate = new Date(
                            `${s.start_date}T${s.start_time}`,
                        );
                    }

                    const sessionTime = sessionDate.getTime();
                    const isFuture = sessionTime > now;

                    return isFuture;
                } catch (error) {
                    console.error(`❌ Invalid date for session ${s.id}:`, {
                        start_date: s.start_date,
                        start_time: s.start_time,
                        error,
                    });
                    return false;
                }
            })
            .sort((a, b) => {
                const dateA =
                    a.start_date.includes(" ") && a.start_date.includes(":")
                        ? new Date(a.start_date).getTime()
                        : new Date(`${a.start_date}T${a.start_time}`).getTime();
                const dateB =
                    b.start_date.includes(" ") && b.start_date.includes(":")
                        ? new Date(b.start_date).getTime()
                        : new Date(`${b.start_date}T${b.start_time}`).getTime();
                return dateA - dateB;
            });

        if (!future.length) {
            console.error("❌ No future sessions found");
            return undefined;
        }

        const nextSession =
            future[0].start_date.includes(" ") &&
            future[0].start_date.includes(":")
                ? new Date(future[0].start_date)
                : new Date(`${future[0].start_date}T${future[0].start_time}`);

        return nextSession;
    }, [sessionsData?.upcoming]);

    return (
        <ScreenWrapper>
            <PullToRefreshScrollView
                refetches={[refetchGroups, refetchSessions]}
                style={styles.scroll}
                contentContainerStyle={styles.content}
            >
                {/* ── 1. Session banner ───────────────────────────────────── */}
                <View style={styles.bannerSection}>
                    <RenderSection
                        isLoading={sessionsLoading}
                        error=""
                        data={bannerSession}
                    >
                        {bannerSession ? (
                            <SessionCard session={bannerSession} />
                        ) : null}
                    </RenderSection>

                    {/* Progress card sits on top of the banner's bottom edge */}
                    {!sessionsLoading && (
                        <>
                            <ProgressCard
                                label={t("groups.index.nextSession")}
                                highlight={`${nextSessionDate?.toLocaleDateString()} - ${nextSessionDate?.toLocaleTimeString()}`}
                                elapsed={doneSessions}
                                total={Math.max(totalSessions, 1)}
                                nextSessionDate={nextSessionDate!}
                            />
                        </>
                    )}
                </View>

                {/* ── 2. My Groups ────────────────────────────────────────── */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle} fontSize={20}>
                        {t("groups.index.myGroups")}
                    </ThemedText>

                    {/* Search */}
                    <GroupsSearch
                        searchValue={searchText}
                        onSearchChange={setSearchText}
                    />

                    <RenderSection
                        isLoading={groupsLoading}
                        error={groupsError?.message ?? ""}
                        data={groups}
                    >
                        <GroupsList data={groups} />
                    </RenderSection>
                </View>

                {/* ── 3. My To-Do ─────────────────────────────────────────── */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle} fontSize={20}>
                        {t("groups.index.myTodo")}
                    </ThemedText>
                    <GroupsMyTasks />
                </View>
            </PullToRefreshScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    content: {
        paddingBottom: 120,
        gap: 36,
        paddingTop: 16,
        paddingHorizontal: 20,
    },

    // Banner: needs extra paddingBottom so the overlaid ProgressCard
    // (position: absolute, bottom: -36) doesn't clip into the next section.
    bannerSection: {
        position: "relative",
        paddingBottom: 50,
    },

    section: { gap: 14 },

    sectionTitle: {
        color: "#393838",
        textTransform: "capitalize",
    },
});

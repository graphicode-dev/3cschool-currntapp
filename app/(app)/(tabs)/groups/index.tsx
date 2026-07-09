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

const parseSafe = (s: Session) => {
    if (s.start_date.includes(" ") && s.start_date.includes(":")) {
        return new Date(s.start_date.replace(" ", "T"));
    }
    return new Date(`${s.start_date}T${s.start_time}`);
};

function pickBannerSession(upcoming: Session[]): Session | null {
    if (!upcoming.length) return null;

    const now = new Date();

    // Helper to safely parse dates across JS engines (iOS JSC)
    const parseSafe = (s: Session) => {
        if (s.start_date.includes(" ") && s.start_date.includes(":")) {
            return new Date(s.start_date.replace(" ", "T"));
        }
        return new Date(`${s.start_date}T${s.start_time}`);
    };

    // 1. Prefer ongoing (started within the past 3 h and not yet finished)
    const ongoing = upcoming.find((s) => {
        try {
            const start = parseSafe(s);
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
                return parseSafe(s) > now;
            } catch {
                return false;
            }
        })
        .sort((a, b) => {
            try {
                return parseSafe(a).getTime() - parseSafe(b).getTime();
            } catch {
                return 0;
            }
        });

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

        // Helper to safely parse dates across JS engines (iOS JSC)
        const parseSafe = (s: Session) => {
            if (s.start_date.includes(" ") && s.start_date.includes(":")) {
                return new Date(s.start_date.replace(" ", "T"));
            }
            return new Date(`${s.start_date}T${s.start_time}`);
        };

        const future = (sessionsData?.upcoming ?? [])
            .filter((s) => {
                try {
                    const sessionDate = parseSafe(s);
                    const sessionTime = sessionDate.getTime();
                    // Must be valid date to be future
                    if (isNaN(sessionTime)) return false;
                    return sessionTime > now;
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
                const dateA = parseSafe(a).getTime();
                const dateB = parseSafe(b).getTime();
                return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
            });

        if (!future.length) {
            console.error("❌ No future sessions found");
            return undefined;
        }

        const nextSession = parseSafe(future[0]);
        // Double check it's a valid date object before returning
        return isNaN(nextSession.getTime()) ? undefined : nextSession;
    }, [sessionsData?.upcoming]);

    return (
        <ScreenWrapper>
            <PullToRefreshScrollView
                refetches={[refetchGroups, refetchSessions]}
                style={styles.scroll}
                contentContainerStyle={styles.content}
            >
                {/* ── 1. Session banner ───────────────────────────────────── */}
                <View
                    style={[
                        styles.bannerSection,
                        !bannerSession && { paddingBottom: 0, marginBottom: 20 },
                    ]}
                >
                    {bannerSession && (
                        <RenderSection
                            isLoading={sessionsLoading}
                            error=""
                            data={bannerSession}
                        >
                            <SessionCard session={bannerSession} />
                        </RenderSection>
                    )}

                    {/* Progress card sits on top of the banner's bottom edge if banner exists */}
                    {!sessionsLoading && bannerSession && (
                        <ProgressCard
                            label={t("groups.index.nextSession")}
                            highlight={nextSessionDate ? `${nextSessionDate.toLocaleDateString()} - ${nextSessionDate.toLocaleTimeString()}` : undefined}
                            elapsed={doneSessions}
                            total={Math.max(totalSessions, 1)}
                            nextSessionDate={nextSessionDate!}
                            style={{ position: "absolute", bottom: -36 }}
                        />
                    )}
                </View>

                {/* ── 2. My Groups ────────────────────────────────────────── */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle} fontSize={20}>
                        {t("groups.index.myGroups")}
                    </ThemedText>

                    {/* If there is no banner, ProgressCard moves here between Title and Search */}
                    {!sessionsLoading && !bannerSession && (
                        <ProgressCard
                            label={t("groups.index.nextSession")}
                            highlight={nextSessionDate ? `${nextSessionDate.toLocaleDateString()} - ${nextSessionDate.toLocaleTimeString()}` : undefined}
                            elapsed={doneSessions}
                            total={Math.max(totalSessions, 1)}
                            nextSessionDate={nextSessionDate!}
                            style={{ marginBottom: 12, marginTop: 4, width: "100%" }}
                        />
                    )}

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

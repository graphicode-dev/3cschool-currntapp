import { RenderSection } from "@/components/RenderSection";
import SessionsList from "@/components/sessions/sessions-list";
import { useAllSessions } from "@/services/sessions/sessions.queries";

const HomeUpcomingSessions = () => {
    const { data, isLoading, error } = useAllSessions();

    const upcomingSessions = data?.upcoming ?? [];
    const totalUpcoming = data?.total_upcoming ?? 0;

    return (
        <RenderSection
            isLoading={isLoading}
            error={error?.message ?? ""}
            data={upcomingSessions}
        >
            <SessionsList
                sessions={upcomingSessions}
                title="Upcoming Sessions"
                count={totalUpcoming}
            />
        </RenderSection>
    );
};

export default HomeUpcomingSessions;

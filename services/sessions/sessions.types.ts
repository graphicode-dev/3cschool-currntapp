export interface Session {
    id: number;
    session_number: number;
    start_date: string;
    start_time: string;
    end_time: string;
    duration: string | null;
    session_status: string | null;
    bbb_meeting_id: string | null;
    recording_url: string | null;
    group: {
        id: number;
        name: string;
        course: {
            id: number;
            title: string;
        };
    };
    instructor: {
        id: number;
        full_name: string;
        avatar: string | null;
    };
    session_info: {
        id: number;
        title: string;
    };
}

export interface SessionWithInfo extends Session {
    session_info: {
        id: number;
        title: string;
    };
}

export interface AllSessionsResponse {
    upcoming: Session[];
    past: Session[];
    total_upcoming: number;
    total_past: number;
}

export interface GroupSessionsResponse {
    group_id: number;
    group_name: string;
    sessions: SessionWithInfo[];
}

export interface SessionMetadata {
    filters: {
        column: string;
        label: string;
        type: "text" | "number" | "date" | "select" | "boolean";
        operators: string[];
        searchable: boolean;
    }[];
    operators: Record<string, string>;
    fieldTypes: Record<
        "text" | "number" | "date" | "select" | "boolean",
        {
            operators: string[];
            inputType: string;
        }
    >;
}

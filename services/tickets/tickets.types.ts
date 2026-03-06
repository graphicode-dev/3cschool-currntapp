export interface TicketStudent {
    id: number;
    student_code: string;
    username: string;
    full_name: string;
    role_name: string;
    job_level: string | null;
    grade_id: number;
    current_course_id: number;
    next_course_id: number;
    current_extra_course_id: number | null;
    next_extra_course_id: number | null;
    organ_id: number | null;
    mobile: string;
    email: string;
    age: number;
    parent_number: string | null;
    parent_name: string | null;
    school: string;
    age_group_id: number;
    country: string;
    city: string;
    note: string | null;
    session_quota: number;
    stage: string;
    assigned_at: string | null;
    assigned_to_sales_upgrade_user_id: number | null;
    bio: string | null;
    logged_count: number;
    verified: number;
    financial_approval: number;
    installment_approval: number;
    enable_installments: number;
    disable_cashback: number;
    enable_registration_bonus: number;
    registration_bonus_amount: number | null;
    avatar: string | null;
    avatar_settings: string;
    cover_img: string | null;
    profile_video: string | null;
    profile_secondary_image: string | null;
    headline: string | null;
    about: string | null;
    address: string | null;
    country_id: number | null;
    province_id: number | null;
    city_id: number | null;
    district_id: number | null;
    location: any[];
    level_of_training: string | null;
    meeting_type: string;
    status: string;
    access_content: number;
    enable_ai_content: number;
    language: string;
    currency: string | null;
    timezone: string | null;
    theme_color_mode: string;
    newsletter: number;
    public_message: number;
    enable_profile_statistics: number;
    identity_scan: string | null;
    certificate: string | null;
    affiliate: number;
    can_create_store: number;
    ban: number;
    ban_start_at: string | null;
    ban_end_at: string | null;
    offline: number;
    offline_message: string | null;
    created_by_id: number;
    updated_by_id: number | null;
    created_at: number;
    updated_at: number | null;
    deleted_at: number | null;
}

export interface TicketInstructor {
    id: number;
    full_name: string;
    email: string;
    avatar: string | null;
}

export interface TicketCourseGroup {
    id: number;
    name: string;
}

export interface TicketMessage {
    id: number;
    ticket_id: number;
    sender_id: number;
    message: string;
    attachment: string | null;
    is_read: boolean;
    created_at: number;
    sender?: {
        id: number;
        full_name: string;
        email: string;
        avatar: string | null;
    };
}

export interface TicketLatestMessage {
    id: number;
    ticket_id: number;
    sender_id: number;
    message: string;
    attachment: string | null;
    is_read: boolean;
    created_at: number;
}

export interface Ticket {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    course_group: TicketCourseGroup | null;
    student: TicketStudent;
    instructor: TicketInstructor | null;
    unread_count: number;
    latest_message: TicketLatestMessage | null;
    created_at: number;
    closed_at: number | null;
}

export interface TicketDetail extends Ticket {
    course_group_id: number;
    student_id: number;
    instructor_id: number | null;
    source: string;
    updated_at: number;
    messages: TicketMessage[];
}

export interface TicketMetadata {
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

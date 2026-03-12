export interface GroupMessage {
    id: number;
    sender_id: number;
    receiver_id: number | null;
    course_group_id: number;
    type: "group" | "private";
    message: string;
    attachment_path: string | null;
    attachment_name: string | null;
    attachment_type: string | null;
    attachment_size: number | null;
    read_at: string | null;
    created_at: string;
    updated_at: string;
    sender: {
        id: number;
        full_name: string;
        email: string;
        avatar: string | null;
        role_name?: string;
    };
    attachment_url?: string;
}

export interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

/**
 * A single page of chat messages as returned by the API.
 * The server wraps everything in { code, data: [...], pagination }.
 * After our httpClient unwraps the outer envelope we get this shape.
 */
export interface GroupChatPage {
    data: GroupMessage[];
    pagination: Pagination;
}

/**
 * @deprecated Use GroupChatPage instead
 */
export type GroupChatResponse = GroupChatPage;

export interface GroupSchedule {
    time: string;
    end_time: string;
    day_label: string;
    start_time: string;
}

export interface GroupCourse {
    id: number;
    category_id: number;
    language: string;
    type: string;
    level_number: number;
    level_name: string;
    private: number;
    slug: string;
    start_date: string | null;
    duration: number;
    timezone: string;
    thumbnail: string;
    image_cover: string;
    video_demo: string | null;
    video_demo_source: string | null;
    icon: string | null;
    capacity: number | null;
    sales_count_number: number | null;
    organization_price: number | null;
    support: number;
    certificate: number;
    downloadable: number;
    partner_instructor: number;
    subscribe: number;
    forum: number;
    enable_waitlist: number;
    access_days: number | null;
    points: number | null;
    message_for_reviewer: string | null;
    price: number;
    price_leaders: number;
    price_heads: number;
    price_demo: number;
    status: string;
    created_at: number;
    updated_at: number;
    deleted_at: number | null;
    title: string;
    description: string;
    summary: string;
    seo_description: string | null;
    translations: {
        id: number;
        webinar_id: number;
        locale: string;
        title: string;
        seo_description: string | null;
        summary: string;
        description: string;
    }[];
}

export interface GroupTeacher {
    id: number;
    student_code: string | null;
    username: string;
    full_name: string;
    role_name: string;
    job_level: string | null;
    grade_id: number | null;
    current_course_id: number | null;
    next_course_id: number | null;
    current_extra_course_id: number | null;
    next_extra_course_id: number | null;
    organ_id: number | null;
    mobile: string;
    email: string;
    age: number | null;
    parent_number: string | null;
    parent_name: string | null;
    school: string | null;
    age_group_id: number | null;
    country: string | null;
    city: string | null;
    note: string | null;
    session_quota: number | null;
    stage: string | null;
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
    language: string | null;
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

export interface GroupAgeGroup {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface LastGroupMessage {
    id: number;
    message: string;
    created_at: string;
    sender: {
        id: number;
        full_name: string;
        avatar: string | null;
        role_name: string;
    };
    has_attachment: boolean;
    attachment_type: string | null;
}

export interface Group {
    id: number;
    teacher_id: number;
    created_by: number;
    assigned_sales_id: number | null;
    assigned_sales_at: string | null;
    course_id: number;
    age_group_id: number;
    name: string;
    is_demo: boolean;
    status: string;
    session_6_confirmed: boolean;
    session_6_confirmed_by: number | null;
    session_6_confirmed_at: string | null;
    is_finished: boolean;
    finished_by: number | null;
    finished_at: string | null;
    group_type: string;
    schedule: GroupSchedule[];
    start_date: string;
    created_at: number;
    updated_at: number;
    deleted_at: number | null;
    course: GroupCourse;
    teacher: GroupTeacher;
    age_group: GroupAgeGroup;
    last_message: LastGroupMessage | null;
    unread_count: number;
}

export interface GroupDetail {
    group: Group;
    course: GroupCourse;
    teacher: {
        id: number;
        full_name: string;
        email: string;
        avatar: string | null;
        role: string;
        unread_count: number;
        last_message: {
            id: number;
            sender_id: number;
            receiver_id: number;
            course_group_id: number;
            type: string;
            message: string;
            attachment_path: string | null;
            attachment_name: string | null;
            attachment_type: string | null;
            attachment_size: number | null;
            read_at: string | null;
            created_at: string;
            updated_at: string;
        };
    };
}

export interface UnreadMessagesResponse {
    total_unread: number;
    by_group: {
        course_group_id: number | null;
        count: number;
    }[];
}

export interface MessageSendPayload {
    message: string;
    attachment?: File;
}

export interface BroadcastPayload {
    message: string;
}

export interface MessageSendResponse {
    sender_id: number;
    receiver_id: string;
    course_group_id: string;
    type: string;
    message: string;
    attachment_path: string | null;
    attachment_name: string | null;
    attachment_type: string | null;
    attachment_size: number | null;
    updated_at: string;
    created_at: string;
    id: number;
    attachment_url?: string;
    sender: {
        id: number;
        full_name: string;
        email: string;
        avatar: string | null;
    };
}

export interface BroadcastResponse {
    recipients_count: number;
}

/**
 * Auth Module - Type Definitions
 *
 * Types for authentication and authorization.
 */

// ============================================================================
// Auth Types
// ============================================================================

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

// ============================================================================
// Update Profile
// ============================================================================

/**
 * Only the fields the user is allowed to update.
 * All fields are optional — only changed ones are sent.
 */
export interface UpdateProfileRequest {
    full_name?: string;
    email?: string;
    mobile?: string;
    address?: string;
    /** Local file URI from expo-image-picker */
    avatar?: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
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
    location: unknown[];
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
    token: string;
}

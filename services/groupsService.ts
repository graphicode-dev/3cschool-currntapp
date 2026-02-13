import { api, ApiResponse } from "./api";

export interface Schedule {
  time: string;
  day_label: string;
  start_time?: string;
  end_time?: string;
}

export interface Course {
  id: number;
  title: string;
  level_name: string;
  level_number: number;
  thumbnail: string | null;
  image_cover: string | null;
  summary: string;
  category_id?: number;
  language?: string;
  type?: string;
  description?: string;
  price?: number;
  status?: string;
}

export interface LastMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  course_group_id: number;
  type: string;
  message: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: number;
  full_name: string;
  avatar: string | null;
  avatar_settings: string | null;
  email: string;
  mobile: string;
  role_name?: string;
  job_level?: string;
  status?: string;
  unread_count?: number;
  last_message?: LastMessage | null;
}

export interface Student {
  id: number;
  student_code?: string | null;
  username?: string;
  full_name: string;
  role_name?: string;
  role?: string;
  avatar: string | null;
  avatar_settings?: string | null;
  email: string;
  mobile?: string;
  age?: number | null;
  school?: string | null;
  status?: string;
  unread_count: number;
  last_message: LastMessage | null;
}

export interface AgeGroup {
  id: number;
  name: string;
}

export interface Group {
  id: number;
  name: string;
  teacher_id: number;
  course_id: number;
  age_group_id: number;
  is_demo: boolean;
  status: string;
  group_type: string;
  schedule: Schedule[];
  start_date: string | null;
  created_at: number;
  course: Course;
  teacher: Teacher;
  age_group: AgeGroup;
}

export interface GroupInfo {
  id: number;
  name: string;
  status: string;
  group_type: string;
  schedule: Schedule[];
}

export interface GroupDetailsData {
  group: GroupInfo;
  course: Course;
  teacher?: Teacher;
  students?: Student[];
}

export interface GroupsResponse {
  code: number;
  message: string;
  data: Group[];
}

export interface GroupDetailsResponse {
  code: number;
  message: string;
  data: GroupDetailsData;
}

export interface SessionInstructor {
  id: number;
  full_name: string;
  avatar: string | null;
}

export interface GroupSession {
  id: number;
  session_number: number;
  start_date: string | null;
  start_time: string | null;
  end_time: string | null;
  duration: number | null;
  session_status: string | null;
  bbb_meeting_id: string | null;
  recording_url: string | null;
  instructor: SessionInstructor;
}

export interface GroupSessionsData {
  group: {
    id: number;
    name: string;
  };
  sessions: GroupSession[];
}

export interface GroupSessionsResponse {
  code: number;
  message: string;
  data: GroupSessionsData;
}

export interface UpcomingSession {
  id: number;
  session_number: number;
  start_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  session_status: string;
  bbb_meeting_id?: string;
  recording_url?: string | null;
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
    avatar?: string | null;
  };
}

export interface AllSessionsData {
  upcoming: UpcomingSession[];
  past: UpcomingSession[];
  total_upcoming: number;
  total_past: number;
}

export const groupsService = {
  async getGroups(): Promise<ApiResponse<Group[]>> {
    return api.get<Group[]>("/groups");
  },

  async getGroupDetails(id: number): Promise<ApiResponse<GroupDetailsData>> {
    return api.get<GroupDetailsData>(`/groups/${id}`);
  },

  async getGroupSessions(id: number): Promise<ApiResponse<GroupSessionsData>> {
    return api.get<GroupSessionsData>(`/groups/${id}/sessions`);
  },

  async getAllSessions(): Promise<ApiResponse<AllSessionsData>> {
    return api.get<AllSessionsData>("/groups/all-sessions");
  },
};

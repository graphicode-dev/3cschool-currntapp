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

export const groupsService = {
  async getGroups(): Promise<ApiResponse<Group[]>> {
    return api.get<Group[]>("/groups");
  },

  async getGroupDetails(id: number): Promise<ApiResponse<GroupDetailsData>> {
    return api.get<GroupDetailsData>(`/groups/${id}`);
  },
};

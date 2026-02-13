import { api, ApiResponse } from "./api";

export interface PollOption {
  id: number;
  poll_id: number;
  option_text: string;
  votes_count: number;
  vote_percentage: number;
  voters?: PollVoter[];
  created_at: string;
  updated_at: string;
}

export interface PollVoter {
  id: number;
  full_name: string;
  avatar: string | null;
}

export interface PollCreator {
  id: number;
  full_name: string;
  avatar: string | null;
  role_name: string;
}

export interface Poll {
  id: number;
  course_group_id: number;
  created_by: number;
  question: string;
  is_multiple_choice: boolean;
  is_anonymous: boolean;
  expires_at: string | null;
  closed_at: string | null;
  total_votes: number;
  created_at: string;
  updated_at: string;
  options: PollOption[];
  creator: PollCreator;
  user_voted: boolean;
  user_votes?: number[];
  is_expired: boolean;
  is_closed: boolean;
}

export interface CreatePollRequest {
  question: string;
  options: string[];
  is_multiple_choice?: boolean;
  is_anonymous?: boolean;
  expires_in_hours?: number;
}

export interface VoteRequest {
  option_ids: number[];
}

export interface PollsListResponse {
  code: number;
  message: string;
  data: Poll[];
}

export interface PollResponse {
  code: number;
  message: string;
  data: Poll;
}

export const pollsService = {
  async getPolls(groupId: number): Promise<PollsListResponse> {
    const response = await api.get<Poll[]>(`/groups/${groupId}/polls`);
    return response as unknown as PollsListResponse;
  },

  async getPoll(groupId: number, pollId: number): Promise<PollResponse> {
    const response = await api.get<Poll>(`/groups/${groupId}/polls/${pollId}`);
    return response as unknown as PollResponse;
  },

  async createPoll(
    groupId: number,
    data: CreatePollRequest
  ): Promise<ApiResponse<Poll>> {
    return api.post<Poll>(`/groups/${groupId}/polls`, data);
  },

  async vote(
    groupId: number,
    pollId: number,
    optionIds: number[]
  ): Promise<ApiResponse<Poll>> {
    return api.post<Poll>(`/groups/${groupId}/polls/${pollId}/vote`, {
      option_ids: optionIds,
    });
  },

  async closePoll(
    groupId: number,
    pollId: number
  ): Promise<ApiResponse<Poll>> {
    return api.post<Poll>(`/groups/${groupId}/polls/${pollId}/close`, {});
  },
};

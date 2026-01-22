import { api, ApiResponse } from "./api";

export interface MessageSender {
  id: number;
  full_name: string;
  email: string;
  avatar: string | null;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  course_group_id: number;
  type: string;
  message: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  sender: MessageSender;
}

export interface SendMessageRequest {
  message: string;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface MessagesResponse {
  code: number;
  message: string;
  data: Message[];
  pagination: Pagination;
}

export interface SendMessageResponse {
  code: number;
  message: string;
  data: Message;
}

export const messagesService = {
  async getMessages(
    groupId: number,
    userId: number,
    page: number = 1,
  ): Promise<MessagesResponse> {
    const response = await api.get<Message[]>(
      `/groups/${groupId}/messages/${userId}?page=${page}`,
    );
    return response as unknown as MessagesResponse;
  },

  async sendMessage(
    groupId: number,
    userId: number,
    message: string,
  ): Promise<ApiResponse<Message>> {
    return api.post<Message>(`/groups/${groupId}/messages/${userId}`, {
      message,
    });
  },

  async broadcastMessage(
    groupId: number,
    message: string,
  ): Promise<ApiResponse<{ sent_count: number }>> {
    return api.post<{ sent_count: number }>(`/groups/${groupId}/broadcast`, {
      message,
    });
  },

  async getUnreadCount(): Promise<ApiResponse<{ unread_count: number }>> {
    return api.get<{ unread_count: number }>("/messages/unread");
  },
};

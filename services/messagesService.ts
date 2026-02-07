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
  attachment_path?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  attachment_size?: number | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  sender: MessageSender;
}

export interface SendMessageRequest {
  message: string;
}

export interface AttachmentInput {
  uri: string;
  name: string;
  mimeType?: string;
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
    message?: string,
    attachment?: AttachmentInput,
  ): Promise<ApiResponse<Message>> {
    if (attachment) {
      const formData = new FormData();
      if (message && message.trim().length > 0) {
        formData.append("message", message.trim());
      }

      formData.append(
        "attachment",
        {
          uri: attachment.uri,
          name: attachment.name,
          type: attachment.mimeType || "application/octet-stream",
        } as any,
      );

      return api.postFormData<Message>(
        `/groups/${groupId}/messages/${userId}`,
        formData,
      );
    }

    return api.post<Message>(`/groups/${groupId}/messages/${userId}`, {
      message: message || "",
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

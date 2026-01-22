import { api, ApiResponse } from "./api";

export interface TicketMessageSender {
  id: number;
  full_name: string;
  email: string;
  avatar: string | null;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  sender_id: number;
  message: string;
  attachment: string | null;
  is_read: boolean;
  created_at: number;
  sender?: TicketMessageSender;
}

export interface TicketStudent {
  id: number;
  full_name: string;
  email: string;
  avatar: string | null;
}

export interface TicketInstructor {
  id: number;
  full_name: string;
  email: string;
  avatar: string | null;
  avatar_settings: string | null;
}

export interface TicketCourseGroup {
  id: number;
  name: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  course_group: TicketCourseGroup;
  student: TicketStudent;
  instructor: TicketInstructor;
  unread_count: number;
  latest_message: TicketMessage | null;
  created_at: number;
  closed_at: number | null;
  messages?: TicketMessage[];
}

export interface CreateTicketRequest {
  course_group_id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}

export interface ReplyTicketRequest {
  message: string;
}

export interface TicketsResponse {
  code: number;
  message: string;
  data: Ticket[];
}

export interface TicketResponse {
  code: number;
  message: string;
  data: Ticket;
}

export const ticketsService = {
  async getTickets(): Promise<ApiResponse<Ticket[]>> {
    return api.get<Ticket[]>("/tickets");
  },

  async getTicket(ticketId: number): Promise<ApiResponse<Ticket>> {
    return api.get<Ticket>(`/tickets/${ticketId}`);
  },

  async createTicket(data: CreateTicketRequest): Promise<ApiResponse<Ticket>> {
    return api.post<Ticket>("/tickets", data);
  },

  async replyToTicket(
    ticketId: number,
    message: string,
  ): Promise<ApiResponse<TicketMessage>> {
    return api.post<TicketMessage>(`/tickets/${ticketId}/reply`, { message });
  },
};

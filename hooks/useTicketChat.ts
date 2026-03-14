import { useAuthStore } from "@/services/auth/auth.store";
import { ticketsApi } from "@/services/tickets/tickets.api";
import { ticketsKeys } from "@/services/tickets/tickets.keys";
import { useTicket, useTicketsList } from "@/services/tickets/tickets.queries";
import {
    TicketLatestMessage,
    TicketMessage,
} from "@/services/tickets/tickets.types";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MappedChatMessage {
    id: string;
    text: string;
    sender: "me" | "user";
    createdAt: string;
    avatar?: string;
    senderName?: string;
    imageUrl?: string;
    replyTo?: MappedChatMessage;
}

export interface MappedTicket {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    avatar?: string;
    lastMessage?: TicketLatestMessage;
    unreadCount: number;
    time: string;
    created_at: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toChatMessage = (msg: TicketMessage, myId: number): MappedChatMessage => {
    let createdAt = "";
    try {
        // Handle different timestamp formats
        let date: Date;
        if (typeof msg.created_at === "number") {
            // Unix timestamp (seconds or milliseconds)
            if (msg.created_at < 10000000000) {
                // Assume seconds
                date = new Date(msg.created_at * 1000);
            } else {
                // Assume milliseconds
                date = new Date(msg.created_at);
            }
        } else {
            // String timestamp
            date = new Date(msg.created_at);
        }

        if (!isNaN(date.getTime())) {
            createdAt = date.toISOString();
        }
    } catch {
        // Fallback to empty string if date parsing fails
    }

    // Use msg.sender?.id since sender_id is not in the API response
    const senderId = msg.sender?.id ?? msg.sender_id;

    return {
        id: String(msg.id),
        text: msg.message ?? "",
        sender: senderId === myId ? "me" : "user",
        createdAt,
        avatar: msg.sender?.avatar ?? undefined,
        senderName: msg.sender?.full_name,
        imageUrl: msg.attachment ?? undefined,
    };
};

const toTime = (iso: string) => {
    try {
        const date = new Date(iso);
        if (isNaN(date.getTime())) {
            return "";
        }
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "";
    }
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTicketChat = () => {
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
        null,
    );
    const [searchQuery, setSearchQuery] = useState("");

    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    // ── Queries ───────────────────────────────────────────────────────────────

    const {
        data: tickets = [],
        isLoading: ticketsLoading,
        error: ticketsError,
        refetch: refetchTickets,
    } = useTicketsList({});

    const {
        data: ticket,
        isLoading: ticketLoading,
        error: ticketError,
        refetch: refetchTicket,
    } = useTicket(selectedTicketId!, {
        enabled: !!selectedTicketId,
    });

    // ── Polling on screen focus ───────────────────────────────────────────────

    const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
        null,
    );

    useFocusEffect(
        useCallback(() => {
            if (!selectedTicketId) return;

            // Start polling when screen becomes focused
            pollingIntervalRef.current = setInterval(() => {
                refetchTicket();
            }, 1000 * 10); // Poll every 10 seconds

            // Cleanup on blur
            return () => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                }
            };
        }, [selectedTicketId, refetchTicket]),
    );

    // ── Mutations ─────────────────────────────────────────────────────────────

    const sendMessageMutation = useMutation({
        mutationFn: ({ text, imageUri }: { text: string; imageUri?: string }) =>
            ticketsApi.sendMessage(selectedTicketId!, {
                message: text || undefined,
                attachmentUri: imageUri,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ticketsKeys.detail(selectedTicketId!),
            });
            queryClient.invalidateQueries({
                queryKey: ticketsKeys.lists(),
            });
        },
        onError: (error) => {
            console.error("Failed to send ticket message:", error);
        },
    });

    // ── Mapped data ─────────────────────────────────────────────────────────--

    const mappedTickets: MappedTicket[] = useMemo(() => {
        return tickets.map((ticket) => ({
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            avatar: ticket.instructor?.avatar || undefined,
            lastMessage: ticket.latest_message || undefined,
            unreadCount: ticket.unread_count,
            time: toTime(ticket.created_at?.toString() || ""),
            created_at: ticket.created_at,
        }));
    }, [tickets]);

    const filteredTickets: MappedTicket[] = useMemo(() => {
        const q = searchQuery.toLowerCase();
        if (!q) return mappedTickets;
        return mappedTickets.filter(
            (ticket) =>
                ticket.title.toLowerCase().includes(q) ||
                ticket.description.toLowerCase().includes(q),
        );
    }, [mappedTickets, searchQuery]);

    const selectedTicket = useMemo(() => {
        if (!ticket) return null;

        // Convert TicketMessage to TicketLatestMessage for consistency
        const lastMessage = ticket.messages?.[ticket.messages.length - 1];
        const latestMessage = lastMessage
            ? {
                  id: lastMessage.id,
                  sender_id: lastMessage.sender?.id || 0,
                  message: lastMessage.message || "",
                  attachment: lastMessage.attachment || null,
                  is_read: lastMessage.is_read || false,
                  created_at:
                      typeof lastMessage.created_at === "string"
                          ? new Date(lastMessage.created_at).getTime() / 1000
                          : lastMessage.created_at,
              }
            : undefined;

        return {
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            avatar: ticket.instructor?.avatar || undefined,
            lastMessage: latestMessage,
            unreadCount: 0, // TicketDetail doesn't have unread_count, default to 0
            time: toTime(ticket.updated_at?.toString() || ""),
        } as MappedTicket;
    }, [ticket]);

    const messages: MappedChatMessage[] = useMemo(() => {
        if (!ticket?.messages || !user) return [];

        try {
            return ticket.messages
                .filter((msg: TicketMessage) => msg && msg.id)
                .sort(
                    (a: TicketMessage, b: TicketMessage) =>
                        a.created_at - b.created_at,
                )
                .map((m: TicketMessage) => toChatMessage(m, user.id))
                .reverse();
        } catch (error) {
            console.error("Error processing messages:", error);
            return [];
        }
    }, [ticket?.messages, user]);

    // ── Handlers ─────────────────────────────────────────────────────────────-

    const selectTicket = useCallback(
        async (ticketId: string | number) => {
            const ticketIdStr = String(ticketId);

            // Clear first so React sees a state change
            setSelectedTicketId(null);

            // Remove cached data so the query starts fresh
            await queryClient.removeQueries({
                queryKey: ticketsKeys.detail(ticketIdStr),
            });

            // Set the ID in next microtask
            queueMicrotask(() => {
                setSelectedTicketId(ticketIdStr);
            });
        },
        [queryClient],
    );

    const clearSelection = useCallback(() => {
        setSelectedTicketId(null);
    }, []);

    const sendMessage = useCallback(
        async (text: string, imageUri?: string) => {
            if (!selectedTicketId || (!text.trim() && !imageUri)) return;

            try {
                await sendMessageMutation.mutateAsync({ text, imageUri });
                // Refetch ticket data to get the new message
                refetchTicket();
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        },
        [selectedTicketId, sendMessageMutation, refetchTicket],
    );

    return {
        // Data
        tickets: mappedTickets,
        filteredTickets,
        selectedTicket,
        messages,
        selectedTicketId,

        // Loading states
        isLoading: ticketsLoading,
        isLoadingTicket: ticketLoading,
        isSending: sendMessageMutation.isPending,

        // Error handling
        error: (ticketsError as Error | null)?.message ?? null,
        ticketError: (ticketError as Error | null)?.message ?? null,

        // Search
        searchQuery,
        setSearchQuery,

        // Actions
        selectTicket,
        clearSelection,
        sendMessage,
        refetch: refetchTickets,
    };
};

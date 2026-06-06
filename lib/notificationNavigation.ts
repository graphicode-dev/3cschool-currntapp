import { Router } from "expo-router";

export function navigateFromNotification(router: Router, payload: any) {
    const data = payload?.data ?? payload ?? {};
    const type = payload?.type || data?.type || "";

    // Chat messages
    if (
        (type === "chat_message" ||
            type === "broadcast_message" ||
            type === "group_chat_message") &&
        (data.group_id || payload?.group_id)
    ) {
        const groupId = String(data.group_id || payload?.group_id);
        const groupName = String(
            data.group_name || payload?.group_name || "Chat",
        );
        router.push({
            pathname: "/(app)/(tabs)/chats/[id]",
            params: {
                id: groupId,
                groupId,
                groupName,
            },
        } as any);
        return;
    }

    // Ticket replies
    if (type === "ticket_reply" && (data.ticket_id || payload?.ticket_id)) {
        const ticketId = String(data.ticket_id || payload?.ticket_id);
        router.push({
            pathname: "/(app)/(tabs)/support/[id]",
            params: {
                id: ticketId,
            },
        } as any);
        return;
    }

    // Push notifications - no navigation
    if (type === "push") {
        return;
    }

    // Legacy navigateTo property
    const navigateTo = data.navigateTo || payload?.navigateTo;
    if (!navigateTo) return;

    const params =
        data.navigateParams || payload?.navigateParams || {};

    switch (navigateTo) {
        case "ticket_detail":
            router.push({
                pathname: "/(app)/(tabs)/support",
                params,
            } as any);
            break;
        case "conversation_detail":
            if (params.conversationId) {
                router.push(
                    `/(app)/(tabs)/chat/${params.conversationId}` as any,
                );
            }
            break;
        default:
            break;
    }
}

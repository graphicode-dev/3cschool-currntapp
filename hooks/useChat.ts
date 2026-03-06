import { chatService } from "@/services/chats/chat.service";
import { ChatMessage } from "@/services/chats/chat.types";
import { nanoid } from "nanoid/non-secure";
import { useCallback, useEffect, useState } from "react";

export const useChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);

    const loadMessages = useCallback(async () => {
        setLoading(true);
        const data = await chatService.getMessages();
        setMessages(data.reverse()); // inverted list
        setLoading(false);
    }, []);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    const sendMessage = useCallback((text: string, replyTo?: ChatMessage) => {
        if (!text.trim()) return;

        const newMessage: ChatMessage = {
            id: nanoid(),
            text,
            sender: "me",
            createdAt: new Date().toISOString(),
            replyTo,
        };

        setMessages((prev) => [newMessage, ...prev]);

        // 🔥 fake instructor reply
        setTimeout(() => {
            const reply: ChatMessage = {
                id: nanoid(),
                text: "Got it 👍",
                sender: "instructor",
                createdAt: new Date().toISOString(),
                avatar: "https://i.pravatar.cc/150?img=12",
            };

            setMessages((prev) => [reply, ...prev]);
        }, 1200);
    }, []);

    return {
        messages,
        loading,
        sendMessage,
        refetch: loadMessages,
    };
};

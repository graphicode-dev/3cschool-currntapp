import { ChatMessage } from "./chat.types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const chatService = {
    async getMessages(): Promise<ChatMessage[]> {
        await delay(500);

        return [
            {
                id: "1",
                text: "Hello 👋 How can I help you?",
                sender: "instructor",
                createdAt: new Date().toISOString(),
                avatar: "https://i.pravatar.cc/150?img=12",
            },
            {
                id: "2",
                text: "I have question about the last lecture.",
                sender: "me",
                createdAt: new Date().toISOString(),
            },
            {
                id: "3",
                text: "Sure! ask me anything.",
                sender: "instructor",
                createdAt: new Date().toISOString(),
                avatar: "https://i.pravatar.cc/150?img=12",
            },
        ];
    },
};

export type MessageSender = "me" | "instructor" | "user";

export interface ChatMessage {
    id: string;
    text: string;
    sender: MessageSender;
    createdAt: string;
    avatar?: string;
    senderName?: string;
    /** URL or local URI of an image attachment */
    imageUri?: string;
    replyTo?: ChatMessage;
}

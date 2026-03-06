export interface Speaker {
    id: number;
    name: string;
    email: string;
    codeNumber: string;
    phoneNumber: string;
    image: string;
    createdAt: string;
    updatedAt: string;
}
export interface SpeakerCreatePayload {
    name: string;
    email: string;
    code_number: string;
    phone_number: string;
    password: string;
    image: File;
}
export interface SpeakerUpdatePayload {
    name?: string;
    email?: string;
    code_number?: string;
    phone_number?: string;
    password?: string;
    image?: File;
}
export interface SpeakerMetadata {
    filters: {
        column: string;
        label: string;
        type: "text" | "number" | "date" | "select" | "boolean";
        operators: string[];
        searchable: boolean;
    }[];
    operators: Record<string, string>;
    fieldTypes: Record<
        "text" | "number" | "date" | "select" | "boolean",
        {
            operators: string[];
            inputType: string;
        }
    >;
}

export interface Banner {
    id: number;
    title: string;
    description: string;
    type: "image" | "video";
    media_url: string;
    thumbnail_url: string | null;
    link: string;
    order: number;
}

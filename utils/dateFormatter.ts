/**
 * Returns a human-readable timestamp for a message.
 *
 * Format:  "<time>  ·  <date>"
 *   time  →  "3:45 pm"
 *   date  →  "Today" | "Yesterday" | "dd/mm/yy"
 */
export function formatMessageTime(isoString: string, isMe: boolean): string {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    );
    const diffDays = Math.round(
        (today.getTime() - msgDay.getTime()) / (1000 * 60 * 60 * 24),
    );

    const time = date
        .toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })
        .toLowerCase();

    let label: string;
    if (diffDays === 0) {
        label = "Today";
    } else if (diffDays === 1) {
        label = "Yesterday";
    } else {
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yy = String(date.getFullYear()).slice(2);
        label = `${dd}/${mm}/${yy}`;
    }

    return isMe ? `${label}  ·  ${time}` : `${time}  ·  ${label}`;
}

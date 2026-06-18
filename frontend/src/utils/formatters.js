export function generateId() {
    return Math.random().toString(36).slice(2, 10);
}

export function formatTime(ts) {
    return new Date(ts).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(ts) {
    const d = new Date(ts);
    const today = new Date();
    const diff = (today - d) / 86400000;

    if (diff < 1) return "오늘";
    if (diff < 2) return "어제";
    if (diff < 7) return `${Math.floor(diff)}일 전`;

    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}
export const formatTime = (dateString: string): string => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours < 12 ? "오전" : "오후";
        const hour12 = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${period} ${hour12}:${formattedMinutes}`;
    } catch (e) {
        console.error("시간 형식 변환 오류:", e);
        return "";
    }
}; 
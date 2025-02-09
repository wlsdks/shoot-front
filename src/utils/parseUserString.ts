// utils/parseUserString.ts
export interface UserDTO {
    id: string;
    username: string;
    nickname: string;
    status: string;
    profileImageUrl?: string | null;
    userCode?: string;
}

/**
 * 백엔드에서 반환하는 문자열 예시:
 * "User(id=67a792495b13c8281a6cac24, username=test2, nickname=test2, status=OFFLINE, profileImageUrl=null, lastSeenAt=null, createdAt=2025-02-09T09:47:19.416263Z, updatedAt=null, friends=[], incomingFriendRequests=[], outgoingFriendRequests=[], userCode=)"
 *
 * 이 문자열에서 id, username, nickname, userCode 등을 추출합니다.
 */
export const parseUserString = (userString: string): UserDTO => {
    // 정규식 패턴을 이용하여 각 값을 추출합니다.
    const idMatch = userString.match(/id=([^,]+)/);
    const usernameMatch = userString.match(/username=([^,]+)/);
    const nicknameMatch = userString.match(/nickname=([^,]+)/);
    const statusMatch = userString.match(/status=([^,]+)/);
    const profileImageUrlMatch = userString.match(/profileImageUrl=([^,]+)/);
    const userCodeMatch = userString.match(/userCode=([^,)]+)/);

    return {
        id: idMatch ? idMatch[1].trim() : "",
        username: usernameMatch ? usernameMatch[1].trim() : "",
        nickname: nicknameMatch ? nicknameMatch[1].trim() : "",
        status: statusMatch ? statusMatch[1].trim() : "",
        profileImageUrl:
        profileImageUrlMatch && profileImageUrlMatch[1].trim() !== "null"
            ? profileImageUrlMatch[1].trim()
            : null,
        userCode:
        userCodeMatch && userCodeMatch[1].trim() !== ""
            ? userCodeMatch[1].trim()
            : undefined,
    };
};  
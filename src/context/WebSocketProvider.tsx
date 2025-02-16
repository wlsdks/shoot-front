// 이 코드는 전역 WebSocket 연결 제공자(WebSocketProvider) 입니다.
// 사용자가 로그인하면 이 Provider가 활성화되어 STOMP 기반의 WebSocket 연결을 생성하고, 사용자의 ID에 맞는 채널(예, /topic/chatrooms/{userId}/updates)을 구독하게 됩니다. 
// 이를 통해 앱의 어느 곳에서든 (예: 채팅방 목록, 알림 등) 실시간 업데이트를 받을 수 있도록 전역적으로 관리합니다.
import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "../context/AuthContext";

interface WebSocketProviderProps {
    children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [stompClient, setStompClient] = useState<Client | null>(null);

    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem("accessToken");
        const socket = new SockJS(`http://localhost:8100/ws/chat?token=${token}`);
        const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: (msg) => console.log("[STOMP]", msg),
        onConnect: () => {
            console.log("전역 WebSocket 연결됨");
            // 예시: 구독 추가
            client.subscribe(`/topic/chatrooms/${user.id}/updates`, (message) => {
            console.log("업데이트 이벤트:", message.body);
            });
        },
        });
        client.activate();
        setStompClient(client);

        return () => {
        client.deactivate();
        };
    }, [user]);

    return <>{children}</>;
};

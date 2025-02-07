// STOMP/SockJS 연결 관리 함수
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient: Client | null = null;

export const connectWebSocket = (onConnect: (client: Client) => void) => {
  const socket = new SockJS('http://localhost:8100/ws/chat'); // 백엔드 STOMP 엔드포인트

  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    debug: (msg) => console.log('[STOMP]', msg),
    onConnect: () => {
      console.log('WebSocket 연결 성공');
      onConnect(client);
    },
  });

  client.activate();
  stompClient = client;
  return client;
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};

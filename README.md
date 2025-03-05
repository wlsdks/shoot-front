# Shoot - 채팅 애플리케이션

Shoot은 React와 TypeScript로 개발된 실시간 채팅 애플리케이션입니다. 사용자 친구 추가, 실시간 메시지 전송, 채팅방 관리 등 다양한 소셜 기능을 제공합니다.

## 기능

- **사용자 인증**: 회원가입, 로그인, 로그아웃 기능
- **프로필 관리**: 사용자 프로필 및 이미지 업데이트
- **친구 관리**: 친구 추가, 친구 요청 수락/거절, 코드로 친구 찾기
- **실시간 채팅**: WebSocket을 통한 실시간 메시지 전송
- **채팅방 관리**: 채팅방 생성, 즐겨찾기 기능
- **알림 시스템**: 타이핑 인디케이터, 읽음 확인 기능
- **소셜 탭**: 추천 친구 및 친구 요청 관리

## 기술 스택

- **Frontend**:
  - React 18
  - TypeScript
  - React Router v7
  - Styled Components
  - SockJS & STOMP 클라이언트 (WebSocket)
  - Axios (HTTP 클라이언트)

- **상태 관리**:
  - Context API (인증, 사용자 상태)

- **기타 라이브러리**:
  - react-infinite-scroll-component
  - event-source-polyfill (SSE)
  - lodash

## 프로젝트 구조

```
src/
├── components/      # 공통 컴포넌트
├── context/         # Context API
├── pages/           # 페이지 컴포넌트
│   └── tabs/        # 탭 페이지 컴포넌트
├── services/        # API 요청 함수
├── utils/           # 유틸리티 함수
└── types/           # 타입 정의
```

## 시작하기

### 사전 요구사항

- Node.js 14.x 이상
- npm 또는 yarn
- 백엔드 서버 실행 (포트: 8100)

### 설치 방법

1. 저장소를 클론합니다:
```bash
git clone https://github.com/yourusername/shoot-front.git
cd shoot-front
```

2. 의존성을 설치합니다:
```bash
npm install
```

3. 개발 서버를 실행합니다:
```bash
npm start
```

4. 브라우저에서 `http://localhost:3000`으로 접속합니다.

## 빌드 및 배포

프로덕션 빌드를 생성하려면:
```bash
npm run build
```

## API 통신

이 프로젝트는 REST API와 WebSocket을 함께 사용합니다:

- REST API: `http://localhost:8100/api/v1`
- WebSocket: `http://localhost:8100/ws/chat`
- SSE(Server-Sent Events): `http://localhost:8100/api/v1/chatrooms/updates/{userId}`

## 주요 화면

- **로그인/회원가입**: 사용자 인증
- **친구 탭**: 친구 목록, 친구 검색, 코드로 친구 찾기
- **소셜 탭**: 친구 요청 관리, 추천 친구
- **채팅 탭**: 채팅방 목록, 즐겨찾기
- **채팅룸**: 실시간 메시지 전송, 타이핑 인디케이터
- **설정 탭**: 프로필 관리, 로그아웃

## 주의사항

- 개발 환경에서는 CORS 이슈를 방지하기 위해 백엔드 서버가 적절한 설정으로 실행되어야 합니다.
- 사용자 인증은 JWT 토큰 방식으로 구현되었습니다.
- 실시간 채팅은 STOMP 프로토콜을 사용합니다.
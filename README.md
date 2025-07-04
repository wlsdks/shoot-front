# Shoot Frontend

## 프로젝트 소개
Shoot는 실시간 채팅 애플리케이션입니다. 이 프로젝트는 Feature-Sliced Design (FSD) 아키텍처를 기반으로 구축되었습니다.

## 기술 스택
- React
- TypeScript
- FSD (Feature-Sliced Design) 아키텍처

## 프로젝트 구조

### 1. 아키텍처 개요
프로젝트는 Feature-Sliced Design 아키텍처를 따르며, 다음과 같은 레이어로 구성되어 있습니다:

```
src/
├── app/          # 전역 설정, 스타일, 프로바이더
├── pages/        # 라우팅과 페이지 레이아웃
├── widgets/      # 여러 features를 조합한 복합적인 UI 블록
├── features/     # 사용자 시나리오와 관련된 기능들
├── entities/     # 비즈니스 엔티티
└── shared/       # 공통으로 사용되는 유틸리티, UI 컴포넌트 등
```

### 2. 레이어별 설명

#### app/
- 전역 설정
- 스타일 설정
- 프로바이더 설정
- 라우팅 설정

#### pages/
- 라우팅과 페이지 레이아웃을 담당
- 각 페이지별 컴포넌트 구성

#### widgets/
- 여러 features를 조합한 복합적인 UI 블록
- 페이지의 주요 섹션을 구성하는 컴포넌트들

#### features/
- 사용자 시나리오와 관련된 기능들
- 주요 기능들:
  - auth: 인증 관련 기능
  - chat: 채팅 관련 기능
  - profile: 프로필 관련 기능
  - settings: 설정 관련 기능
  - social: 소셜 기능
  - navigation: 네비게이션 관련 기능
  - message-reaction: 메시지 반응 관련 기능
  - user-code: 사용자 코드 관련 기능

#### entities/
- 비즈니스 엔티티 정의
- 주요 엔티티들:
  - user: 사용자 정보
  - message: 메시지
  - chat-room: 채팅방
  - friend: 친구 관계

#### shared/
- 공통으로 사용되는 코드
- 구성:
  - api: API 관련 설정
  - assets: 정적 자원
  - lib: 외부 라이브러리 설정
  - styles: 스타일 관련 파일
  - types: 타입 정의
  - ui: 재사용 가능한 UI 컴포넌트
  - utils: 유틸리티 함수

### 3. 의존성 규칙 (리팩토링 완료)
- ✅ 상위 레이어는 하위 레이어에만 의존할 수 있습니다
- ✅ 같은 레이어 내에서는 서로 의존할 수 없습니다  
- ✅ 순환 의존성은 허용되지 않습니다
- ✅ Features 간 직접 참조 제거 완료
- ✅ Shared 레이어를 통한 공통 로직 관리

### 4. 모듈 구조
각 모듈은 다음과 같은 구조를 따릅니다:
```
module/
├── index.ts      # public API
├── model/        # 비즈니스 로직
├── ui/          # UI 컴포넌트
├── lib/         # 유틸리티 함수
└── types.ts     # 타입 정의
```

## 개발 가이드라인

### 1. 컴포넌트 작성
- 컴포넌트는 가능한 작고 재사용 가능하게 작성
- props는 명확하게 타입 정의
- 불필요한 리렌더링 방지

### 2. 상태 관리
- 전역 상태는 필요한 경우에만 사용
- 컴포넌트 내부 상태는 가능한 로컬로 관리

### 3. 스타일링
- 일관된 스타일 가이드 준수
- 재사용 가능한 스타일 컴포넌트 활용

### 4. 테스트
- 주요 비즈니스 로직에 대한 단위 테스트 작성
- 컴포넌트 테스트 작성

## 🚀 FSD 리팩토링 완료 사항

### ✅ 2차 리팩토링 완료 (2024-07-04)
1. **메시지 관리 Hooks Shared 이동**
   - `useMessageState`, `useMessageHandlers`, `useTypingState` 등 공통 hooks를 shared로 이동
   - `src/shared/lib/hooks/useMessageManagement.ts`로 통합
   - Features 간 메시지 관련 로직 중복 제거

2. **타입 정의 통합**
   - `TypingUser` 타입 shared로 이동하여 일관성 확보
   - 중복 타입 정의 제거 및 공통 타입 사용

3. **FSD 위반 사례 완전 해결**
   - `chat-room` → `message` feature 직접 참조 제거
   - `user-code` → `auth` feature 직접 참조 제거 (props 방식으로 변경)
   - 모든 features 간 직접 의존성 제거 완료

4. **중복 파일 정리**
   - Message feature의 중복 hooks 파일 삭제
   - 명확한 deprecation 가이드 제공
   - Public API 일관성 강화

### ✅ 1차 리팩토링 완료
1. **Features 간 직접 참조 제거**
   - `chat-room` → `auth`, `message-reaction`, `message` 직접 참조 제거
   - `profile` → `chat-room` 직접 참조 제거
   - Shared 레이어를 통한 접근으로 변경

2. **Shared 레이어 강화**
   - 공통 타입 정의 (`lib/types/common.ts`)
   - 메시지 리액션 서비스 (`lib/services/messageReactionService.ts`)
   - 컨텍스트 메뉴 훅 (`lib/hooks/useContextMenu.ts`)
   - Public API 통일 (`index.ts`)

3. **Public API 일관성 확보**
   - 각 feature의 `index.ts` 파일 정리
   - 명확한 export/import 구조 정립
   - TypeScript 타입 안정성 확보

4. **의존성 규칙 준수**
   - FSD 계층 구조 엄격 적용
   - 상위→하위 방향 의존성만 허용
   - 순환 의존성 완전 제거

### 🎯 주요 개선점
- **유지보수성 향상**: Features 간 결합도 낮춤, 공통 로직 Shared 레이어 관리
- **재사용성 증대**: 메시지 관리 hooks 재사용 가능
- **확장성 개선**: 새로운 feature 추가 시 영향도 최소화
- **타입 안정성**: TypeScript 엄격 모드 준수
- **개발자 경험**: 명확한 import 가이드 및 deprecation 안내
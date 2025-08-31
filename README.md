# 📘 Resume Reviewer Service

AI 기반 **레쥬메 리뷰 서비스**

## 프로젝트 개요

### 문제 설정
-취업준비생의 스펙/이력서에 대한 자신의 객관적 평가 부족
-IT 비전공자의 업계 정보 및 피드백 접근성 낮음

### 해결 방안
-AI 기반 이력서 및 자소서 리뷰 및 피드백 제공
-대학생 및 취준생이 역량과 이력서를 객관적으로 진단 가능한 플랫폼 구축

---

## 주요 기능

-AI 기반 이력서 자동 분석 및 항목별 상세 피드백 제공
-PDF 이력서 업로드를 통한 자동 텍스트 변환 및 분석

---

## Tech Stack

| 구분 | 기술 |
| :--- | :--- |
| **Back-end** | `Node.js`, `Express`, `MongoDB` |
| **Front-end** | `React`, `React-Thunk` |
| **Language** | `Typescript`, `Tailwind CSS` |
| **API** | `Gemini`, `Azure` |
| **DevOps** | `Heroku`, `Netlify` |
---

## 프로젝트 실행 방법

### 저장소 복제
git clone https://github.com/yangjihun/DreamMap-be.git

### 의존성 설치
npm install

### 환경 변수 설정
프로젝트 루트에 .env 파일을 생성하고  환경 변수 섹션을 참고하여 값을 입력

###개발 서버 실행
npm run dev

---

## API 엔드포인트
| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| **POST** | `/auth/signup` | 회원가입 |
| **POST** | `/auth/login` | 로그인 |
| **GET** | `/user/me` | 내 정보 조회 |
| **POST** | `/resume/new` | PDF 이력서 업로드로 새 이력서 생성 |
| **POST** | `/resume/new/sections` | 섹션별 텍스트 입력으로 새 이력서 생성 |
| **GET** | `/resume/all` | 사용자의 모든 이력서 목록 조회 |
| **GET** | `/resume/:id` | 특정 이력서 정보 조회 |
| **PATCH** | `/resume/:id` | 특정 이력서 수정 |
| **DELETE** | `/resume/:id` | 특정 이력서 삭제 |
| **PUT** | `/resume/:id/star` | 이력서 즐겨찾기(별표) 토글 |
| **DELETE** | `/resume/:id/session/:sessionKey` | 이력서 내 특정 세션 삭제 |
| **POST** | `/gemini/review/:id` | 이력서 전체 리뷰 및 점수 생성 |
| **POST** | `/gemini/generate/:id` | AI 피드백을 바탕으로 이력서 내용 수정 |
| **POST** | `/roadmap/:id` | 로드맵 생성 |
| **GET** | `/roadmap/:id` | 로드맵 조회 |
| **PUT** | `/roadmap/:resumeId/resource/:resourceId/state` | 로드맵 리소스의 완료 상태 토글 |

---

## 협업 방식

### 프로젝트 관리: Notion을 사용하여 회의록 작성, 칸반(Kanban) 보드를 이용한 전체 작업 현황 및 개인별 이슈 관리를 진행

### 버전 관리: Git을 활용하여 소스 코드를 관리

---

## 📂 프로젝트 구조
```
/src
  /config        # 환경 설정 (env, logger, DB 등)
  /controllers   # 요청/응답 처리 (라우트 핸들러)
  /dto           # 데이터 전송 객체 (Data Transfer Objects)
  /middlewares   # 미들웨어 (auth, validate 등)
  /models        # DB 스키마 & 타입
  /repos         # DB 접근 (Mongoose, Prisma 등)
  /routes        # 라우트 정의 (Express/Fastify 라우팅)
  /services      # 비즈니스 로직 (도메인 처리)
  /tests         # 테스트 코드
  /utils         # 공통 유틸
  app.ts         # 서버 엔트리: Express 초기화 · 공통 미들웨어 등록 · 라우트 마운트 · 에러핸들러 · DB 연결/리스닝
 ``` 
  
---

## 📝 커밋 컨벤션
**Conventional Commits** 규칙 준수

- `feat:` 새 기능
- `fix:` 버그 수정
- `docs:` 문서 변경
- `style:` 코드 포매팅, 세미콜론
- `refactor:` 코드 리팩토링
- `perf:` 성능 개선
- `test:` 테스트 관련
- `chore:` 빌드/배포/패키지
- `ci:` CI 설정
- `revert:` 이전 커밋 되돌리기

**메시지 형식**
```
type(scope): subject

body
footer
```
예: `feat(auth): add JWT refresh flow`

---

## 🌱 Git 브랜치 네이밍 컨벤션 (요약)

- **feature/** → 새로운 기능
    
    예) `feature/login-page`
    
- **fix/** → 버그 수정
    
    예) `fix/cart-error`
    
- **hotfix/** → 긴급 수정
    
    예) `hotfix/payment-crash`
    
- **refactor/** → 리팩토링
    
    예) `refactor/user-service`
    
- **docs/** → 문서 작업
    
    예) `docs/update-readme`

---

## ⚙️ 개발 가이드라인

### TypeScript/Node.js
- 입력 DTO는 `zod` 스키마 검증
- 레이어 분리: `routes → services → repos → models`
- 절대 경로 사용


### AI API (Gemini)
- 모델: `gemini-2.5-flash` (기본)

### 프롬프트 관리 
- **현재 방식**: `aiPromptMessage.ts` 파일 내에서 타입스크립트의 장점을 활용하여 프롬프트를 함수 형태로 동적 관리
- **개선 방향**: 추후 버전 관리 및 비개발자와의 협업을 위해 프롬프트를 `.md` 파일로 분리하는 시스템 도입을 고려 중

---

## 🚀 배포 & 성능

### 배포 환경
- **Production**: `master` → 배포(Heroku, Netlify  등 활용)
- **Staging**: `develop` : 회의 때 로컬 환경에서 Product Owner의 주도 하에 기능 점검
- **Feature Environment**: 기능 브랜치(feat/*)별로 PR 리뷰 및 기능 테스트를 진행

### 추후 개선 사항
-현재는 별도의 서버 없이 로컬 환경에서 기능 점검을 진행하고 있으나, 
 추후 develop 브랜치를 배포하는 독립된 Staging 서버를 구축할 예정



## 🔧 환경 변수
```
PORT=5000
NODE_ENV=development
LOCAL_DB_ADDRESS=...
MONGODB_URI_PROD=...
JWT_SECRET_KEY=...
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=...
AZURE_DOCUMENT_INTELLIGENCE_KEY=...
GEMINI_API_KEY=...
```



## 🤝 Git Workflow
- 브랜치 전략:  
  - `master` (Production)  
  - `develop` (Staging)  
  - `feat/*`, `fix/*`, `chore/*`  
- 머지: dev 머지 시 빠른 작업을 위해, 개인 기능 확인 후 충돌 안나면 머지, 
  머지 후 푸시 전에 디스코드에 알리기, 푸시 완료 후 알리기

### 향후 개선 방향 (기능 확장 시 적용 고려):

작업 흐름: 
1. develop 브랜치에서 feat/기능이름 브랜치를 생성하여 작업을 시작
2. 기능 개발 완료 후, develop 브랜치로 **Pull Request (PR)**를 생성
3. 최소 1명 이상의 팀원에게 코드 리뷰를 받고, 승인(Approve)을 받기
4. 리뷰가 완료되고 CI 파이프라인을 통과하면 develop 브랜치에 병합(Merge)
5. 병합 후 디스코드를 통해 팀원에게 상황을 공유

## CI 파이프라인 (GitHub Actions 요약)
### 추후 개선 사항 
-develop 브랜치에 Pull Request가 생성되거나 업데이트될 때마다 아래 작업이 자동으로 실행
-Lint & Format Check: 코드 스타일이 일관적인지 검사
-Unit & Integration Test: 주요 기능들이 정상적으로 동작하는지 테스트
-Build: 프로젝트가 성공적으로 빌드되는지 확인
-모든 검사를 통과해야만 develop 브랜치에 코드를 병합할 수 있음

## 📌 참고
- [Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/)


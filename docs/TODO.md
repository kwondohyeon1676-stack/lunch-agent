# TODO

본 문서는 PRD 요구사항을 바탕으로 P0~P3 우선순위에 따라 정리된 개발 체크리스트입니다.

## P0: 프론트엔드 구현 + LocalStorage/Mock 데이터 (UX 완성)
**목표**: 백엔드 없이도 사용자가 전체 흐름을 경험할 수 있는 UI/UX 완성

- [✅] **프로젝트 초기 세팅**
  - Acceptance: Next.js 16 + Tailwind CSS 설치 및 `pnpm dev` 실행 확인
  - Notes: Toss-like 디자인 시스템(폰트, 컬러) 적용, `lucide-react` 아이콘 설치

- [✅] **온보딩(Onboarding) Flow UI**
  - Acceptance: 건물 선택 -> 동행인 -> 상황 -> 기분 선택 단계별 UI 전환 구현
  - Notes: `Step` 상태 관리, 선택 즉시 다음 단계로 넘어가는 부드러운 전환

- [✅] **가짜 로딩(Fake Loading) UX**
  - Acceptance: 추천 버튼 클릭 시 2~3초간 로딩 스피너 및 롤링 멘트 표시
  - Notes: 선택값(팀장, 해장 등)에 따른 동적 문구(`getLoadingMessages`) 구현 완료

- [✅] **결과 카드 컴포넌트**
  - Acceptance: 식당 이름, 태그, 설명, 지도 버튼이 포함된 결과 카드 퍼블리싱
  - Notes: Gradient 배경, 깔끔한 타이포그래피 적용

- [✅] **맛집 제보 모달 (UI)**
  - Acceptance: 제보 버튼 클릭 시 모달 오픈, 텍스트 입력 UI 구현
  - Notes: `vaul` 또는 `Dialog` 컴포넌트 사용

- [✅] **후원하기 버튼 (UI)**
  - Acceptance: 메인 하단에 500원 후원 버튼 배치 및 클릭 인터랙션
  - Notes: 현재는 `toast` 알림으로 Mocking 처리됨
- [ ] **실시간 채팅 UI (Mock)**
  - Acceptance: 식당 상세/결과 화면에 채팅창 UI 퍼블리싱 (기능 없음)
  - Notes: 유튜브 라이브 채팅 스타일, 스크롤링 메시지 영역

## 에러 해결
- [✅] 나만의 맛집 제보하기를 눌렀을때 팝업이 뜨긴하는데 색이 없어서 그런지 바닥화면이랑 겹쳐서 보여서 가독성이 안좋음. 
- [✅] 나만의 맛집 제보하기 호출팝업에 작성란 구분이 있어야할거같아 위치, 식당명, 한줄평 이런 식으로.. 한줄평은 맛이어떻고 어느게 좋은지 등등을 예시로 적어주고 ㅇㅇ
- [✅] 온보딩 마지막 단계 '어떤 기분이신가요?'보다는 답안들에 맞게 문장구성이 달라야할거같은데 

## P0.5: UX/UI 폴리싱 (Visual Upgrade)
**목표**: '테크 회사' 수준의 세련된 사용자 경험 제공

- [✅] **Hero Section 동적 타이틀**
  - Acceptance: 선택한 상황(페르소나)에 따라 "팀장님 만족 100%" 등 맞춤형 멘트 표시
  - Notes: `getDynamicTitle(selection)` 함수 구현

- [✅] **결과 카드 디자인 전면 개편**
  - Acceptance: 아이콘(🍱, 📍, 💰) 적용, 지도 버튼 내재화, 3D 아이콘 Header 추가
  - Notes: `Lucide` 아이콘 활용, 카테고리별 Placeholder 매핑

- [✅] **결과 카드 예약/웨이팅 정보 추가**
  - Acceptance: '캐치테이블', '현장대기' 등 예약 정보 표시
  - Notes: DB 및 Mock 데이터에 `waiting_info` 컬럼 추가

- [✅] **라이브 채팅 UI 통합**
  - Acceptance: 추천 카드 하단에 '부착된' 형태(아코디언/티켓)로 디자인 수정
  - Notes: `red dot` 애니메이션 수정 (단일 Ripple 효과)

- [✅] **버튼 네이밍 명확화**
  - Acceptance: '다시 하기' -> '처음부터 다시', '다른 곳 추천' -> '다른 식당은?' 변경

## P1: 아키텍처 리팩토링 (Architecture Refactoring) - [NEW]
**목표**: 확장성과 유지보수성을 고려한 견고한 코드베이스 구축

- [✅] **Step 1: 타입 및 상수 분리 (Shared Domain)**
  - Acceptance: `features/recommendation/types.ts`, `constants.ts` 생성 및 적용
  - Notes: 중복 타입 제거 및 매직 넘버 상수화

- [✅] **Step 2: Service Layer 구현**
  - Acceptance: `lib/services/recommendation.service.ts` 생성
  - Notes: API Route 로직 이동 및 테스트 용이성 확보

- [✅] **Step 3: Funnel Pattern 도입**
  - Acceptance: `use-recommendation-funnel.ts` 훅 구현
  - Notes: `page.tsx`의 상태 관리 로직 분리

- [✅] **Step 4: UI 컴포넌트 분리**
  - Acceptance: `features/recommendation/components/` 하위에 단계별 컴포넌트 생성
  - Notes: `QuestionCard`, `ResultView` 등

## P1.5: Supabase (DB, Auth, API) 연결 및 데이터 연동
**목표**: 실제 데이터를 저장/조회하고 AI 로직을 심어 서비스 기능 작동

- [x] **Supabase 프로젝트 연동**
  - [x] Acceptance: `lib/supabase` 유틸리티 및 `middleware.ts` 구현 완료
  - [x] Acceptance: `restaurants` 테이블 생성 및 Seed 데이터 주입
  - Notes: 스키마(id, name, location_type, category, tags, status, etc.)

- [x] **Type-Safe Database 구축**
  - [x] Acceptance: `supabase gen types`로 DB 스키마 -> TypeScript 타입 자동 변환
  - [x] Notes: `database.types.ts` 생성 및 전역 타입 적용

- [x] **DB 관리 체계화 (Migration)**
  - [x] Acceptance: `supabase/migrations` 폴더 생성 및 초기 스키마 SQL 파일 관리
  - [x] Notes: `config.toml` 설정 확인

- [x] **초기 데이터(Seed Data) 확보**
  - [x] Acceptance: 여의도 주요 맛집 5곳 이상 DB Insert 완료
  - [x] Notes: `seed.sql` 파일로 관리

- [x] **AI 추천 Server Action 구현 (API Logic 전면 교체)**
  - [x] Acceptance: 기존 `app/api/recommend/route.ts` -> Server Action (`actions/recommend.ts`)으로 리팩토링
  - [x] Notes: Cloudflare Workers 등 Edge 호환성 고려, Client Component에서 직접 호출

- [x] **맛집 제보 Server Action 구현**
  - [x] Acceptance: `actions/report.ts` 구현 (GPT JSON 변환 -> DB Insert)
  - [x] Notes: 익명 제보, Zod 스키마 검증 추가

- [ ] **보안 및 에러 핸들링 (기본)**
  - Acceptance: 결과 없음(Null) 시 에러 UI 표시, In-Memory Rate Limiting
  - Notes: `middleware.ts` 적용 완료 (1분 5회)

## P2: 추천 로직 고도화 및 운영 도구
**목표**: 서비스 품질 향상 및 운영 효율화

- [ ] **중복 추천 방지 로직**
  - Acceptance: '다시 하기' 또는 '다른 곳 추천' 시 직전 추천 식당 제외
  - Notes: `excludeIds` 파라미터 또는 Session Storage 활용

- [ ] **관리자(Admin) 대시보드**
  - Acceptance: `pending` 상태인 제보 데이터를 조회하고 `approved`로 변경 가능한 페이지
  - Notes: 간단한 Auth(로그인) 기능 필요

- [ ] **결제 모듈 실연동**
  - Acceptance: Toss Payments 실제 결제창 호출 및 승인 프로세스
  - Notes: `NEXT_PUBLIC_TOSS_CLIENT_KEY` 발급 필요, 백엔드 승인 로직 추가

- [ ] **필터 로직 정교화**
  - Acceptance: '5분 컷' vs '10분 산책' 등 거리 데이터 정확도 개선
  - Notes: DB 데이터 보강 필요

## P2.5: 실시간 공유 (Live Community)
**목표**: 식당별 실시간 채팅으로 웨이팅/메뉴 현황 공유

- [ ] **채팅 DB 설계 및 Realtime 설정**
  - Acceptance: `chat_messages` 테이블 생성 (restaurant_id, user_nickname, content, created_at)
  - Notes: RLS 설정 (Insert: Anyone, Select: Anyone), 24시간 TTL 정책 수립

- [ ] **실시간 채팅 UI 구현**
  - Acceptance: 결과 페이지 하단에 채팅창 오버레이 또는 삽입
  - Notes: 닉네임 자동 생성(예: '익명의 김대리'), 낙관적 업데이트(Optimistic UI)

- [ ] **메시지 전송 및 구독 로직**
  - Acceptance: 메시지 입력 시 즉시 반영되고, 다른 유저의 메시지도 실시간 수신
  - Notes: `supabase.channel` 구독 구현

## P3: 부가기능 (최적화, 배포 자동화)
**목표**: 프로덕션 레벨의 완성도 확보

- [ ] **배포 (Deployment)**
  - Acceptance: Vercel 배포 및 도메인 연결
  - Notes: 환경변수 설정 점검

- [ ] **Rate Limiting 고도화**
  - Acceptance: Redis(Upstash) 연동으로 서버 재시작 후에도 제한 유지
  - Notes: 현재 In-Memory 방식 한계 극복

- [ ] **SEO & Metadata**
  - Acceptance: Open Graph 이미지, Title, Description 최적화
  - Notes: 카톡/슬랙 공유 시 썸네일 노출

- [ ] **성능 최적화**
  - Acceptance: Lighthouse 점수 90점 이상, 이미지 최적화
  - Notes: 폰트 경량화, 번들 사이즈 점검

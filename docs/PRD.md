🛠️ 통합 개발 지시서 (Master PRD)
프로젝트명: 여의도 미식회 (TP타워 생존기) 목표: Next.js와 Supabase를 사용하여 'AI 기반 점심 메뉴 추천 및 제보 서비스' 구축.

1. 기술 스택 (Tech Stack)
Framework: Next.js 16 (App Router)
Styling: Tailwind CSS (Toss-like Design System)
Backend/DB: Supabase (PostgreSQL)
AI: OpenAI API (GPT-4o mini)
Payment: Toss Payments (Widget - Test Mode)
Deployment: Vercel
2. 데이터베이스 설계 (Supabase Schema)
AI에게 아래 SQL을 실행하거나 테이블을 생성하라고 지시합니다.

Table Name: restaurants

컬럼명	타입	설명
id	uuid	Primary Key (Default: uuid_generate_v4())
created_at	timestamptz	생성일자 (Default: now())
name	text	식당 이름
description	text	AI가 작성한 한 줄 추천사
location_type	text	필터용 (indoor, near, walk, taxi)
category	text	음식 종류 (korean, japanese, chinese, western, etc)
tags	text[]	태그 배열 (예: ['해장', '법카', '팀장님'])
waiting_info	text	예약/웨이팅 정보 (예: '캐치테이블 원격줄서기', '현장 대기만 가능')
status	text	승인 상태 (approved, pending, rejected) - Default: pending
raw_input	text	(제보 시) 사용자가 입력한 원본 텍스트
Security (RLS Policies):

Select: Enable for Public (조건: status = 'approved')
Insert: Enable for Public (누구나 제보 가능)
Update/Delete: Only for Authenticated Users (Admin)
3. 화면 및 기능 명세 (UI/UX Specifications)
디자인 컨셉:

배경: #F2F4F6 (연회색), 카드: White (rounded-2xl, shadow-sm)
메인 컬러: #3182F6 (Toss Blue)
폰트: Pretendard (또는 sans-serif 시스템 폰트), 굵고 시원한 타이포그래피.
페이지별 로직:

Onboarding (Home):
TP타워(활성), IFC/파크원(비활성/토스트 메시지) 버튼 배치.
Steps (Question 1~3):
Q1: 누구랑? (혼밥, 동료, 팀장, 임원, 썸)
Q2: 거리는? (비옴/실내, 5분컷, 10분산책, 택시)
Q3: 스타일은? (해장, 법카, 다이어트, 맛집)
UX: 선택 시 즉시 다음 단계로 부드럽게 전환.
Loading (AI Reasoning):
3초 강제 딜레이 적용.
스피너와 함께 문구 롤링: "부장님 동선 파악 중...", "웨이팅 눈치게임 계산 중...", "법카 잔액 조회 중..."
Result (Card):
Hybrid Logic:
(1) DB에서 location_type이 일치하는 식당을 1차 필터링.
(2) 필터링 된 리스트 + 유저 선택값(동행인/기분)을 OpenAI API로 전송.
(3) GPT가 가장 적절한 1곳 선정 + "블랙 코미디 풍의 추천 사유" 생성하여 출력.

UX Improvements:
- **Dynamic Title:** "추천 완료" 대신 상황별 맞춤 멘트 (예: "팀장님 100% 만족 코스 👔")
- **Card Design:** 텍스트 나열 대신 아이콘(🍱, 📍, 💰) 활용하여 가독성 강화.
- **Map Button:** 카드 내부로 통합하여 응집도 향상.
- **Visual:** 식당 카테고리별 3D 아이콘/일러스트 Placeholder 적용.
- **Live Chat Integration:** 카드 하단에 '티켓' 형태로 붙여서 일체감 제공.

Action:
[지도 보기]: 카드 내 아이콘 버튼으로 통합.
[처음부터 다시]: 온보딩 리셋.
[이 조건으로 다른 곳]: 결과만 재추천.
Report Modal (제보):
위치, 식당명, 한줄평 입력창 -> OpenAI API (JSON 변환) -> Supabase Insert (status: pending).
개인정보: 수집하지 않음 (익명).
Payment (Donation):
Toss Payments 위젯 연동 (믹스커피 500원 결제).
Fallback: 사업자가 없어 실제 결제가 안 될 경우를 대비해, 실패 시 "토스 송금 링크" 버튼이 대안으로 뜨도록 구현.

운영 정보: 
'여의도 미식회는 K증권 권또가 운영합니다.' 문구 및 '© 2025 Kwondo' 카피라이트 적용.
4. [복사/붙여넣기용] Vibe Coding 마스터 프롬프트
아래 내용을 그대로 복사해서 코딩 툴에 입력하세요.

Copy당신은 시니어 풀스택 개발자입니다. Next.js(App Router), Supabase, OpenAI API를 사용하여 '여의도 직장인 점심 추천 웹앱'을 만들어주세요.

## 1. 디자인 스타일 (Design System)
- '토스(Toss)' 앱 스타일을 철저히 따릅니다. (Minimalism, Big Typography, #3182F6 Blue Color)
- 모바일 뷰에 최적화된 반응형 웹이어야 합니다.
- 부드러운 페이지 전환 애니메이션을 넣어주세요.

## 2. 데이터베이스 (Supabase)
- `restaurants` 테이블을 생성하는 SQL을 작성하거나 로직을 구현하세요.
- 컬럼: id, name, description, location_type(indoor/near/walk/taxi), tags(array), status(approved/pending/rejected).
- RLS 정책: 'approved' 상태인 데이터만 public read 가능, insert는 누구나 가능.
- **초기 데이터(Seed):** 여의도 맛집 가상의 데이터 5개를 SQL로 만들어주세요.

## 3. 핵심 기능 구현 (Feature Logic)
### A. 하이브리드 추천 시스템 (Hybrid Recommendation)
1. **Client Filter:** 유저가 선택한 거리(location_type)에 맞지 않는 식당은 Supabase 쿼리 단계에서 제외하세요.
2. **AI Agent (Server Action):** 필터링된 식당 리스트와 유저의 선택(동행인, 기분)을 GPT-4o mini에게 보냅니다.
   - **System Prompt:** "너는 여의도 직장 생활 만렙인 '김대리'야. 주어진 식당 리스트 중에서 현재 상황(동행인, 날씨)에 가장 적합한 **단 한 곳**을 골라. 그리고 추천 이유를 유머러스하고 약간의 블랙 코미디를 섞은 '존댓말 한 줄'로 작성해서 JSON으로 반환해. (팀장님과 가면 맛보다 웨이팅 없는 게 중요하고, 비 오면 무조건 실내가 최고야.)"
3. **Loading UX:** API 응답을 기다리는 동안(최소 2.5초 유지) "부장님 기분 스캔 중..." 같은 멘트가 롤링되는 로딩 화면을 보여주세요.

### B. 맛집 제보 (UGC with AI)
1. 유저가 위치/식당명/한줄평을 입력하면, GPT-4o mini를 통해 `{name, tags, location_type, description}` JSON 포맷으로 변환하세요.
2. 변환된 데이터를 Supabase에 `status='pending'`으로 저장하세요. (익명 저장)

### C. 지도 및 결제
1. **지도:** 별도 API 없이 `https://m.map.naver.com/search2/search.naver?query={식당이름}` 으로 새 탭 열기.
2. **후원:** 토스 페이먼츠 위젯(Test Mode)을 연동하여 믹스커피 500원 결제 버튼을 만드세요.

### D. 실시간 공유 (Live Community)
1. **Real-time Chat:** 추천된 식당 페이지 하단(또는 별도 탭)에 실시간 채팅 기능을 제공하세요.
   - Supabase Realtime을 활용하여 별도 새로고침 없이 메시지가 올라오도록 구현.
   - "지금 웨이팅 10팀임", "재료 소진됨 ㄷㄷ" 등 실시간 정보 공유.
2. **Anonymous Nickname System:** 
   - 사용자가 채팅방 입장 시 여의도 직장인 컨셉의 닉네임 자동 부여 (예: '법카쓰는 과장님', '퇴사 꿈나무').
   - 별도의 가입이나 설정 없이 즉시 참여 가능한 UX 제공.
   - 세션 유지 동안 동일 닉네임 사용 (LocalStorage 활용).
3. **Ephemeral Data:** 점심시간 특화 기능이므로 메시지는 작성 후 24시간 뒤 자동 삭제되거나 보이지 않게 처리하세요. (TTL)
4. **UI Concept:** 아프리카TV/유튜브 라이브 채팅처럼 하단에서 위로 올라오는 오버레이 형태 또는 깔끔한 리스트 형태.

## 4. 안전장치 (Safety)
- **Rate Limiting:** OpenAI API 비용 방어를 위해, 동일 IP에서의 추천 요청은 '1분당 5회'로 제한하는 미들웨어를 추가하세요.
- **Error Handling:** 추천할 식당이 없거나 API 오류 시, "오늘은 편의점이 답입니다..."라는 유머러스한 에러 메시지를 보여주세요.

이 명세를 바탕으로 프로젝트 구조를 잡고, 주요 컴포넌트와 API 코드를 작성해주세요.
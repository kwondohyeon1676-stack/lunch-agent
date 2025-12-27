export const MIN_LOADING_TIME_MS = 2000
export const LOADING_MESSAGE_INTERVAL_MS = 800

export const LOADING_MESSAGES = {
    common: [
        "최단 경로 계산 중...",
        "오늘의 날씨 고려 중...",
        "데이터베이스 조회 중...",
    ],
    companion: {
        manager: ["팀장님 심기 파악 중...", "웨이팅 없는 곳 우선 검색...", "빠른 서빙 가능 여부 확인..."],
        executive: ["법인카드 한도 조회 중...", "조용한 룸 스캔 중...", "의전 프로토콜 가동..."],
        date: ["분위기 점수 계산 중...", "센스 있는 메뉴 선정 중...", "조명 밝기 시뮬레이션..."],
        colleague: ["법카 말고 내돈내산 가성비 계산...", "신상 맛집 탐색 중..."],
    },
    mood: {
        hangover: ["콩나물 수급 확인 중...", "생존을 위한 국물패턴 분석...", "사장님 속풀이 긴급 지원..."],
        expensive: ["가장 비싼 메뉴 정렬 중...", "랍스타/참치 재고 확인...", "영수증 길이 예측 중..."],
        diet: ["칼로리 계산기 가동...", "풀때기 신선도 체크...", "마요네즈 제외 옵션 확인..."],
    },
    situation: {
        indoor: ["비 안 맞는 지하 통로 탐색...", "우산 없이 가는 길 계산..."],
    },
}

export const AI_SYSTEM_PROMPT = `너는 여의도 TP타워 10년차 김대리야. 직장 생활의 고충을 200% 이해하고, 눈치 빠른 추천을 해줘.

동행인별 포인트:
- 혼밥: 눈치 안 봐도 되는 곳, 빠른 회전
- 동기: 솔직한 평가, 가성비 중요
- 팀장님: 웨이팅 절대 안 됨, 무난한 선택
- 임원: 조용한 룸, 격식 있는 분위기, 가격 신경 쓰지 말 것
- 소개팅: 분위기 최우선, 대화하기 좋은 곳

응답 규칙:
1. 주어진 후보 중 가장 적합한 식당 1곳 선택
2. comment: 직장인 공감형 블랙 유머 한 줄 (존댓말, 20자 이내)
3. reasons: 왜 이 식당인지 구체적 이유 2-3개 (배열)

반드시 JSON으로만 응답: 
{ 
  "restaurantId": "uuid-string", 
  "comment": "팀장님 눈치 보면서 먹기 딱 좋습니다.", 
  "reasons": ["웨이팅 없음", "10분 내 서빙", "무난한 가격대"]
}`

export const COMPANION_LABELS: Record<string, string> = {
    solo: "혼밥",
    colleague: "편한 동기",
    manager: "어색한 팀장님",
    executive: "격식 있는 임원",
    date: "잘 보여야 하는 썸",
}

export const SITUATION_LABELS: Record<string, string> = {
    indoor: "비 오는 날 (건물 내만)",
    quick: "5분 컷 (빠르게)",
    walk: "10분 산책 가능",
    taxi: "택시 타고 멀리 갈 수 있음",
}

export const MOOD_LABELS: Record<string, string> = {
    hangover: "해장 필요",
    expensive: "법카 찬스 (비싼 곳)",
    diet: "다이어트 중",
    delicious: "그냥 맛있는 거",
}

export const BUILDING_OPTIONS = [
    { label: "TP타워", value: "tp-tower", available: true },
    { label: "IFC몰", value: "ifc", available: false },
    { label: "파크원", value: "park-one", available: false },
]

export const COMPANION_OPTIONS = [
    { label: "혼밥", value: "solo", icon: "🙋" },
    { label: "동기 (편함)", value: "colleague", icon: "👥" },
    { label: "팀장님 (어색)", value: "manager", icon: "👔" },
    { label: "임원 (격식)", value: "executive", icon: "💼" },
    { label: "썸 (잘보여야 함)", value: "date", icon: "💝" },
]

export const SITUATION_OPTIONS = [
    { label: "비와요 (건물 내)", value: "indoor", icon: "🌧️" },
    { label: "5분 컷 (귀찮아)", value: "quick", icon: "⚡" },
    { label: "10분 산책 가능", value: "walk", icon: "🚶" },
    { label: "택시 타고 멀리", value: "taxi", icon: "🚕" },
]

export const MOOD_OPTIONS = [
    { label: "살려줘 (해장)", value: "hangover", icon: "🤢" },
    { label: "법카 찬스 (비싼거)", value: "expensive", icon: "💳" },
    { label: "다이어트", value: "diet", icon: "🥗" },
    { label: "그냥 맛있는 거", value: "delicious", icon: "😋" },
]

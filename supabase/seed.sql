-- Seed Data (5 essential Yeouido restaurants)

insert into restaurants (name, location_type, category, tags, description, waiting_info, status)
values
  (
    '오복수산',
    'indoor',
    '일식',
    ARRAY['카이센동', '깔끔', '데이트'],
    '신선한 해산물이 듬뿍, 점심부터 호강하는 맛',
    '캐치테이블 원격줄서기',
    'approved'
  ),
  (
    '진주집',
    'walk',
    '한식',
    ARRAY['콩국수', '웨이팅', '여의도명물'],
    '여의도 직장인들의 소울푸드, 줄 서도 먹어야 함',
    '현장 대기만 가능 (회전율 빠름)',
    'approved'
  ),
  (
    '세상의모든아침',
    'indoor',
    '양식',
    ARRAY['뷰맛집', '브런치', '법카'],
    '50층 뷰와 함께 즐기는 우아한 브런치',
    '네이버 예약 권장',
    'approved'
  ),
  (
    '동해도',
    'near',
    '일식',
    ARRAY['회전초밥', '가성비', '무한리필'],
    '접시 쌓는 재미가 있는 회전초밥',
    '테이블링 원격줄서기',
    'approved'
  ),
  (
    '바스버거',
    'near',
    '양식',
    ARRAY['수제버거', '맥주무한', '자유분방'],
    '감자칩 무한리필에 힙한 수제버거 맛집',
    '배달/포장 가능, 현장 대기',
    'approved'
  );

-- 기존 테이블 삭제 후 PRD 스키마에 맞게 재생성
DROP TABLE IF EXISTS restaurants;

CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location_type TEXT NOT NULL, -- indoor, near, walk, taxi
  category TEXT NOT NULL,
  price_range TEXT NOT NULL, -- low, mid, high
  tags TEXT[] NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRD에서 제공한 초기 데이터 삽입
INSERT INTO restaurants (name, location_type, category, price_range, tags, description) VALUES
('오복수산 TP타워점', 'indoor', '일식', 'high', ARRAY['깔끔', '임원', '룸', '조용함'], '카이센동의 근본. 실패 없는 맛이지만 가격대가 있어 법카 찬스나 임원 식사때 추천.'),
('농민백암순대', 'walk', '한식', 'mid', ARRAY['해장', '웨이팅지옥', '동기', '노포감성'], '여의도 국밥 1티어. 하지만 웨이팅이 극악이라 팀장님과 가면 혼남. 편한 동기나 후임과 먼저 뛰어가서 먹을 것.'),
('써브웨이 TP타워점', 'indoor', '양식', 'low', ARRAY['빠름', '혼밥', '다이어트', '간단'], '5분 컷으로 먹기 좋고 칼로리도 조절 가능. 혼밥족이나 바쁠 때 최고.'),
('스시효 여의도점', 'near', '일식', 'high', ARRAY['고급', '임원', '법카', '접대'], '법카 찬스로 제대로 된 오마카세를 경험하고 싶을 때. 임원님들과 가기 좋음.'),
('원할머니보쌈 여의도점', 'walk', '한식', 'mid', ARRAY['팀장님', '무난', '회식', '넉넉함'], '팀장님과 가도 실패 없는 무난한 선택. 술 한잔 하기도 좋음.'),
('샐러디 여의도점', 'near', '샐러드', 'mid', ARRAY['다이어트', '혼밥', '깔끔', '건강'], '다이어트 중이거나 건강 챙길 때. 혼자 가기에도 부담 없음.'),
('맥도날드 여의도점', 'near', '패스트푸드', 'low', ARRAY['빠름', '혼밥', '동기', '간단'], '진짜 시간 없을 때의 최후의 보루. 5분 컷 가능.'),
('더파이브 뷔페', 'taxi', '뷔페', 'high', ARRAY['법카', '임원', '썸', '호화'], '법카 찬스로 제대로 보여줄 때. 썸녀와 가도 좋음.'),
('육회한상 여의도점', 'walk', '한식', 'high', ARRAY['썸', '특별', '분위기', '고급'], '썸타는 상대와 가기 좋은 분위기 있는 곳. 가격대는 있지만 값어치함.'),
('이태리부대찌개', 'walk', '한식', 'low', ARRAY['해장', '동기', '푸짐', '저렴'], '해장에 최고. 가격도 착하고 양도 많아 동기들과 가기 좋음.');

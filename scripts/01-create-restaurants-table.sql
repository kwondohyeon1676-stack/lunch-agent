-- 레스토랑 테이블 생성
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  cuisine_type TEXT NOT NULL,
  meal_time TEXT NOT NULL,
  dining_style TEXT NOT NULL,
  price_range TEXT NOT NULL,
  walking_time INTEGER NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  description TEXT,
  address TEXT,
  phone TEXT,
  image_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 샘플 데이터 삽입
INSERT INTO restaurants (name, category, cuisine_type, meal_time, dining_style, price_range, walking_time, rating, description, address, tags) VALUES
('김치찌개&제육볶음', '한식', '한식', '점심', '혼밥', '₩', 5, 4.5, '혼자 먹기 좋은 가성비 최고 한식당. 김치찌개와 제육볶음이 인기 메뉴입니다.', '여의도동 34-7', ARRAY['가성비', '혼밥추천', '빠른식사']),
('스시 야마토', '일식', '일식', '점심', '혼밥', '₩₩', 7, 4.7, '신선한 스시와 초밥을 제공하는 일식당. 런치 세트가 인기입니다.', '여의도동 23-15', ARRAY['신선한재료', '런치세트', '깔끔한맛']),
('차이나팩토리', '중식', '중식', '저녁', '모임', '₩₩', 10, 4.3, '단체 모임에 좋은 중식당. 탕수육과 짜장면이 맛있습니다.', '여의도동 45-2', ARRAY['단체석', '모임추천', '푸짐한양']),
('이탈리안 키친', '양식', '양식', '저녁', '모임', '₩₩₩', 12, 4.6, '로맨틱한 분위기의 이탈리안 레스토랑. 파스타와 피자가 일품입니다.', '여의도동 56-8', ARRAY['데이트', '분위기좋음', '와인']),
('한우마을', '한식', '한식', '저녁', '모임', '₩₩₩', 8, 4.8, '최고급 한우를 제공하는 고깃집. 회식이나 특별한 날에 추천합니다.', '여의도동 67-3', ARRAY['고급', '회식', '한우']),
('라멘 하우스', '일식', '일식', '점심', '혼밥', '₩', 6, 4.4, '진한 국물의 라멘 전문점. 돈코츠 라멘이 시그니처 메뉴입니다.', '여의도동 12-9', ARRAY['라멘', '든든한', '빠른식사']),
('비스트로 더블유', '양식', '양식', '점심', '혼밥', '₩₩', 9, 4.5, '가벼운 브런치와 샌드위치를 즐길 수 있는 비스트로입니다.', '여의도동 89-4', ARRAY['브런치', '샌드위치', '커피']),
('마라탕 천국', '중식', '중식', '점심', '혼밥', '₩', 4, 4.2, '얼얼한 마라탕이 일품인 중식당. 재료를 직접 골라 만들 수 있습니다.', '여의도동 34-11', ARRAY['마라탕', '매운맛', '커스텀']),
('한정식 궁', '한식', '한식', '점심', '모임', '₩₩₩', 15, 4.9, '정갈한 한정식을 제공하는 고급 식당. 접대 장소로 완벽합니다.', '여의도동 78-5', ARRAY['한정식', '접대', '고급스러움']),
('타코벨 익스프레스', '양식', '양식', '점심', '혼밥', '₩', 3, 4.1, '빠르고 간편한 타코와 부리또를 즐길 수 있습니다.', '여의도동 23-7', ARRAY['타코', '빠른식사', '간편식']);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_meal_time ON restaurants(meal_time);
CREATE INDEX IF NOT EXISTS idx_restaurants_dining_style ON restaurants(dining_style);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating DESC);

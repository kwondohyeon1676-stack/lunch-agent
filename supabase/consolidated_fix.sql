-- 1. 컬럼 추가 (이미 있으면 무시됨)
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 1;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS price_range TEXT DEFAULT 'mid';

-- 2. 기존 RLS 정책 삭제 (중복 방지 - 기존 이름 및 새 이름 모두 삭제)
DROP POLICY IF EXISTS "Enable read access for approved restaurants" ON restaurants;
DROP POLICY IF EXISTS "Enable read access for all restaurants" ON restaurants;
DROP POLICY IF EXISTS "Enable insert for everyone" ON restaurants;
DROP POLICY IF EXISTS "Enable update for everyone" ON restaurants;
DROP POLICY IF EXISTS "Enable delete for admin" ON restaurants;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON restaurants;
-- 새 이름들도 삭제 (재실행 시 오류 방지)
DROP POLICY IF EXISTS "Enable read access for all" ON restaurants;
DROP POLICY IF EXISTS "Enable insert for all" ON restaurants;
DROP POLICY IF EXISTS "Enable update for all" ON restaurants;
DROP POLICY IF EXISTS "Enable delete for all" ON restaurants;

-- 3. 새로운 RLS 정책 설정
-- 모든 사용자(anon 포함)가 모든 식당 조률 조회 가능 (관리자 페이지 및 중복 체크용)
CREATE POLICY "Enable read access for all" 
ON restaurants FOR SELECT 
USING (true);

-- 모든 사용자(anon 포함)가 제보 가능
CREATE POLICY "Enable insert for all" 
ON restaurants FOR INSERT 
WITH CHECK (true);

-- 모든 사용자(anon 포함)가 기존 제보 업데이트 가능 (중복 제보 시 카운트 증가용)
CREATE POLICY "Enable update for all" 
ON restaurants FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 모든 사용자(anon 포함)가 삭제 가능 (관리자용 - 보안이 중요하면 auth.role() = 'authenticated'로 변경 권장)
CREATE POLICY "Enable delete for all" 
ON restaurants FOR DELETE 
USING (true);

-- 4. 기존 데이터 보정
UPDATE restaurants SET report_count = 1 WHERE report_count IS NULL;
UPDATE restaurants SET status = 'approved' WHERE status IS NULL;

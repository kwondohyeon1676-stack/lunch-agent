-- Add price_range column for "가격대" display
alter table restaurants add column if not exists price_range text;

-- Update existing data with reasonable defaults
update restaurants set price_range = 'mid' where price_range is null and name = '오복수산';
update restaurants set price_range = 'low' where price_range is null and name = '진주집';
update restaurants set price_range = 'high' where price_range is null and name = '세상의모든아침';
update restaurants set price_range = 'mid' where price_range is null and name = '동해도';
update restaurants set price_range = 'low' where price_range is null and name = '바스버거';

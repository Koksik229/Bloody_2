-- Добавляем новые колонки для очков характеристик
ALTER TABLE users ADD COLUMN available_attribute_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN available_skill_points INTEGER DEFAULT 0;

-- Обновляем существующих пользователей, давая им начальные очки
UPDATE users 
SET available_attribute_points = 5,  -- 5 очков за первый уровень
    available_skill_points = 2       -- 2 очка за первый уровень
WHERE level = 1; 
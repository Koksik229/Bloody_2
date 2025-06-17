-- Добавляем поле chat_color в таблицу races
ALTER TABLE races ADD COLUMN chat_color VARCHAR DEFAULT '#4CAF50';

-- Обновляем цвет для существующей расы Человек
UPDATE races SET chat_color = '#4CAF50' WHERE name = 'Человек'; 
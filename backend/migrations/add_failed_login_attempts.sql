-- Добавляем столбец failed_login_attempts в таблицу users
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0; 
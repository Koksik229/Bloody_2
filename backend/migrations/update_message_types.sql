-- Создаем временную таблицу с новыми значениями
CREATE TABLE temp_chat_messages (
    id INTEGER PRIMARY KEY,
    sender_id INTEGER,
    receiver_id INTEGER,
    message_type TEXT,
    content TEXT,
    created_at DATETIME,
    is_read BOOLEAN,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- Копируем данные с преобразованием типов
INSERT INTO temp_chat_messages
SELECT 
    id,
    sender_id,
    receiver_id,
    CASE 
        WHEN message_type = 'global' THEN 'GLOBAL'
        WHEN message_type = 'private' THEN 'PRIVATE'
        WHEN message_type = 'direct' THEN 'DIRECT'
        ELSE 'GLOBAL'
    END as message_type,
    content,
    created_at,
    is_read
FROM chat_messages;

-- Удаляем старую таблицу
DROP TABLE chat_messages;

-- Переименовываем временную таблицу
ALTER TABLE temp_chat_messages RENAME TO chat_messages;

-- Создаем индексы
CREATE INDEX ix_chat_messages_id ON chat_messages(id);
CREATE INDEX ix_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX ix_chat_messages_receiver_id ON chat_messages(receiver_id); 
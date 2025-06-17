-- Удаляем старую таблицу
DROP TABLE IF EXISTS chat_messages;

-- Создаем новую таблицу с правильными значениями enum
CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY,
    sender_id INTEGER,
    receiver_id INTEGER,
    message_type TEXT CHECK(message_type IN ('GLOBAL', 'PRIVATE', 'DIRECT')),
    content TEXT,
    created_at DATETIME,
    is_read BOOLEAN DEFAULT false,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- Создаем индексы
CREATE INDEX ix_chat_messages_id ON chat_messages(id);
CREATE INDEX ix_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX ix_chat_messages_receiver_id ON chat_messages(receiver_id); 
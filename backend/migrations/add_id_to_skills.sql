-- Создаём новую таблицу skills_new с id
CREATE TABLE skills_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    strength INTEGER DEFAULT 0,
    agility INTEGER DEFAULT 0,
    power INTEGER DEFAULT 0,
    parry INTEGER DEFAULT 0,
    weapon_skill INTEGER DEFAULT 0,
    shield_block INTEGER DEFAULT 0,
    intuition INTEGER DEFAULT 0,
    available_attribute_points INTEGER DEFAULT 0,
    available_attribute_points_special INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Копируем данные из skills в skills_new
INSERT INTO skills_new (user_id, strength, agility, power, parry, weapon_skill, shield_block, intuition, available_attribute_points, available_attribute_points_special)
SELECT user_id, strength, agility, power, parry, weapon_skill, shield_block, intuition, available_attribute_points, available_attribute_points_special
FROM skills;

-- Переименовываем таблицы
ALTER TABLE skills RENAME TO skills_old;
ALTER TABLE skills_new RENAME TO skills; 
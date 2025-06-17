-- Добавляем базовую расу Человек
INSERT INTO races (name, description, base_strength, base_agility, base_power, base_intuition, base_weapon_skill, base_parry, base_shield_block)
VALUES ('Человек', 'Стандартная раса', 10, 10, 10, 10, 5, 5, 5);

-- Добавляем базовые значения здоровья и маны для расы Человек
INSERT INTO race_level_stats (race_id, level, hp_gain, mp_gain) VALUES 
(1, 1, 30, 10),
(1, 2, 40, 15),
(1, 3, 50, 20);

-- Обновляем навыки существующих пользователей
UPDATE skills 
SET strength = 10,
    agility = 10,
    power = 10,
    intuition = 10,
    weapon_skill = 5,
    parry = 5,
    shield_block = 5
WHERE user_id IN (SELECT id FROM users WHERE race_id = 1); 
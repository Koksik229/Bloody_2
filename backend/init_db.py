from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from db import SessionLocal, engine, Base
from models.race import Race, RaceLevelStat
from models.location import Location, LocationLink
from models.level import LevelProgression
from models.user import User

def init_db():
    # Создаем таблицы
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Проверяем, есть ли уже расы в базе
        if db.query(Race).first() is None:
            # Создаем базовые расы
            races = [
                Race(
                    id=1,
                    name="Человек",
                    description="Сбалансированная раса, подходящая для начинающих.",
                    base_strength=10,
                    base_agility=10,
                    base_power=10,
                    base_intuition=10,
                    base_weapon_skill=10,
                    base_parry=10,
                    base_shield_block=10
                )
            ]
            db.add_all(races)
            
            # Создаем базовые характеристики для рас
            race_stats = [
                RaceLevelStat(race_id=1, level=1, health=100, mana=50),
                RaceLevelStat(race_id=1, level=2, health=120, mana=60),
                RaceLevelStat(race_id=1, level=3, health=140, mana=70),
                RaceLevelStat(race_id=1, level=4, health=160, mana=80),
                RaceLevelStat(race_id=1, level=5, health=180, mana=90),
                RaceLevelStat(race_id=1, level=6, health=200, mana=100),
                RaceLevelStat(race_id=1, level=7, health=220, mana=110),
                RaceLevelStat(race_id=1, level=8, health=240, mana=120),
                RaceLevelStat(race_id=1, level=9, health=260, mana=130),
                RaceLevelStat(race_id=1, level=10, health=280, mana=140)
            ]
            db.add_all(race_stats)
            
        # Проверяем, есть ли уже локации в базе
        if db.query(Location).first() is None:
            # Создаем базовые локации
            locations = [
                Location(
                    id=1,
                    name="Дом",
                    description="Ваш уютный стартовый дом.",
                    background="house.png",
                    location_type="safe",
                    label="Безопасная зона",
                    is_safe=True,
                    has_enemies=False
                ),
                Location(
                    id=3,
                    name="Арена",
                    description="Место для сражений.",
                    background="arena.png",
                    location_type="combat",
                    label="Боевая зона",
                    is_safe=False,
                    has_enemies=True
                ),
                Location(
                    id=4,
                    name="Лес",
                    description="Опасный тёмный лес.",
                    background="forest.png",
                    location_type="dungeon",
                    label="Подземелье",
                    is_safe=False,
                    has_enemies=True
                ),
                Location(
                    id=5,
                    name="Лавка Гендальфа",
                    description="Магическая лавка старого волшебника.",
                    background="gandalf_shop.png",
                    location_type="shop",
                    label="Магазин",
                    is_safe=True,
                    has_enemies=False
                ),
                Location(
                    id=15,
                    name="Тёмная улица",
                    description="Узкий переулок, где таится опасность.",
                    background="dark_alley.png",
                    location_type="combat",
                    label="Боевая зона",
                    is_safe=False,
                    has_enemies=True
                ),
                Location(
                    id=16,
                    name="Площадь шахтёров",
                    description="Место сбора шахтёров перед походом в шахты.",
                    background="miners_square.png",
                    location_type="safe",
                    label="Безопасная зона",
                    is_safe=True,
                    has_enemies=False
                )
            ]
            db.add_all(locations)
            
            # Создаем связи между локациями
            links = [
                LocationLink(from_id=1, to_id=3),  # Дом -> Арена
                LocationLink(from_id=3, to_id=1),  # Арена -> Дом
                LocationLink(from_id=1, to_id=4),  # Дом -> Лес
                LocationLink(from_id=4, to_id=1),  # Лес -> Дом
                LocationLink(from_id=1, to_id=5),  # Дом -> Лавка Гендальфа
                LocationLink(from_id=5, to_id=1),  # Лавка Гендальфа -> Дом
                LocationLink(from_id=3, to_id=15), # Арена -> Тёмная улица
                LocationLink(from_id=15, to_id=3), # Тёмная улица -> Арена
                LocationLink(from_id=4, to_id=16), # Лес -> Площадь шахтёров
                LocationLink(from_id=16, to_id=4)  # Площадь шахтёров -> Лес
            ]
            db.add_all(links)
            
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    init_db()

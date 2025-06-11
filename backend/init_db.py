from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

Base = declarative_base()
engine = create_engine("sqlite:///db.sqlite3")
SessionLocal = sessionmaker(bind=engine)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    email = Column(String)
    nickname = Column(String, unique=True, index=True)
    race_id = Column(Integer)
    location_id = Column(Integer)
    level = Column(Integer, default=1)
    experience = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    last_seen = Column(DateTime)
    is_active = Column(Boolean, default=True)
    failed_login_attempts = Column(Integer, default=0)

class LoginLog(Base):
    __tablename__ = "login_logs"
    id = Column(Integer, primary_key=True)
    username = Column(String)
    success = Column(Boolean)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Race(Base):
    __tablename__ = "races"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(Text)

class RaceLevelStat(Base):
    __tablename__ = "race_level_stats"
    id = Column(Integer, primary_key=True)
    race_id = Column(Integer)
    level = Column(Integer)
    hp = Column(Integer)
    mp = Column(Integer)
    strength = Column(Integer)
    agility = Column(Integer)
    power = Column(Integer)

class LocationType(Base):
    __tablename__ = "location_types"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    label = Column(String)
    is_safe = Column(Boolean)
    has_enemies = Column(Boolean)

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(Text)
    background = Column(String)
    type_id = Column(Integer)

class LocationLink(Base):
    __tablename__ = "location_links"
    id = Column(Integer, primary_key=True)
    from_id = Column(Integer)
    to_id = Column(Integer)
    is_locked = Column(Boolean, default=False)

Base.metadata.create_all(bind=engine)
db = SessionLocal()

db.add(Race(id=1, name="Человек", description="Обычная раса без бонусов."))
db.add_all([
    RaceLevelStat(race_id=1, level=1, hp=30, mp=10, strength=5, agility=5, power=5),
    RaceLevelStat(race_id=1, level=2, hp=35, mp=12, strength=6, agility=6, power=6),
])
db.add_all([
    LocationType(id=1, name="home", label="Дом", is_safe=True, has_enemies=False),
    LocationType(id=2, name="shop", label="Магазин", is_safe=True, has_enemies=False),
    LocationType(id=3, name="arena", label="Арена", is_safe=False, has_enemies=True),
    LocationType(id=4, name="forest", label="Лес", is_safe=False, has_enemies=True),
])
db.add_all([
    Location(id=1, name="Дом", description="Ваш уютный стартовый дом.", background="house.png", type_id=1),
    Location(id=2, name="Магазин", description="Здесь можно купить вещи.", background="shop.png", type_id=2),
    Location(id=3, name="Арена", description="Место для сражений.", background="arena.png", type_id=3),
    Location(id=4, name="Лес", description="Опасный тёмный лес.", background="forest.png", type_id=4),
])
db.add_all([
    LocationLink(from_id=1, to_id=2),
    LocationLink(from_id=2, to_id=1),
    LocationLink(from_id=1, to_id=4),
    LocationLink(from_id=4, to_id=1),
    LocationLink(from_id=2, to_id=3),
    LocationLink(from_id=3, to_id=2),
])
db.commit()
db.close()

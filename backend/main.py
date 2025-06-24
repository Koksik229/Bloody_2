from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging


# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)

from config import SECRET_KEY
from db import engine, Base
from models.user import User
from models.chat import ChatMessage
from models.location import Location, LocationLink, LocationType
from models.race import Race
from models.skills import Skill
from routes import auth, profile, chat, users, location, inventory, shop
import routes.wallet as wallet

load_dotenv()

app = FastAPI()

# Поддержка и localhost, и production-домена
origins = [
    "http://localhost:5173",
    "https://bloody-2.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Создаем таблицы
Base.metadata.create_all(bind=engine)

# ---- Инициализация справочников и триггеров ----
from sqlalchemy import text

with engine.begin() as conn:
    # валюты
    conn.execute(text("""
        INSERT OR IGNORE INTO currencies (id, code, name_ru, base_copper) VALUES
           (1,'COPPER','Медь',1),
           (2,'SILVER','Серебро',10),
           (3,'GOLD','Золото',1000),
           (4,'TESSER','Тессера',0);
    """))
    # триггер на отрицательный баланс
    conn.execute(text("""
        CREATE TRIGGER IF NOT EXISTS trg_wallet_no_negative
        BEFORE UPDATE ON user_wallets
        FOR EACH ROW
        WHEN NEW.amount < 0
        BEGIN
          SELECT RAISE(ABORT, 'negative balance forbidden');
        END;
    """))


# 🔄 Подключение тех же роутеров с глобальным префиксом /api/v1 для будущей миграции
for r, kw in [
    (auth.router, {"tags":["auth"]}),
    (profile.router, {"tags":["profile"]}),
    (chat.router, {"tags":["chat"]}),
    (users.router, {"prefix":"/users", "tags":["users"]}),
    (location.router, {}),
    (inventory.router, {"tags":["inventory"]}),
    (shop.router, {"tags":["shop"]}),
    (wallet.router, {"tags":["wallet"]}),
]:
    app.include_router(r, prefix="/api/v1" + kw.pop("prefix", ""), **kw)

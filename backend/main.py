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
from routes import auth, profile, chat, users, location, inventory

load_dotenv()

app = FastAPI()

# 🌐 Поддержка и localhost, и production-домена
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

# ✅ Подключение роутеров без префикса (legacy)
app.include_router(auth.router, tags=["auth"])
app.include_router(profile.router, tags=["profile"])
app.include_router(chat.router, tags=["chat"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(location.router)
app.include_router(inventory.router, tags=["inventory"])

# 🔄 Подключение тех же роутеров с глобальным префиксом /api/v1 для будущей миграции
for r, kw in [
    (auth.router, {"tags":["auth"]}),
    (profile.router, {"tags":["profile"]}),
    (chat.router, {"tags":["chat"]}),
    (users.router, {"prefix":"/users", "tags":["users"]}),
    (location.router, {}),
    (inventory.router, {"tags":["inventory"]}),
]:
    app.include_router(r, prefix="/api/v1" + kw.pop("prefix", ""), **kw)

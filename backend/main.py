from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from config import SECRET_KEY
from routes.auth import router as auth_router
from routes.profile import router as profile_router
from routes.location import router as location_router

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

app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    max_age=900,             # 15 минут
    same_site="none",        # 👈 обязательно для Render
    https_only=True          # 👈 обязательно для cookie по HTTPS
)

# ✅ Подключение роутеров
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(location_router)

from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from routes.auth import router as auth_router
from routes.profile import router as profile_router
from config import SECRET_KEY
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# Поддержка и localhost, и Render-домена
origins = [
    "http://localhost:5173",
    "https://bloody-2-front.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,                      # ✅ конкретные разрешённые домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY, max_age=900)

app.include_router(auth_router)
app.include_router(profile_router)

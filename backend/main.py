from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from routes.auth import router as auth_router
from routes.profile import router as profile_router
from config import SECRET_KEY
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

origins = os.getenv("BACKEND_CORS_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY, max_age=900)

app.include_router(auth_router)
app.include_router(profile_router)

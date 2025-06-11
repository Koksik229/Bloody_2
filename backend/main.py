from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from routes.auth import router as auth_router
from routes.profile import router as profile_router
from config import SECRET_KEY
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:5173",
    "https://bloody-2-front.onrender.com"
]

# 👇 Логирование Origin + принудительная установка заголовков CORS
@app.middleware("http")
async def add_cors_headers(request, call_next):
    response = await call_next(request)
    origin = request.headers.get("origin")
    print(">>> ORIGIN:", origin)  # Лог в Render

    if origin in origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"

    return response

# CORS Middleware (дублируем для preflight-OPTIONS)
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

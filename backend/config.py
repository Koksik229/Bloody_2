import os

# Основные параметры приложения
APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
APP_PORT = int(os.getenv("APP_PORT", 8000))
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# Секретный ключ для сессий
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise Exception("Missing SECRET_KEY environment variable")

# Время жизни сессии (в секундах)
SESSION_MAX_AGE = 900  # 15 минут (по умолчанию)

class Settings:
    SECRET_KEY: str = SECRET_KEY
    DEBUG: bool = DEBUG
    HOST: str = APP_HOST
    PORT: int = APP_PORT
    SESSION_MAX_AGE: int = SESSION_MAX_AGE
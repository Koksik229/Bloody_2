@echo off
@chcp 65001 >nul
cd /d D:\Bloody\backend

REM --- Устанавливаем переменные окружения ---
set SECRET_KEY=ultra-secret-session-key
set APP_PORT=8000

REM --- Активируем виртуальное окружение (если есть) ---
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo [!] Виртуальное окружение не найдено. Запускаем без него.
)

echo Запускаем FastAPI сервер на порту %APP_PORT%...
uvicorn main:app --host 0.0.0.0 --port %APP_PORT%

pause

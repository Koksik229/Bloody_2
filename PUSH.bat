@echo off
chcp 1251 > nul
cd /d D:\Bloody

:: Получаем дату и время в МСК (UTC+3) из локального UTC+5
for /f %%i in ('powershell -command "(Get-Date).AddHours(-2).ToString('yyyy-MM-dd HH:mm:ss')"' ) do set dt=%%i

echo Dobavlyaem izmeneniya...
git add .

echo Commitim s datoy: %dt%
git commit -m "Avtopush: fixy i zavisimosti [%dt%]"

echo Otpravlyaem na GitHub...
git push origin master

echo Gotovo!
pause

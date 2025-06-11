@echo off
chcp 1251 > nul
cd /d D:\Bloody

echo Dobavlyaem izmeneniya...
git add .

echo Commitim...
git commit -m "Avtopush: fixy i zavisimosti"

echo Otpravlyaem na GitHub...
git push origin master

echo Gotovo!
pause

@echo off
chcp 1251 > nul
cd /d D:\Bloody

echo Добавляем изменения...
git add .

echo Коммитим...
git commit -m "Автопуш: фиксы и зависимости"

echo Отправляем на GitHub...
git push origin master

echo Готово!
pause

# Функция для просмотра данных из SQLite
function View-SqliteData {
    param (
        [string]$TableName,
        [string]$OrderBy = "id"
    )
    
    # Создаем временный файл
    $tempFile = "temp_${TableName}.txt"
    
    # Выполняем запрос и сохраняем результат
    sqlite3 db.sqlite3 "SELECT * FROM $TableName ORDER BY $OrderBy;" > $tempFile
    
    # Выводим результат
    Write-Host "`nСодержимое таблицы $TableName:`n"
    Get-Content $tempFile
    
    # Удаляем временный файл
    Remove-Item $tempFile
}

# Функция для просмотра структуры таблицы
function View-TableSchema {
    param (
        [string]$TableName
    )
    
    $tempFile = "temp_schema.txt"
    sqlite3 db.sqlite3 ".schema ${TableName}" > $tempFile
    Get-Content $tempFile
    Remove-Item $tempFile
}

# Просмотр данных из таблицы locations
Write-Host "`nСодержимое таблицы locations:"
sqlite3 db.sqlite3 "SELECT * FROM locations ORDER BY id;" > temp_locations.txt
Get-Content temp_locations.txt
Remove-Item temp_locations.txt

# Просмотр данных из таблицы location_links
Write-Host "`nСодержимое таблицы location_links:"
sqlite3 db.sqlite3 "SELECT * FROM location_links ORDER BY id;" > temp_links.txt
Get-Content temp_links.txt
Remove-Item temp_links.txt

# Просматриваем структуру таблицы users
Write-Host "Структура таблицы users:"
sqlite3 db.sqlite3 ".schema users" > temp_schema.txt
Get-Content temp_schema.txt
Remove-Item temp_schema.txt

# Примеры использования:
# View-SqliteData -TableName "locations"
# View-SqliteData -TableName "location_links"
# View-SqliteData -TableName "users" -OrderBy "username" 
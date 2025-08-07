# Скрипт сборки релизной версии Яндекс Музыка клиента
# с улучшенной диагностикой проблем

Write-Host "🎵 Сборка релизной версии Яндекс Музыка клиента..." -ForegroundColor Green

# Проверяем наличие Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js найден: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js не найден. Установите Node.js и попробуйте снова." -ForegroundColor Red
    exit 1
}

# Проверяем наличие npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm найден: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm не найден. Установите npm и попробуйте снова." -ForegroundColor Red
    exit 1
}

# Проверяем наличие Rust
try {
    $rustVersion = rustc --version
    Write-Host "✅ Rust найден: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Rust не найден. Установите Rust и попробуйте снова." -ForegroundColor Red
    exit 1
}

# Проверяем наличие Cargo
try {
    $cargoVersion = cargo --version
    Write-Host "✅ Cargo найден: $cargoVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Cargo не найден. Установите Cargo и попробуйте снова." -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Устанавливаем зависимости..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка установки зависимостей" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Зависимости установлены" -ForegroundColor Green

Write-Host "`n🔨 Собираем фронтенд..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка сборки фронтенда" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Фронтенд собран" -ForegroundColor Green

Write-Host "`n🚀 Собираем Tauri приложение..." -ForegroundColor Yellow
cargo tauri build --release

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка сборки Tauri приложения" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Tauri приложение собрано" -ForegroundColor Green

Write-Host "`n📁 Проверяем созданные файлы..." -ForegroundColor Yellow

# Проверяем наличие собранного приложения
$appPath = "src-tauri/target/release/yandex-music-client.exe"
if (Test-Path $appPath) {
    $fileSize = (Get-Item $appPath).Length / 1MB
    Write-Host "✅ Приложение создано: $appPath (${fileSize:F2} MB)" -ForegroundColor Green
} else {
    Write-Host "❌ Приложение не найдено" -ForegroundColor Red
}

# Проверяем наличие установщика
$installerPath = "src-tauri/target/release/bundle/msi/yandex-music-client_0.1.0_x64_en-US.msi"
if (Test-Path $installerPath) {
    $fileSize = (Get-Item $installerPath).Length / 1MB
    Write-Host "✅ Установщик создан: $installerPath (${fileSize:F2} MB)" -ForegroundColor Green
} else {
    Write-Host "⚠️ Установщик не найден (возможно, не настроен)" -ForegroundColor Yellow
}

Write-Host "`n🎉 Сборка завершена успешно!" -ForegroundColor Green
Write-Host "📋 Диагностическая информация:" -ForegroundColor Cyan
Write-Host "   - Приложение: src-tauri/target/release/yandex-music-client.exe" -ForegroundColor White
Write-Host "   - Установщик: src-tauri/target/release/bundle/msi/" -ForegroundColor White
Write-Host "   - Логи: src-tauri/target/release/" -ForegroundColor White

Write-Host "`n💡 Советы по тестированию:" -ForegroundColor Cyan
Write-Host "   1. Запустите приложение и проверьте загрузку Яндекс Музыки" -ForegroundColor White
Write-Host "   2. Если появляется кнопка 'Попробовать снова', проверьте:" -ForegroundColor White
Write-Host "      - Подключение к интернету" -ForegroundColor White
Write-Host "      - Настройки антивируса/файрвола" -ForegroundColor White
Write-Host "      - Права доступа приложения" -ForegroundColor White
Write-Host "   3. Проверьте консоль браузера (F12) для диагностических сообщений" -ForegroundColor White

Write-Host "`n🔧 Для запуска в режиме разработки используйте: npm run tauri dev" -ForegroundColor Yellow

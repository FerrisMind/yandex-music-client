# Скрипт для сборки Tauri приложения
# Автоматически копирует исполняемый файл в правильное место

Write-Host "Starting Tauri application build..." -ForegroundColor Green

# Очищаем предыдущую сборку
Write-Host "Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "src-tauri/target") {
    Remove-Item "src-tauri/target" -Recurse -Force
}

# Собираем frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build

# Собираем Rust приложение
Write-Host "Building Rust application..." -ForegroundColor Yellow
cd src-tauri
cargo build --release
cd ..

# Копируем исполняемый файл в правильное место
Write-Host "Copying executable file..." -ForegroundColor Yellow
$sourcePath = "src-tauri/target/x86_64-pc-windows-msvc/release/yandex-music-client.exe"
$targetPath = "src-tauri/target/release/yandex-music-client.exe"

if (Test-Path $sourcePath) {
    # Создаем папку если её нет
    $targetDir = Split-Path $targetPath -Parent
    if (!(Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force
    }
    
    Copy-Item $sourcePath $targetPath -Force
    Write-Host "Executable file copied: $targetPath" -ForegroundColor Green
} else {
    Write-Host "Error: File not found: $sourcePath" -ForegroundColor Red
    exit 1
}

# Проверяем размер файла
$fileSize = (Get-Item $targetPath).Length
$fileSizeMB = [math]::Round($fileSize / 1MB, 2)
Write-Host "Executable file size: $fileSizeMB MB" -ForegroundColor Cyan

Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "Application path: $targetPath" -ForegroundColor Cyan

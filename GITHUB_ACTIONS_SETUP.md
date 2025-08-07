# Настройка GitHub Actions для Yandex Music Client

## 📋 Обзор

Этот документ описывает полную настройку GitHub Actions для автоматизации разработки, тестирования и релиза приложения Yandex Music Client.

## 🚀 Быстрый старт

### 1. Активация Actions

1. Перейдите в раздел **Settings** вашего репозитория
2. Выберите **Actions** → **General**
3. Включите **Actions** для репозитория
4. Настройте разрешения для Actions

### 2. Настройка Secrets (опционально)

Если планируете использовать уведомления или внешние сервисы:

```bash
# В Settings → Secrets and variables → Actions добавьте:
SLACK_WEBHOOK_URL=your_slack_webhook_url
DISCORD_WEBHOOK_URL=your_discord_webhook_url
DEPLOY_TOKEN=your_deploy_token
```

### 3. Настройка защиты веток

1. Перейдите в **Settings** → **Branches**
2. Добавьте правила для веток `main` и `develop`
3. Включите required status checks для всех workflow

## 📁 Структура файлов

```
.github/
├── workflows/
│   ├── build.yml              # Сборка для всех платформ
│   ├── release.yml            # Создание релизов
│   ├── test.yml              # Тестирование
│   ├── security.yml          # Проверка безопасности
│   ├── dependency-update.yml # Обновление зависимостей
│   ├── version-bump.yml      # Автообновление версии
│   ├── changelog.yml         # Генерация changelog
│   ├── deploy.yml            # Развертывание
│   ├── auto-release.yml      # Авторелиз
│   ├── dependabot.yml        # Автомерж Dependabot
│   ├── prerelease.yml        # Pre-release версии
│   ├── notifications.yml     # Уведомления
│   ├── cleanup.yml           # Очистка
│   ├── backup.yml            # Резервное копирование
│   └── monitoring.yml        # Мониторинг
├── ISSUE_TEMPLATE/
│   ├── bug_report.md         # Шаблон баг-репорта
│   └── feature_request.md    # Шаблон запроса функции
├── dependabot.yml            # Конфигурация Dependabot
├── branch-protection.yml     # Настройки защиты веток
├── pull_request_template.md  # Шаблон PR
└── README.md                 # Документация Actions
```

## 🔧 Workflows

### Основные Workflows

| Workflow | Триггер | Описание |
|----------|---------|----------|
| `build.yml` | Push/PR | Сборка для всех платформ |
| `release.yml` | Tags | Создание релизов |
| `test.yml` | Push/PR | Тестирование и линтинг |
| `security.yml` | Push/PR/Schedule | Проверка безопасности |

### Автоматизация

| Workflow | Триггер | Описание |
|----------|---------|----------|
| `dependency-update.yml` | Schedule | Автообновление зависимостей |
| `version-bump.yml` | Push | Автообновление версии |
| `changelog.yml` | Tags | Генерация changelog |
| `auto-release.yml` | Push | Автосоздание релизов |

### Мониторинг и обслуживание

| Workflow | Триггер | Описание |
|----------|---------|----------|
| `notifications.yml` | Workflow completion | Уведомления |
| `cleanup.yml` | Schedule | Очистка старых данных |
| `backup.yml` | Schedule | Резервное копирование |
| `monitoring.yml` | Schedule | Мониторинг состояния |

## 🎯 Использование

### Создание релиза

```bash
# 1. Создайте тег
git tag v1.0.0
git push origin v1.0.0

# 2. Actions автоматически:
# - Соберут приложение для всех платформ
# - Создадут GitHub Release
# - Сгенерируют changelog
# - Загрузят файлы
```

### Ручной запуск

1. Перейдите в **Actions** в GitHub
2. Выберите нужный workflow
3. Нажмите **Run workflow**
4. При необходимости укажите параметры

### Pre-release

```bash
# Для создания beta версии
git push origin develop

# Или вручную через Actions → Pre-release → Run workflow
```

## 🔒 Безопасность

### Настройка CodeQL

1. Перейдите в **Security** → **Code scanning**
2. Включите **CodeQL analysis**
3. Настройте автоматическое сканирование

### Настройка Dependabot

1. Перейдите в **Security** → **Dependabot alerts**
2. Включите alerts для npm и Cargo
3. Настройте автоматические PR

## 📊 Мониторинг

### Дашборд

- **Actions**: Статус всех workflow
- **Security**: Уязвимости и alerts
- **Insights**: Аналитика репозитория

### Отчеты

- Еженедельные отчеты о состоянии
- Автоматические уведомления
- Performance метрики

## 🛠️ Кастомизация

### Настройка уведомлений

Отредактируйте `notifications.yml`:

```yaml
# Добавьте webhook URL в secrets
SLACK_WEBHOOK_URL: your_webhook_url
DISCORD_WEBHOOK_URL: your_webhook_url
```

### Настройка развертывания

Отредактируйте `deploy.yml`:

```yaml
# Добавьте ваши серверы
DEPLOY_TOKEN: your_deploy_token
DEPLOY_SERVER: your_server_url
```

### Настройка расписания

Измените cron выражения в workflow файлах:

```yaml
schedule:
  - cron: '0 9 * * 1-5'  # Каждый рабочий день в 9:00
```

## 🚨 Troubleshooting

### Частые проблемы

1. **Build fails**
   - Проверьте версии зависимостей
   - Убедитесь в корректности конфигурации
   - Проверьте логи в Actions

2. **Release не создается**
   - Убедитесь, что тег создан правильно (`v*`)
   - Проверьте права доступа к репозиторию
   - Убедитесь, что все jobs завершились успешно

3. **Dependencies не обновляются**
   - Проверьте настройки Dependabot
   - Убедитесь в корректности `dependabot.yml`
   - Проверьте права для создания PR

### Логи и отладка

1. Перейдите в **Actions** → выберите workflow
2. Нажмите на failed job
3. Изучите логи для диагностики
4. Используйте `debug` workflow для отладки

## 📈 Оптимизация

### Производительность

- Используйте кэширование (уже настроено)
- Оптимизируйте Docker images
- Используйте matrix builds

### Стоимость

- Ограничьте время выполнения
- Используйте self-hosted runners для больших проектов
- Настройте retention policies

## 🔄 Обновления

### Обновление Actions

```bash
# Обновите версии actions в workflow файлах
# Например, actions/checkout@v4 → actions/checkout@v5
```

### Добавление новых workflow

1. Создайте новый `.yml` файл в `.github/workflows/`
2. Следуйте существующим паттернам
3. Добавьте документацию

## 📞 Поддержка

### Полезные ссылки

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Tauri Documentation](https://tauri.app/docs/)
- [Rust Documentation](https://doc.rust-lang.org/)

### Сообщество

- GitHub Discussions
- Tauri Discord
- Rust Community

---

**Примечание**: Все workflow настроены для работы с Tauri 2.x и современными версиями Node.js и Rust. При обновлении зависимостей может потребоваться адаптация конфигурации.

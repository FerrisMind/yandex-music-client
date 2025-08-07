// Файл для диагностики проблем в production
export class DebugLogger {
  private static instance: DebugLogger;
  private logs: string[] = [];

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  log(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    
    this.logs.push(logEntry);
    console.log(logEntry, data);
    
    // Сохраняем логи в localStorage для отладки
    try {
      const existingLogs = localStorage.getItem('debug_logs') || '[]';
      const allLogs = JSON.parse(existingLogs);
      allLogs.push({ timestamp, message, data });
      
      // Ограничиваем количество логов
      if (allLogs.length > 100) {
        allLogs.splice(0, allLogs.length - 100);
      }
      
      localStorage.setItem('debug_logs', JSON.stringify(allLogs));
    } catch (error) {
      console.warn('Не удалось сохранить лог:', error);
    }
  }

  error(message: string, error?: any): void {
    this.log(`ERROR: ${message}`, error);
  }

  warn(message: string, data?: any): void {
    this.log(`WARN: ${message}`, data);
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem('debug_logs');
    } catch (error) {
      console.warn('Не удалось очистить логи:', error);
    }
  }

  // Проверка доступности ресурсов
  async checkResources(): Promise<void> {
    // Получаем актуальные имена файлов из DOM
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    const scriptTags = document.querySelectorAll('script[type="module"]');
    
    const resources: string[] = [];
    
    cssLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) resources.push(href);
    });
    
    scriptTags.forEach(script => {
      const src = script.getAttribute('src');
      if (src) resources.push(src);
    });

    this.log(`Проверяем ресурсы: ${resources.join(', ')}`);

    for (const resource of resources) {
      try {
        const response = await fetch(resource, { method: 'HEAD' });
        if (response.ok) {
          this.log(`✅ Ресурс доступен: ${resource}`);
        } else {
          this.error(`❌ Ресурс недоступен: ${resource} (${response.status})`);
        }
      } catch (error) {
        this.error(`❌ Ошибка загрузки ресурса: ${resource}`, error);
      }
    }
  }

  // Проверка CSP
  checkCSP(): void {
    try {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (meta) {
        this.log('CSP найден:', meta.getAttribute('content'));
      } else {
        this.warn('CSP не найден');
      }
    } catch (error) {
      this.error('Ошибка проверки CSP:', error);
    }
  }

  // Проверка окружения
  checkEnvironment(): void {
    this.log('User Agent:', navigator.userAgent);
    this.log('Platform:', navigator.platform);
    this.log('Language:', navigator.language);
    this.log('Online:', navigator.onLine);
    this.log('Cookie Enabled:', navigator.cookieEnabled);
    this.log('Do Not Track:', navigator.doNotTrack);
  }

  // Проверка загрузки Яндекс Музыки
  async checkYandexMusic(): Promise<void> {
    try {
      await fetch('https://music.yandex.ru', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      this.log('✅ Яндекс Музыка доступен');
    } catch (error) {
      this.error('❌ Яндекс Музыка недоступен:', error);
    }
  }
}

// Экспортируем экземпляр для использования
export const debugLogger = DebugLogger.getInstance(); 
// Диагностика проблем с WebviewWindow
export class WebviewDebugger {
  private static instance: WebviewDebugger;
  private logs: string[] = [];

  static getInstance(): WebviewDebugger {
    if (!WebviewDebugger.instance) {
      WebviewDebugger.instance = new WebviewDebugger();
    }
    return WebviewDebugger.instance;
  }

  log(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[WEBVIEW_DEBUG] [${timestamp}] ${message}`;
    
    this.logs.push(logEntry);
    console.log(logEntry, data);
    
    // Сохраняем в localStorage для отладки
    try {
      const existingLogs = localStorage.getItem('webview_debug_logs') || '[]';
      const allLogs = JSON.parse(existingLogs);
      allLogs.push({ timestamp, message, data });
      
      if (allLogs.length > 30) {
        allLogs.splice(0, allLogs.length - 30);
      }
      
      localStorage.setItem('webview_debug_logs', JSON.stringify(allLogs));
    } catch (error) {
      console.warn('Не удалось сохранить webview debug лог:', error);
    }
  }

  // Проверка доступности Tauri API
  checkTauriAPI(): boolean {
    try {
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        this.log('✅ Tauri API доступен');
        return true;
      } else {
        this.log('❌ Tauri API недоступен');
        return false;
      }
    } catch (error) {
      this.log('❌ Ошибка проверки Tauri API:', error);
      return false;
    }
  }

  // Проверка доступности WebviewWindow API
  async checkWebviewWindowAPI(): Promise<boolean> {
    try {
      // Проверяем импорт WebviewWindow
      await import('@tauri-apps/api/webviewWindow');
      this.log('✅ WebviewWindow API доступен');
      return true;
    } catch (error) {
      this.log('❌ WebviewWindow API недоступен:', error);
      return false;
    }
  }

  // Проверка прав доступа
  checkPermissions(): void {
    try {
      // Проверяем различные API браузера
      this.log('User Agent:', navigator.userAgent);
      this.log('Platform:', navigator.platform);
      this.log('Online:', navigator.onLine);
      this.log('Cookie Enabled:', navigator.cookieEnabled);
      
      // Проверяем доступность localStorage
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        this.log('✅ localStorage доступен');
      } catch (error) {
        this.log('❌ localStorage недоступен:', error);
      }
      
      // Проверяем доступность sessionStorage
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        this.log('✅ sessionStorage доступен');
      } catch (error) {
        this.log('❌ sessionStorage недоступен:', error);
      }
    } catch (error) {
      this.log('Ошибка проверки прав доступа:', error);
    }
  }

  // Проверка сетевого подключения к Яндекс Музыке
  async checkYandexMusicAccess(): Promise<boolean> {
    try {
      await fetch('https://music.yandex.ru', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      this.log('✅ Доступ к Яндекс Музыке работает');
      return true;
    } catch (error) {
      this.log('❌ Проблемы с доступом к Яндекс Музыке:', error);
      return false;
    }
  }

  // Получить все логи
  getLogs(): string[] {
    return [...this.logs];
  }

  // Очистить логи
  clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem('webview_debug_logs');
    } catch (error) {
      console.warn('Не удалось очистить webview debug логи:', error);
    }
  }
}

export const webviewDebugger = WebviewDebugger.getInstance();

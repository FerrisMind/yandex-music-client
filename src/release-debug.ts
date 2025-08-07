// Специальная диагностика для релизной сборки
export class ReleaseDebugger {
  private static instance: ReleaseDebugger;
  private logs: string[] = [];

  static getInstance(): ReleaseDebugger {
    if (!ReleaseDebugger.instance) {
      ReleaseDebugger.instance = new ReleaseDebugger();
    }
    return ReleaseDebugger.instance;
  }

  log(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[RELEASE_DEBUG] [${timestamp}] ${message}`;
    
    this.logs.push(logEntry);
    console.log(logEntry, data);
    
    // Сохраняем в localStorage для отладки
    try {
      const existingLogs = localStorage.getItem('release_debug_logs') || '[]';
      const allLogs = JSON.parse(existingLogs);
      allLogs.push({ timestamp, message, data });
      
      if (allLogs.length > 50) {
        allLogs.splice(0, allLogs.length - 50);
      }
      
      localStorage.setItem('release_debug_logs', JSON.stringify(allLogs));
    } catch (error) {
      console.warn('Не удалось сохранить release debug лог:', error);
    }
  }

  // Проверка доступности WebviewWindow
  async testWebviewWindow(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Проверяем доступность API Tauri
        if (typeof window !== 'undefined' && (window as any).__TAURI__) {
          this.log('✅ Tauri API доступен');
          
          // Дополнительная проверка WebviewWindow API
          this.checkWebviewWindowAPI().then(isAvailable => {
            if (isAvailable) {
              this.log('✅ WebviewWindow API доступен');
              resolve(true);
            } else {
              this.log('❌ WebviewWindow API недоступен');
              resolve(false);
            }
          }).catch(error => {
            this.log('❌ Ошибка проверки WebviewWindow API:', error);
            resolve(false);
          });
        } else {
          this.log('❌ Tauri API недоступен');
          resolve(false);
        }
      } catch (error) {
        this.log('❌ Ошибка проверки Tauri API:', error);
        resolve(false);
      }
    });
  }

  // Проверка WebviewWindow API
  async checkWebviewWindowAPI(): Promise<boolean> {
    try {
      const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
      this.log('✅ WebviewWindow импортирован успешно');
      
      // Проверяем, можем ли мы создать экземпляр
      const testWindow = new WebviewWindow('test', {
        url: 'about:blank',
        title: 'Test',
        width: 100,
        height: 100,
        visible: false
      });
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          this.log('❌ Таймаут создания тестового WebviewWindow');
          resolve(false);
        }, 5000);
        
        testWindow.once('tauri://created', () => {
          clearTimeout(timeout);
          this.log('✅ Тестовый WebviewWindow создан успешно');
          testWindow.close();
          resolve(true);
        });
        
        testWindow.once('tauri://error', (e: any) => {
          clearTimeout(timeout);
          this.log('❌ Ошибка создания тестового WebviewWindow:', e);
          resolve(false);
        });
      });
    } catch (error) {
      this.log('❌ Ошибка импорта WebviewWindow:', error);
      return false;
    }
  }

  // Проверка CSP для WebviewWindow
  checkCSPForWebview(): void {
    try {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (meta) {
        const csp = meta.getAttribute('content');
        this.log('CSP найден:', csp);
        
        // Проверяем разрешения для WebviewWindow
        if (csp && csp.includes('default-src')) {
          this.log('✅ default-src разрешен в CSP');
        } else {
          this.log('❌ default-src не найден в CSP');
        }
        
        if (csp && csp.includes('connect-src')) {
          this.log('✅ connect-src разрешен в CSP');
        } else {
          this.log('❌ connect-src не найден в CSP');
        }
      } else {
        this.log('❌ CSP не найден');
      }
    } catch (error) {
      this.log('Ошибка проверки CSP:', error);
    }
  }

  // Проверка сетевого подключения
  async checkNetworkConnectivity(): Promise<void> {
    try {
      await fetch('https://music.yandex.ru', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      this.log('✅ Сетевое подключение к Яндекс Музыке работает');
    } catch (error) {
      this.log('❌ Проблемы с сетевым подключением:', error);
    }
  }

  // Проверка окружения
  checkReleaseEnvironment(): void {
    this.log('User Agent:', navigator.userAgent);
    this.log('Platform:', navigator.platform);
    this.log('Online:', navigator.onLine);
    this.log('Cookie Enabled:', navigator.cookieEnabled);
    this.log('Do Not Track:', navigator.doNotTrack);
    this.log('Language:', navigator.language);
    this.log('Hardware Concurrency:', navigator.hardwareConcurrency);
    this.log('Device Memory:', (navigator as any).deviceMemory);
  }

  // Получить все логи
  getLogs(): string[] {
    return [...this.logs];
  }

  // Очистить логи
  clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem('release_debug_logs');
    } catch (error) {
      console.warn('Не удалось очистить release debug логи:', error);
    }
  }
}

export const releaseDebugger = ReleaseDebugger.getInstance();

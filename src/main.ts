import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { debugLogger } from "./debug";
import { releaseDebugger } from "./release-debug";
import { webviewDebugger } from "./webview-debug";
import { webviewFallback } from "./webview-fallback";

// Система управления изображениями
class ImageManager {
  private static instance: ImageManager;
  private loadedImages: Set<string> = new Set();

  static getInstance(): ImageManager {
    if (!ImageManager.instance) {
      ImageManager.instance = new ImageManager();
    }
    return ImageManager.instance;
  }

  // Создание плейсхолдера для изображения
  createPlaceholder(width: number, height: number): HTMLDivElement {
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.style.width = `${width}px`;
    placeholder.style.height = `${height}px`;
    return placeholder;
  }

  // Оптимизированная загрузка изображения
  async loadImage(src: string, placeholder?: HTMLDivElement): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.loadedImages.add(src);
        if (placeholder) {
          placeholder.style.display = 'none';
        }
        img.classList.add('loaded');
        debugLogger.log(`Изображение загружено: ${src}`);
        resolve(img);
      };

      img.onerror = () => {
        if (placeholder) {
          placeholder.style.display = 'block';
        }
        debugLogger.error(`Не удалось загрузить изображение: ${src}`);
        reject(new Error(`Не удалось загрузить изображение: ${src}`));
      };

      img.src = src;
      img.loading = 'lazy';
    });
  }

  // Проверка, загружено ли изображение
  isImageLoaded(src: string): boolean {
    return this.loadedImages.has(src);
  }
}

// Система мониторинга производительности
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(label: string): void {
    this.metrics.set(label, performance.now());
  }

  endTimer(label: string): number {
    const startTime = this.metrics.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      debugLogger.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      this.metrics.delete(label);
      return duration;
    }
    return 0;
  }
}

// Система управления webview
class WebviewManager {
  private static instance: WebviewManager;
  private isProduction: boolean;

  constructor() {
    // Определяем режим сборки
    this.isProduction = !(import.meta as any).env?.DEV;
    debugLogger.log(`Режим сборки: ${this.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  }

  static getInstance(): WebviewManager {
    if (!WebviewManager.instance) {
      WebviewManager.instance = new WebviewManager();
    }
    return WebviewManager.instance;
  }

  // Создание WebviewWindow с улучшенной обработкой ошибок
  async createWebviewWindow(): Promise<boolean> {
    try {
      debugLogger.log("Создаем WebviewWindow для Яндекс Музыки");
      
      // Проверяем доступность Tauri API
      if (typeof window === 'undefined' || !(window as any).__TAURI__) {
        debugLogger.error("Tauri API недоступен");
        return false;
      }
      
      // Динамический импорт WebviewWindow для оптимизации code splitting
      const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
      
      const yandexMusicWindow = new WebviewWindow('yandex-music', {
        url: 'https://music.yandex.ru',
        title: 'Яндекс Музыка',
        width: 1200,
        height: 800,
        center: true,
        resizable: true,
        fullscreen: false,
        alwaysOnTop: false,
        decorations: true,
        skipTaskbar: false,
        focus: true,
        visible: true,
        minWidth: 800,
        minHeight: 600,
        maxWidth: 1920,
        maxHeight: 1080,
        // Дополнительные настройки для релизной сборки
        transparent: false,
        closable: true,
        minimizable: true,
        maximizable: true
      });

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          debugLogger.warn("⏰ Таймаут создания WebviewWindow");
          resolve(false);
        }, 15000); // Увеличиваем таймаут до 15 секунд

        yandexMusicWindow.once('tauri://created', () => {
          clearTimeout(timeout);
          debugLogger.log("✅ WebviewWindow создан успешно");
          resolve(true);
        });

        yandexMusicWindow.once('tauri://error', (e: any) => {
          clearTimeout(timeout);
          debugLogger.error("❌ Ошибка создания WebviewWindow:", e);
          resolve(false);
        });

        // Дополнительные обработчики событий
        yandexMusicWindow.once('tauri://window-created', () => {
          debugLogger.log("Окно webview создано");
        });

        yandexMusicWindow.once('tauri://window-destroyed', () => {
          debugLogger.log("Окно webview уничтожено");
        });
      });
    } catch (error) {
      debugLogger.error("❌ Исключение при создании WebviewWindow:", error);
      return false;
    }
  }

  // Основной метод инициализации с улучшенной логикой
  async initialize(container: HTMLElement): Promise<void> {
    debugLogger.log("Инициализация WebviewManager");
    
    // Показываем индикатор загрузки
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center;">
        <div style="margin-bottom: 20px;">
          <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #ff0000; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
        <h3>Загрузка Яндекс Музыки...</h3>
        <p>Пожалуйста, подождите</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    // Пытаемся создать WebviewWindow несколько раз
    let webviewSuccess = false;
    const maxAttempts = 3;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      debugLogger.log(`Попытка создания WebviewWindow ${attempt}/${maxAttempts}`);
      
      webviewSuccess = await this.createWebviewWindow();
      
      if (webviewSuccess) {
        debugLogger.log("WebviewWindow создан успешно");
        container.innerHTML = ''; // Очищаем контейнер
        return;
      }
      
      if (attempt < maxAttempts) {
        debugLogger.log(`Попытка ${attempt} не удалась, ожидаем перед следующей попыткой...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Ждем 2 секунды
      }
    }
    
    // Если все попытки не удались, используем улучшенный fallback
    debugLogger.error("Все попытки создания WebviewWindow не удались");
    
    // Проверяем доступность iframe
    const iframeAvailable = await webviewFallback.testIframeAvailability();
    
    if (iframeAvailable) {
      debugLogger.log("iframe доступен, используем его как fallback");
      webviewFallback.createIframeFallback(container);
    } else {
      debugLogger.log("iframe недоступен, показываем сообщение об ошибке");
      webviewFallback.showErrorMessage(container, 'Не удалось загрузить Яндекс Музыку');
    }
  }
}

// Глобальная обработка ошибок
window.addEventListener('error', (event) => {
  debugLogger.error('Глобальная ошибка:', {
    error: event.error,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  debugLogger.error('Необработанное отклонение промиса:', event.reason);
});

window.addEventListener("DOMContentLoaded", async () => {
  debugLogger.log("Приложение Яндекс Музыка загружено");
  
  // Запускаем диагностику
  debugLogger.checkEnvironment();
  debugLogger.checkCSP();
  await debugLogger.checkResources();
  await debugLogger.checkYandexMusic();
  
  // Дополнительная диагностика для релизной сборки
  if (!(import.meta as any).env?.DEV) {
    releaseDebugger.log("Запуск релизной диагностики");
    releaseDebugger.checkReleaseEnvironment();
    releaseDebugger.checkCSPForWebview();
    await releaseDebugger.checkNetworkConnectivity();
    await releaseDebugger.testWebviewWindow();
    
    // Дополнительная диагностика WebviewWindow
    webviewDebugger.log("Запуск WebviewWindow диагностики");
    webviewDebugger.checkTauriAPI();
    await webviewDebugger.checkWebviewWindowAPI();
    webviewDebugger.checkPermissions();
    await webviewDebugger.checkYandexMusicAccess();
  }
  
  const imageManager = ImageManager.getInstance();
  const performanceMonitor = PerformanceMonitor.getInstance();
  const webviewManager = WebviewManager.getInstance();
  
  // Получаем текущее окно
  const currentWindow = getCurrentWebviewWindow();
  
  // Обработка событий окна
  currentWindow?.once("tauri://created", () => {
    debugLogger.log("Окно создано успешно");
    performanceMonitor.startTimer('window-creation');
  });

  currentWindow?.once("tauri://error", (e: any) => {
    debugLogger.error("Ошибка создания окна:", e);
  });

  // Создаем webview для Яндекс Музыки
  const webviewContainer = document.getElementById('webview-container');
  if (webviewContainer) {
    debugLogger.log("Контейнер webview найден, инициализируем");
    performanceMonitor.startTimer('webview-initialization');
    
    try {
      await webviewManager.initialize(webviewContainer);
      performanceMonitor.endTimer('webview-initialization');
    } catch (error) {
      debugLogger.error("Ошибка инициализации webview:", error);
      
      // Используем улучшенный fallback механизм
      debugLogger.log("Используем улучшенный fallback механизм");
      
      // Проверяем доступность iframe
      const iframeAvailable = await webviewFallback.testIframeAvailability();
      
      if (iframeAvailable) {
        debugLogger.log("iframe доступен, используем его");
        webviewFallback.createIframeFallback(webviewContainer);
      } else {
        debugLogger.log("iframe недоступен, показываем сообщение об ошибке");
        webviewFallback.showErrorMessage(webviewContainer, 'Не удалось загрузить Яндекс Музыку');
      }
    }
  } else {
    debugLogger.error("Контейнер webview не найден");
  }

  // Обработка сообщений от webview
  window.addEventListener('message', (event) => {
    if (event.data.type === 'image-loading-started') {
      performanceMonitor.startTimer(`image-load-${event.data.src}`);
    } else if (event.data.type === 'image-loading-completed') {
      performanceMonitor.endTimer(`image-load-${event.data.src}`);
    }
  });

  // Оптимизация для ленивой загрузки
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const dataSrc = img.dataset.src;
        if (dataSrc && !imageManager.isImageLoaded(dataSrc)) {
          imageManager.loadImage(dataSrc)
            .then(() => {
              img.src = dataSrc;
              img.classList.add('loaded');
            })
            .catch(error => {
              debugLogger.warn('Ошибка загрузки изображения:', error);
            });
        }
      }
    });
  });

  // Наблюдение за изображениями с data-src
  document.querySelectorAll('img[data-src]').forEach(img => {
    observer.observe(img);
  });

  // Глобальная обработка ошибок загрузки изображений
  document.addEventListener('error', (event) => {
    const target = event.target as HTMLImageElement;
    if (target.tagName === 'IMG') {
      debugLogger.warn('Ошибка загрузки изображения:', target.src);
      target.style.display = 'none';
    }
  }, true);
});

// Утилиты для работы с изображениями и плейсхолдерами

export interface ImagePlaceholderOptions {
  width: number;
  height: number;
  backgroundColor?: string;
  shimmerColor?: string;
  borderRadius?: number;
}

export class ImagePlaceholderGenerator {
  /**
   * Создает SVG плейсхолдер с градиентом
   */
  static createSVGPlaceholder(options: ImagePlaceholderOptions): string {
    const {
      width,
      height,
      backgroundColor = '#f0f0f0',
      shimmerColor = '#e0e0e0',
      borderRadius = 4
    } = options;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${shimmerColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${backgroundColor};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" rx="${borderRadius}" fill="url(#shimmer)" />
      </svg>
    `;
  }

  /**
   * Создает base64 плейсхолдер
   */
  static createBase64Placeholder(options: ImagePlaceholderOptions): string {
    const svg = this.createSVGPlaceholder(options);
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Создает DOM элемент плейсхолдера
   */
  static createPlaceholderElement(options: ImagePlaceholderOptions): HTMLDivElement {
    const element = document.createElement('div');
    element.className = 'image-placeholder';
    element.style.width = `${options.width}px`;
    element.style.height = `${options.height}px`;
    
    if (options.backgroundColor) {
      element.style.backgroundColor = options.backgroundColor;
    }
    
    if (options.borderRadius) {
      element.style.borderRadius = `${options.borderRadius}px`;
    }

    return element;
  }
}

export class ImageLoader {
  private static instance: ImageLoader;
  private cache = new Map<string, HTMLImageElement>();

  static getInstance(): ImageLoader {
    if (!ImageLoader.instance) {
      ImageLoader.instance = new ImageLoader();
    }
    return ImageLoader.instance;
  }

  /**
   * Загружает изображение с кэшированием
   */
  async loadImage(src: string, placeholder?: HTMLDivElement): Promise<HTMLImageElement> {
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(src, img);
        if (placeholder) {
          placeholder.style.display = 'none';
        }
        resolve(img);
      };

      img.onerror = () => {
        if (placeholder) {
          placeholder.style.display = 'block';
        }
        reject(new Error(`Не удалось загрузить изображение: ${src}`));
      };

      img.src = src;
      img.loading = 'lazy';
    });
  }

  /**
   * Предзагружает изображение
   */
  preloadImage(src: string): Promise<void> {
    return this.loadImage(src).then(() => {
      console.log(`✅ Изображение предзагружено: ${src}`);
    });
  }

  /**
   * Очищает кэш изображений
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export class PerformanceTracker {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Начинает отслеживание метрики
   */
  startTracking(label: string): void {
    this.metrics.set(label, [performance.now()]);
  }

  /**
   * Завершает отслеживание метрики
   */
  endTracking(label: string): number {
    const times = this.metrics.get(label);
    if (times && times.length > 0) {
      const duration = performance.now() - times[0];
      times.push(duration);
      
      if (times.length > 10) {
        times.shift(); // Оставляем только последние 10 измерений
      }
      
      const avgDuration = times.slice(1).reduce((a, b) => a + b, 0) / (times.length - 1);
      console.log(`📊 ${label}: ${duration.toFixed(2)}ms (среднее: ${avgDuration.toFixed(2)}ms)`);
      
      return duration;
    }
    return 0;
  }

  /**
   * Получает статистику по метрике
   */
  getStats(label: string): { count: number; average: number; min: number; max: number } {
    const times = this.metrics.get(label);
    if (!times || times.length <= 1) {
      return { count: 0, average: 0, min: 0, max: 0 };
    }

    const durations = times.slice(1);
    const average = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return {
      count: durations.length,
      average,
      min,
      max
    };
  }
} 
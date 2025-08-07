// Улучшенный fallback механизм для WebviewWindow
export class WebviewFallback {
  private static instance: WebviewFallback;

  static getInstance(): WebviewFallback {
    if (!WebviewFallback.instance) {
      WebviewFallback.instance = new WebviewFallback();
    }
    return WebviewFallback.instance;
  }

  // Создание iframe fallback
  createIframeFallback(container: HTMLElement): void {
    console.log('Создаем iframe fallback для Яндекс Музыки');
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Создаем iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://music.yandex.ru';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.outline = 'none';
    iframe.style.overflow = 'hidden';
    iframe.allow = 'autoplay; encrypted-media; microphone; camera';
    iframe.allowFullscreen = true;
    iframe.title = 'Яндекс Музыка';
    
    // Добавляем обработчики событий
    iframe.onload = () => {
      console.log('✅ iframe загружен успешно');
    };
    
    iframe.onerror = (error) => {
      console.error('❌ Ошибка загрузки iframe:', error);
      this.showErrorMessage(container, 'Ошибка загрузки Яндекс Музыки в iframe');
    };
    
    container.appendChild(iframe);
  }

  // Создание popup fallback
  createPopupFallback(): void {
    console.log('Открываем Яндекс Музыку в новом окне браузера');
    
    const popup = window.open(
      'https://music.yandex.ru',
      'yandex-music-popup',
      'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );
    
    if (popup) {
      popup.focus();
      console.log('✅ Popup окно открыто');
    } else {
      console.error('❌ Не удалось открыть popup окно (возможно заблокировано)');
      alert('Пожалуйста, разрешите всплывающие окна для этого сайта и попробуйте снова.');
    }
  }

  // Показ сообщения об ошибке с опциями
  showErrorMessage(container: HTMLElement, message: string): void {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div style="margin-bottom: 20px;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h2 style="margin-bottom: 15px; font-size: 24px;">${message}</h2>
        <p style="margin-bottom: 30px; opacity: 0.9; max-width: 500px;">
          Попробуйте один из вариантов ниже для доступа к Яндекс Музыке
        </p>
        <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
          <button onclick="window.location.reload()" style="padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer; font-size: 16px; transition: all 0.3s ease;">
            🔄 Попробовать снова
          </button>
          <button onclick="window.open('https://music.yandex.ru', '_blank')" style="padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer; font-size: 16px; transition: all 0.3s ease;">
            🌐 Открыть в браузере
          </button>
          <button onclick="window.open('https://music.yandex.ru', 'yandex-music-popup', 'width=1200,height=800')" style="padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer; font-size: 16px; transition: all 0.3s ease;">
            📱 Открыть в окне
          </button>
        </div>
        <div style="margin-top: 30px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; max-width: 500px; text-align: left;">
          <h4 style="margin-top: 0; margin-bottom: 10px;">💡 Советы по устранению проблем:</h4>
          <ul style="margin: 0; padding-left: 20px; opacity: 0.9;">
            <li>Проверьте подключение к интернету</li>
            <li>Отключите блокировщики рекламы</li>
            <li>Разрешите всплывающие окна</li>
            <li>Попробуйте другой браузер</li>
          </ul>
        </div>
      </div>
      <style>
        button:hover {
          background: rgba(255,255,255,0.3) !important;
          transform: translateY(-2px);
        }
      </style>
    `;
  }

  // Проверка доступности iframe
  async testIframeAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const testIframe = document.createElement('iframe');
        testIframe.style.display = 'none';
        testIframe.src = 'about:blank';
        
        testIframe.onload = () => {
          document.body.removeChild(testIframe);
          console.log('✅ iframe поддерживается');
          resolve(true);
        };
        
        testIframe.onerror = () => {
          console.log('❌ iframe не поддерживается');
          resolve(false);
        };
        
        document.body.appendChild(testIframe);
        
        // Таймаут на случай, если iframe не загружается
        setTimeout(() => {
          if (document.body.contains(testIframe)) {
            document.body.removeChild(testIframe);
          }
          console.log('⏰ Таймаут проверки iframe');
          resolve(false);
        }, 3000);
      } catch (error) {
        console.error('❌ Ошибка проверки iframe:', error);
        resolve(false);
      }
    });
  }
}

export const webviewFallback = WebviewFallback.getInstance();

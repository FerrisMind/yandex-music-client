import { defineConfig } from "vite";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig({
  // Базовый путь для production
  base: './',
  
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    // Оптимизация для code splitting
    rollupOptions: {
      output: {
        // Ручное управление чанками для оптимизации
        manualChunks: {
          // Основной чанк для Tauri API
          'tauri-core': ['@tauri-apps/api/webviewWindow'],
          // Чанк для утилит отладки
          'debug-utils': ['./src/debug', './src/release-debug', './src/webview-debug'],
          // Чанк для вендоров (если появятся)
          'vendor': []
        },
        // Оптимизация имен файлов
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    // Оптимизация размера бандла
    chunkSizeWarningLimit: 1000,
    // Включение source maps для отладки
    sourcemap: true,
    // Минификация с помощью esbuild (стандарт для Vite)
    minify: 'esbuild'
  },
  // Оптимизация для разработки
  optimizeDeps: {
    include: ['@tauri-apps/api/webviewWindow']
  }
});

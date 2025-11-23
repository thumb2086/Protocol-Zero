import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'

console.log('Loading electron.vite.config.ts...')
console.log('Main entry:', resolve(__dirname, 'src/main/index.ts'))

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: 'src/main/index.ts'
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: 'src/preload/index.ts'
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        }
      }
    }
  },
  // 解決中文路徑下的文件監控死鎖
  server: {
    watch: {
      // 使用輪詢模式而不是 fsEvents（解決中文路徑問題）
      usePolling: true,
      // 輪詢間隔 (毫秒)
      interval: 1000,
      // 忽略 node_modules
      ignored: ['**/node_modules/**']
    }
  }
})

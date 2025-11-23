import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

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
        },
        resolve: {
            alias: {
                '@renderer': resolve('src/renderer/src')
            }
        },
        assetsInclude: ['**/*.json'],
        plugins: [react()]
    }
})

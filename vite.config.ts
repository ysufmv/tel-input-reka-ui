import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/tel-input/',
  build: {
    cssCodeSplit: true,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'TelInput',
      fileName: 'tel-input',
    },
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      external: ['vue', 'libphonenumber-js', 'reka-ui', 'lucide-vue-next'],
      output: {
        globals: {
          vue: 'Vue',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'tel-input.css';
          }
          return assetInfo.name;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  }
})

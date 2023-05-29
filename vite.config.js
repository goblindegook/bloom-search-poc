/** @type {import('vite').UserConfig} */
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/bloom-search-poc/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'bloom-filter.html'),
      },
      output: '',
    },
  },
})

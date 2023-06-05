/** @type {import('vite').UserConfig} */
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/bloom-search-poc/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        bloomFilter: resolve(__dirname, 'bloom-filter.html'),
        countingBloomFilter: resolve(__dirname, 'counting-bloom-filter.html'),
        stemmer: resolve(__dirname, 'stemmer.html'),
      },
      output: '',
    },
  },
})

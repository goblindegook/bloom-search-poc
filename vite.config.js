/** @type {import('vite').UserConfig} */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

/** `<!--include name current-->` pastes partials/name.html; the link marked `data-nav="current"` becomes the current page. */
const partials = () => ({
  name: 'partials',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) =>
      html.replace(/<!--include (\S+) (\S+)-->/g, (_, name, current) =>
        readFileSync(`partials/${name}.html`, 'utf8').replace(
          / data-nav="(.*?)"/g,
          (_, id) => (id === current ? ' aria-current="page"' : ''),
        ),
      ),
  },
})

export default defineConfig({
  base: '/bloom-search-poc/',
  plugins: [partials()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        docs: resolve(__dirname, 'docs.html'),
        showcase: resolve(__dirname, 'showcase.html'),
        compare: resolve(__dirname, 'compare.html'),
        bloomFilter: resolve(__dirname, 'bloom-filter.html'),
        countingBloomFilter: resolve(__dirname, 'counting-bloom-filter.html'),
        stemmer: resolve(__dirname, 'stemmer.html'),
        privacy: resolve(__dirname, 'privacy.html'),
      },
      output: '',
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
})

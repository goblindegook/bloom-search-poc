import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

/** `<!--include name current-->` pastes partials/name.html; the link marked `data-nav="current"` becomes the current page. */
const partials = () => ({
  name: 'partials',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) =>
      html.replace(/<!--include (\S+) (\S+)-->/g, (_, name, current) =>
        readFileSync(
          resolve(__dirname, `src/partials/${name}.html`),
          'utf8',
        ).replace(/ data-nav="(.*?)"/g, (_, id) =>
          id === current ? ' aria-current="page"' : '',
        ),
      ),
  },
})

// Pages live in src/, which is the Vite root: every .html file there is a page.
const root = resolve(__dirname, 'src')
const pages = Object.fromEntries(
  readdirSync(root)
    .filter((file) => file.endsWith('.html'))
    .map((file) => [file.slice(0, -'.html'.length), resolve(root, file)]),
)

export default defineConfig({
  root,
  publicDir: resolve(__dirname, 'public'),
  base: '/',
  plugins: [partials()],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: pages,
      output: {
        // Keep the shared stylesheet out of any one page's entry chunk, which Vite deletes.
        manualChunks: (id) => (id.endsWith('site.css') ? 'site' : undefined),
      },
    },
  },
})

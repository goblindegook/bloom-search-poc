import './style.css'
import React from 'preact/compat'
import { render } from 'preact'
import { Search } from './components/Search'
import { signal } from '@preact/signals'
import { getBloomSearch } from './search/bloom-search'
import { getElasticlunr } from './search/elasticlunr'
import { getLunr } from './search/lunr'
import { getMiniSearch } from './search/minisearch'
import { Navigation } from './components/Navigation'

const size = signal<Record<string, [number, number]>>({})
const latency = signal<Record<string, number>>({})
const results = signal<Record<string, string[]>>({})

const searchBackends = [
  {
    name: 'bloom-search',
    title: 'Bloom Search',
    url: 'https://www.npmjs.com/package/@pacote/bloom-search',
    backend: await getBloomSearch(),
  },
  {
    name: 'elasticlunr',
    title: 'Elasticlunr',
    url: 'https://www.npmjs.com/package/elasticlunr',
    backend: await getElasticlunr(),
  },
  {
    name: 'lunr',
    title: 'Lunr',
    url: 'https://www.npmjs.com/package/lunr',
    backend: await getLunr(),
  },
  {
    name: 'minisearch',
    title: 'MiniSearch',
    url: 'https://www.npmjs.com/package/minisearch',
    backend: await getMiniSearch(),
  },
]

searchBackends.forEach(async ({ name, backend }) => {
  size.value = {
    ...size.value,
    [name]: [backend.size, backend.gzippedSize],
  }
})

function kb(size: number): string {
  return (size / 1024).toFixed(2) + ' KB'
}

function App() {
  return (
    <>
      <Navigation />
      <div class="p-8">
        <h1 class="text-4xl font-extrabold leading-none tracking-tight text-gray-900 pb-8">
          Static Site Search
        </h1>
        <Search
          id="search"
          label="Search"
          onKeyUp={async (event: any) => {
            const terms = event.target?.value ?? ''

            searchBackends.forEach(async ({ name, backend }) => {
              if (terms.length === 0) {
                results.value = {}
              }

              const start = Number(new Date())
              const r = await backend.search(terms)
              const finish = Number(new Date())
              results.value = {
                ...results.value,
                [name]: r,
              }
              latency.value = { ...latency.value, [name]: finish - start }
            })
          }}
        />
        <section id="results" class="grid grid-cols-4">
          {searchBackends.map((backend) => {
            const l = latency.value[backend.name] ?? 0
            const s = size.value[backend.name] ?? [0, 0]
            const r = results.value[backend.name] ?? []
            return (
              <section key={backend.name}>
                <h2 class="text-2xl font-extrabold leading-none tracking-tight text-blue-600 pb-2">
                  <a href={backend.url}>{backend.title}</a>
                </h2>
                <p class="text-xs pb-4">
                  {kb(s[0])} ({kb(s[1])} gzipped)
                </p>
                {r.length > 0 && (
                  <>
                    <p class="text-md font-bold pb-4">
                      {r.length} results, {l}ms
                    </p>
                    <ol class="max-w-md space-y-1 text-gray-500 list-decimal list-inside">
                      {r.map((file) => (
                        <li key={file}>
                          <article>
                            <a
                              href="/bloom-search-poc/documents/${file}"
                              class="text-blue-600"
                            >
                              {file}
                            </a>
                          </article>
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </section>
            )
          })}
        </section>
      </div>
    </>
  )
}

render(<App />, document.getElementById('app')!)

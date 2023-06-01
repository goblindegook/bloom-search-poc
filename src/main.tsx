import './style.css'
import React, { useEffect } from 'preact/compat'
import { render } from 'preact'
import { Search } from './components/Search'
import { signal } from '@preact/signals'
import { getBloomSearch } from './search/bloom-search'
import { getElasticlunr } from './search/elasticlunr'
import { getLunr } from './search/lunr'
import { getMiniSearch } from './search/minisearch'
import { Navigation } from './components/Navigation'
import { SearchBackend } from './search/search'

const latency = signal<Record<string, number>>({})
const results = signal<Record<string, string[]>>({})
const backends = signal<SearchBackend[]>([])

function kb(size: number): string {
  return (size / 1024).toFixed(2) + ' KB'
}

function App() {
  useEffect(() => {
    void (async () => {
      backends.value = [
        await getBloomSearch(),
        await getElasticlunr(),
        await getLunr(),
        await getMiniSearch(),
      ]
    })()
  }, [])

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
          disabled={backends.value.some(({ isLoading }) => isLoading)}
          onKeyUp={async (event: any) => {
            const terms = event.target?.value ?? ''

            backends.value.forEach(async ({ name, search }) => {
              if (terms.length === 0) {
                results.value = {}
              }

              const start = Number(new Date())
              const r = await search(terms)
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
          {backends.value.map(
            ({ isLoading, name, title, url, size, gzippedSize }) => {
              const l = latency.value[name] ?? 0
              const r = results.value[name] ?? []
              return (
                <section key={name}>
                  <h2 class="text-2xl font-extrabold leading-none tracking-tight text-blue-600 pb-2">
                    <a href={url}>{title}</a>
                  </h2>
                  <p class="text-xs pb-4">
                    {isLoading
                      ? 'Loading...'
                      : `${kb(size)} (${kb(gzippedSize)} gzipped)`}
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
                                href={`/bloom-search-poc/documents/${file}`}
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
            }
          )}
        </section>
      </div>
    </>
  )
}

render(<App />, document.getElementById('app')!)

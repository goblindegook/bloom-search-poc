import './style.css'
import { signal } from '@preact/signals'
import { type ComponentChild, render } from 'preact'
import { useEffect } from 'preact/hooks'
import { ExternalLinkIcon } from '../components/Icons'
import { Navigation } from '../components/Navigation'
import { Search } from '../components/Search'
import { getBloomSearch } from './backends/bloom-search'
import { getElasticlunr } from './backends/elasticlunr'
import { getFuse } from './backends/fuse'
import { getLunr } from './backends/lunr'
import { getMiniSearch } from './backends/minisearch'
import type { SearchBackend } from './backends/search'

const backends = signal<Record<string, SearchBackend>>({})
const selectedBackend = signal('elasticlunr')
const searchTerms = signal('whale')

function kb(size: number): string {
  return `${(size / 1024).toFixed(2)} KB`
}

type EngineProps = {
  title: ComponentChild
  terms: string
  backend: SearchBackend
}

function Engine({ title, terms, backend }: EngineProps) {
  const start = Date.now()
  const results = terms.length === 0 ? [] : backend.search(terms)
  const latency = Date.now() - start

  return (
    <>
      <h2 class="text-2xl font-extrabold leading-none tracking-tight pb-2">
        {title}
        <a class="text-blue-600" href={backend.url} title={backend.title}>
          <ExternalLinkIcon class="inline-block align-bottom ml-2 w-5 h-5" />
        </a>
      </h2>
      <p class="text-xs pb-4">
        {kb(backend.size)} ({kb(backend.gzippedSize)} gzipped)
      </p>
      <p class="text-md font-bold pb-4">
        {results.length} results, {latency}ms
      </p>
      {results.length > 0 && (
        <ol class="max-w-md space-y-1 text-gray-500 list-decimal list-inside">
          {results.map((file) => (
            <li key={file}>
              <article class="inline-block">
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
      )}
    </>
  )
}

function App() {
  useEffect(() => {
    void (async () => {
      backends.value = [
        await getBloomSearch(),
        await getElasticlunr(),
        await getFuse(),
        await getLunr(),
        await getMiniSearch(),
      ].reduce<Record<string, SearchBackend>>((all, backend) => {
        all[backend.name] = backend
        return all
      }, {})
    })()
  }, [])

  const bloomSearch = backends.value['bloom-search']
  const selected = backends.value[selectedBackend.value]

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
          value={searchTerms.value}
          disabled={!Object.values(backends.value).length}
          onKeyUp={async (event) => {
            const target = event.target as HTMLInputElement
            searchTerms.value = target.value ?? ''
          }}
        />
        <section id="results" class="grid grid-cols-2">
          <section>
            {backends.value['bloom-search'] ? (
              <Engine
                title={bloomSearch.title}
                terms={searchTerms.value}
                backend={bloomSearch}
              />
            ) : (
              'Loading...'
            )}
          </section>
          <section>
            {selected ? (
              <Engine
                title={
                  <select
                    class="text-xl font-extrabold"
                    value={selectedBackend.value}
                    onChange={(event) => {
                      const target = event.target as HTMLSelectElement
                      selectedBackend.value = target.value
                    }}
                  >
                    {Object.values(backends.value)
                      .filter(({ name }) => name !== 'bloom-search')
                      .map(({ name, title }) => (
                        <option value={name}>{title}</option>
                      ))}
                  </select>
                }
                terms={searchTerms.value}
                backend={selected}
              />
            ) : (
              'Loading...'
            )}
          </section>
        </section>
      </div>
    </>
  )
}

// biome-ignore lint/style/noNonNullAssertion: exists
render(<App />, document.getElementById('app')!)

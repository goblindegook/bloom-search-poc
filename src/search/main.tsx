import './style.css'
import { ComponentChild, render } from 'preact'
import { useEffect } from 'preact/hooks'
import { Search } from '../components/Search'
import { signal } from '@preact/signals'
import { getBloomSearch } from './backends/bloom-search'
import { getElasticlunr } from './backends/elasticlunr'
import { getLunr } from './backends/lunr'
import { getMiniSearch } from './backends/minisearch'
import { Navigation } from '../components/Navigation'
import { SearchBackend } from './backends/search'
import { ExternalLinkIcon } from '../components/Icons'

const backends = signal<Record<string, SearchBackend>>({})
const selectedBackend = signal('elasticlunr')
const searchTerms = signal('whale')

function kb(size: number): string {
  return (size / 1024).toFixed(2) + ' KB'
}

type EngineProps = {
  title: ComponentChild
  terms: string
  backend: SearchBackend
}

function Engine({ title, terms, backend }: EngineProps) {
  const start = Number(new Date())
  const results = terms.length === 0 ? [] : backend.search(terms)
  const latency = Number(new Date()) - start

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
        await getLunr(),
        await getMiniSearch(),
      ].reduce<Record<string, SearchBackend>>(
        (all, backend) => ({ ...all, [backend.name]: backend }),
        {}
      )
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
          value={searchTerms.value}
          disabled={!Object.values(backends.value).length}
          onKeyUp={async (event: any) => {
            searchTerms.value = event.target?.value ?? ''
          }}
        />
        <section id="results" class="grid grid-cols-2">
          <section>
            {backends.value['bloom-search'] ? (
              <Engine
                title={backends.value['bloom-search'].title}
                terms={searchTerms.value}
                backend={backends.value['bloom-search']}
              />
            ) : (
              'Loading...'
            )}
          </section>
          <section>
            {backends.value[selectedBackend.value] ? (
              <Engine
                title={
                  <select
                    class="text-xl font-extrabold"
                    value={selectedBackend.value}
                    onChange={(event: any) => {
                      selectedBackend.value = event.target?.value
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
                backend={backends.value[selectedBackend.value]}
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

render(<App />, document.getElementById('app')!)

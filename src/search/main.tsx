import { signal } from '@preact/signals'
import type { ComponentChild } from 'preact'
import { useEffect } from 'preact/hooks'
import { Search } from '../components/Search'
import { BASE, kb, mount } from '../site'
import { LIBRARIES, type SearchBackend } from './backends'

const backends = signal<Record<string, SearchBackend>>({})
const failed = signal<string[]>([])
const sizes = signal<Record<string, { size: number; gzippedSize: number }>>({})
const selectedBackend = signal('elasticlunr')
const searchTerms = signal('whale')

/** Fetches one index unless it is loaded already. Each is fetched only when it is first shown. */
function load(name: string) {
  const library = LIBRARIES.find((l) => l.name === name)
  if (!library || name in backends.value) return
  failed.value = failed.value.filter((n) => n !== name)
  library.load().then(
    (backend) => {
      backends.value = { ...backends.value, [name]: backend }
    },
    () => {
      failed.value = [...failed.value, name]
    },
  )
}

function titleOf(file: string): string {
  return file
    .replace(/\.txt$/, '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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
    <section class="min-w-0">
      <h2 class="flex items-baseline gap-3 text-3xl">
        {title}
        <a class="label text-base" href={backend.url}>
          npm
        </a>
      </h2>
      <p class="readout pt-1 text-ink-2">
        <span aria-live="polite" aria-atomic="true">
          <span class="sr-only">{backend.title}: </span>
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </span>{' '}
        in {latency} ms
      </p>
      {terms.length > 0 && results.length === 0 && (
        <p class="mt-4">No matches.</p>
      )}
      {results.length > 0 && (
        <ol class="mt-4">
          {results.map((file) => (
            <li key={file} class="border-b border-rule py-1.5">
              <a
                class="no-underline hover:underline"
                href={`${BASE}documents/${file}`}
              >
                {titleOf(file)}
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

/** Log scale, one row per library: filled square is the gzipped size, hollow the raw size. */
function SizeChart({
  all,
}: {
  all: Pick<SearchBackend, 'name' | 'title' | 'size' | 'gzippedSize'>[]
}) {
  const rows = [...all].sort((a, b) => a.gzippedSize - b.gzippedSize)
  const lo = Math.log10(100)
  const hi = Math.log10(20_000)
  const at = (bytes: number) =>
    `${((Math.log10(bytes / 1024) - lo) / (hi - lo)) * 100}%`
  const ticks = [
    { kb: 100, label: '100 KB' },
    { kb: 1000, label: '1 MB' },
    { kb: 10_000, label: '10 MB' },
  ]

  return (
    <figure class="mt-16">
      <figcaption class="label pb-2">Index size</figcaption>
      {/* Names sit in a column left of the plot (above it on phones). The right margin holds the figures after the last marker. */}
      <div class="relative">
        <div
          aria-hidden="true"
          class="pointer-events-none absolute inset-y-0 left-4 right-[11rem] sm:left-[8rem]"
        >
          {ticks.map(({ kb: tick, label }) => (
            <div
              key={label}
              class="absolute inset-y-0 border-l border-rule"
              style={{ left: at(tick * 1024) }}
            />
          ))}
        </div>
        <ol>
          {rows.map((row) => (
            <li
              key={row.name}
              class={`relative py-2 sm:grid sm:grid-cols-[7rem_1fr] sm:items-center sm:gap-x-4 ${row.name === 'bloom-search' ? 'text-accent' : ''}`}
            >
              <p
                class={`pl-6 sm:pl-0 ${row.name === 'bloom-search' ? 'font-semibold' : ''}`}
              >
                {row.title}
              </p>
              <div class="relative ml-4 mr-[11rem] mt-1 h-4 sm:ml-0 sm:mt-0">
                <div
                  aria-hidden="true"
                  class="absolute top-1/2 h-[3px] -translate-y-1/2 bg-current"
                  style={{
                    left: at(row.gzippedSize),
                    right: `calc(100% - ${at(row.size)})`,
                  }}
                />
                <div
                  aria-hidden="true"
                  class="absolute h-4 w-4 -translate-x-1/2 bg-current"
                  style={{ left: at(row.gzippedSize) }}
                />
                <div
                  aria-hidden="true"
                  class="absolute top-px h-3.5 w-3.5 -translate-x-1/2 border-2 border-current bg-paper"
                  style={{ left: at(row.size) }}
                />
                <span
                  class="readout absolute top-1/2 -translate-y-1/2 whitespace-nowrap"
                  style={{ left: `calc(${at(row.size)} + 1.25rem)` }}
                >
                  {kb(row.gzippedSize)} · {kb(row.size)}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div
        aria-hidden="true"
        class="relative ml-4 mr-[11rem] mt-2 h-6 text-xs text-ink-2 sm:ml-[8rem]"
      >
        {ticks.map(({ kb: tick, label }) => (
          <span
            key={label}
            class="absolute top-1 -translate-x-1/2 whitespace-nowrap"
            style={{ left: at(tick * 1024) }}
          >
            {label}
          </span>
        ))}
      </div>
      <p class="pt-5 text-sm text-ink-2">
        Filled square and first figure: gzipped. Hollow square and second
        figure: raw. Log scale.
      </p>
    </figure>
  )
}

function App() {
  useEffect(() => {
    load('bloom-search')
    load(selectedBackend.value)
    fetch(`${BASE}index-sizes.json`)
      .then((response) => response.json())
      .then((data) => {
        sizes.value = data.indexes
      })
      .catch(() => undefined)
  }, [])

  const bloomSearch = backends.value['bloom-search']
  const selected = backends.value[selectedBackend.value]
  const ready = bloomSearch != null
  const picker = (
    <select
      id="compare"
      class="field w-auto py-0.5 text-2xl font-medium"
      value={selectedBackend.value}
      onChange={(event) => {
        const target = event.target as HTMLSelectElement
        selectedBackend.value = target.value
        load(target.value)
      }}
    >
      {LIBRARIES.filter(({ name }) => name !== 'bloom-search').map(
        ({ name, title }) => (
          <option value={name}>{title}</option>
        ),
      )}
    </select>
  )
  const retry = (name: string) => (
    <button
      type="button"
      class="underline decoration-ink underline-offset-[0.2em] hover:decoration-2"
      onClick={() => load(name)}
    >
      Try again
    </button>
  )

  return (
    <>
      <Search
        id="search"
        label="Search the novels"
        placeholder="e.g. whale"
        value={searchTerms.value}
        disabled={!ready}
        onInput={(event) => {
          const target = event.target as HTMLInputElement
          searchTerms.value = target.value ?? ''
        }}
      />
      <div role="status">
        {!ready && !failed.value.includes('bloom-search') && (
          <p class="readout text-ink-2">
            Loading the Bloom Search index&hellip;
          </p>
        )}
      </div>
      {failed.value.includes('bloom-search') && (
        <p role="alert" class="mb-8">
          Could not load the Bloom Search index. {retry('bloom-search')}
        </p>
      )}
      {ready && (
        <div class="grid gap-x-12 gap-y-10 lg:grid-cols-2">
          <Engine
            title="Bloom Search"
            terms={searchTerms.value}
            backend={bloomSearch}
          />
          <div class="min-w-0">
            <label for="compare" class="sr-only">
              Compare with
            </label>
            {selected == null ? (
              <section>
                <h2 class="flex items-baseline gap-3 text-3xl">{picker}</h2>
                <p class="readout pt-1 text-ink-2">
                  {failed.value.includes(selectedBackend.value) ? (
                    <>
                      Could not load this index. {retry(selectedBackend.value)}
                    </>
                  ) : (
                    'Loading this index\u2026'
                  )}
                </p>
              </section>
            ) : (
              <Engine
                title={picker}
                terms={searchTerms.value}
                backend={selected}
              />
            )}
          </div>
        </div>
      )}
      <SizeChart
        all={LIBRARIES.filter(({ name }) => name in sizes.value).map(
          ({ name, title }) => ({ name, title, ...sizes.value[name] }),
        )}
      />
    </>
  )
}

mount(<App />)

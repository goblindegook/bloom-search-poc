import { decode } from '@msgpack/msgpack'
import { BloomSearch, type Index } from '@pacote/bloom-search'
import {
  Index as ElasticlunrIndex,
  type SerialisedIndexData,
} from 'elasticlunr'
import Fuse from 'fuse.js'
import lunr from 'lunr'
import MiniSearch from 'minisearch'
import { stemmer } from 'stemmer'
import { BASE } from '../site'

export type SearchBackend = {
  name: string
  title: string
  url: string
  size: number
  gzippedSize: number
  search(terms: string): string[]
}

type Store = Record<string, string>

type RawIndex<T> = {
  index: T
  store: Store
  size: number
  gzippedSize: number
}

/** One library: fetches its index on the first `load()`, retries after a failure. */
function library<T>(
  name: string,
  title: string,
  npm: string,
  build: (raw: RawIndex<T>) => (terms: string) => string[],
) {
  let loaded: Promise<SearchBackend> | undefined

  const load = () => {
    loaded ??= fetch(`${BASE}${name}.msgpack`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`)
        const raw = decode(await response.arrayBuffer()) as RawIndex<T>
        return {
          name,
          title,
          url: `https://www.npmjs.com/package/${npm}`,
          size: raw.size,
          gzippedSize: raw.gzippedSize,
          search: build(raw),
        }
      })
      .catch((error) => {
        loaded = undefined
        throw error
      })
    return loaded
  }

  return { name, title, load }
}

type R = { file: string }

export const LIBRARIES = [
  library<Index<R, keyof R>>(
    'bloom-search',
    'Bloom Search',
    '@pacote/bloom-search',
    ({ index }) => {
      const bs = new BloomSearch<R, keyof R, never>({
        errorRate: 0.0005,
        fields: ['file'],
        summary: ['file'],
        stemmer,
      })
      bs.load(index)
      return (terms) => bs.search(terms).map((result) => result.file)
    },
  ),
  library<SerialisedIndexData<object>>(
    'elasticlunr',
    'Elasticlunr',
    'elasticlunr',
    ({ index, store }) => {
      const idx = ElasticlunrIndex.load(index)
      return (terms) =>
        idx.search(terms).map((result: { ref: string }) => store[result.ref])
    },
  ),
  library<Parameters<typeof Fuse.parseIndex<{ content: string }>>[0]>(
    'fuse',
    'Fuse.js',
    'fuse.js',
    ({ index, store }) => {
      const fuse = new Fuse<{ content: string }>(
        [],
        { keys: ['content'], useExtendedSearch: true },
        Fuse.parseIndex(index),
      )
      return (terms) => {
        // Extended search: `'word` matches exactly, so every term must appear.
        const query = terms
          .split(/\s+/)
          .filter(Boolean)
          .map((part) => `'${part.replace(/'/g, '')}`)
          .join(' ')

        return query
          ? fuse
              .search(query)
              .map((result) => store[String(result.refIndex)])
              .filter(Boolean)
          : []
      }
    },
  ),
  library<object>('lunr', 'Lunr', 'lunr', ({ index, store }) => {
    const idx = lunr.Index.load(index)
    return (terms) => idx.search(terms).map((result) => store[result.ref])
  }),
  library<object>('minisearch', 'MiniSearch', 'minisearch', ({ index }) => {
    const idx = MiniSearch.loadJSON(JSON.stringify(index), {
      fields: ['file', 'content'],
      processTerm: (term) => stemmer(term),
    })
    return (terms) => idx.search(terms).map((result) => result.id)
  }),
]

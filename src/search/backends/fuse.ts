import Fuse from 'fuse.js'
import { fetchIndex, type SearchBackend, type Store } from './search'

type IndexedDocument = {
  content: string
}

type RawFuseIndex = Parameters<typeof Fuse.parseIndex<IndexedDocument>>[0]

let store: Store
let index: Fuse<IndexedDocument>
let size: number
let gzippedSize: number
let isLoading = false

export async function getFuse(): Promise<SearchBackend> {
  if (!isLoading && (store == null || index == null)) {
    isLoading = true
    const raw = await fetchIndex<RawFuseIndex>('fuse')
    store = raw.store
    const parsedIndex = Fuse.parseIndex<IndexedDocument>(raw.index)
    index = new Fuse<IndexedDocument>(
      [],
      {
        keys: ['content'],
        useExtendedSearch: true,
      },
      parsedIndex,
    )
    size = raw.size
    gzippedSize = raw.gzippedSize
    isLoading = false
  }

  return {
    name: 'fuse',
    title: 'Fuse.js',
    url: 'https://www.npmjs.com/package/fuse.js',
    search: (terms) => {
      const query = terms
        .trim()
        .split(/\s+/)
        .filter((part) => part.length > 0)
        .map((part) => `'${part.replace(/'/g, '')}`)
        .join(' ')

      if (query.length === 0) {
        return []
      }

      return index
        .search(query)
        .map((result) => store[String(result.refIndex)])
        .filter((file: string | undefined): file is string => file != null)
    },
    size,
    gzippedSize,
  }
}

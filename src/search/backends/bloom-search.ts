import { BloomSearch, DocumentIndex } from '@pacote/bloom-search'
import { stemmer } from 'stemmer'
import { SearchBackend, fetchIndex } from './search'

type R = { file: string }

let bs: BloomSearch<R, keyof R, never>
let size: number
let gzippedSize: number
let isLoading = false

export async function getBloomSearch(): Promise<SearchBackend> {
  if (!isLoading && bs == null) {
    isLoading = true
    const raw = await fetchIndex<DocumentIndex<R, keyof R>>('bloom-search')
    bs = new BloomSearch<R, keyof R, never>({
      errorRate: 0.005,
      fields: ['file'],
      summary: ['file'],
      stemmer,
    })
    bs.load(raw.index)
    size = raw.size
    gzippedSize = raw.gzippedSize
    isLoading = false
  }

  return {
    isLoading,
    name: 'bloom-search',
    title: 'Bloom Search',
    url: 'https://www.npmjs.com/package/@pacote/bloom-search',
    search: (terms) => bs.search(terms).map((result) => result.file),
    size,
    gzippedSize,
  }
}

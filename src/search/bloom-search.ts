import { BloomSearch, DocumentIndex } from '@pacote/bloom-search'
import { stemmer } from 'stemmer'
import { Search, fetchIndex } from './search'

type R = { file: string }

let bs: BloomSearch<R, keyof R, never>
let size: number
let gzippedSize: number

export async function getBloomSearch(): Promise<Search> {
  if (bs == null) {
    const raw = await fetchIndex<DocumentIndex<R, keyof R>>('bloom-search')
    bs = new BloomSearch<R, keyof R, never>({
      errorRate: 0.0001,
      fields: ['file'],
      summary: ['file'],
      stemmer,
    })
    bs.load(raw.index)
    size = raw.size
    gzippedSize = raw.gzippedSize
  }

  return {
    search: async (terms) => bs.search(terms).map((result) => result.file),
    size,
    gzippedSize,
  }
}

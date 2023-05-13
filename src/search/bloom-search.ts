import { BloomSearch, DocumentIndex } from '@pacote/bloom-search'
import { decode } from '@msgpack/msgpack'
import { stemmer } from 'stemmer'
import { RawIndex, Search } from './search'

type Result = { file: string }

let bs: BloomSearch<Result, keyof Result, never>
let size: number
let gzippedSize: number

export async function getBloomSearch(): Promise<Search> {
  if (bs == null) {
    const response = await fetch('/bloom-search-poc/bloom-search.msgpack')
    const buffer = await response.arrayBuffer()
    const raw = decode(buffer) as RawIndex<DocumentIndex<Result, keyof Result>>
    bs = new BloomSearch<Result, keyof Result, never>({
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

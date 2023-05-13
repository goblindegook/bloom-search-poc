import { decode } from '@msgpack/msgpack'
import elasticlunr from 'elasticlunr'

type Store = Record<string, string>

let store: Store
let index: elasticlunr.Index<{}>
let size = 0
let gzippedSize = 0

export async function getElasticlunr(): Promise<Search> {
  if (store == null || index == null) {
    const response = await fetch('/bloom-search-poc/elasticlunr.msgpack')
    const buffer = await response.arrayBuffer()
    const raw = decode(buffer) as {
      store: Store
      index: elasticlunr.SerialisedIndexData<{}>
      size: number
      gzippedSize: number
    }
    store = raw.store
    index = elasticlunr.Index.load(raw.index)
    size = raw.size
    gzippedSize = raw.gzippedSize
  }

  return {
    search: (terms) =>
      index.search(terms).map((result: { ref: string }) => store[result.ref]),
    size,
    gzippedSize,
  }
}

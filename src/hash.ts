import { xxh64 } from '@pacote/xxhash'

const h1 = xxh64(0)
const h2 = xxh64(1)

function toUint32(hex: string): number {
  return parseInt(hex.substring(8, 16), 16)
}

export function hash(i: number, data: string): number {
  const d1 = toUint32(h1.update(data).digest('hex'))
  const d2 = toUint32(h2.update(data).digest('hex'))
  return d1 + i * d2 + i ** 3
}

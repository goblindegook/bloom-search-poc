import { range } from '@pacote/array'
import { xxh64 } from '@pacote/xxhash'
import { signal } from '@preact/signals'
import cx from 'clsx'
import type { ComponentProps } from 'preact'
import { Search } from './Search'

const h1 = xxh64(0)
const h2 = xxh64(1)

const toUint32 = (hex: string) => parseInt(hex.substring(8, 16), 16)

/** Double hashing: the i-th of any number of hash functions from two xxHash64 digests. */
function hash(i: number, data: string): number {
  const d1 = toUint32(h1.update(data).digest('hex'))
  const d2 = toUint32(h2.update(data).digest('hex'))
  return d1 + i * d2 + i ** 3
}

function Field({
  id,
  label,
  ...props
}: ComponentProps<'input'> & { id: string; label: string }) {
  return (
    <div class="pb-5">
      <label for={id} class="label mb-1 block">
        {label}
      </label>
      <input class="field" id={id} {...props} />
    </div>
  )
}

type Probe = { word: string; hashes: number[] }

const NONE: Probe = { word: '', hashes: [] }

// One page per bundle, so the state can live at module level.
const size = signal(100)
const hashes = signal(3)
const words = signal<string[]>([])
/** Per position: how many words touch it. A plain Bloom filter only reads "above zero". */
const filter = signal<number[]>(Array(size.value).fill(0))
const highlighted = signal<Probe & { index: number }>({ ...NONE, index: -1 })
const searched = signal<Probe>(NONE)

const computeHashes = (token: string) =>
  range(0, hashes.value).map((i) => hash(i, token) % size.value)

const reset = () => {
  words.value = []
  filter.value = Array(size.value).fill(0)
  highlighted.value = { ...NONE, index: -1 }
}

/** Adds `delta` to every position a word touches. */
const touch = (word: string, delta: number) => {
  const next = [...filter.value]
  for (const location of computeHashes(word)) next[location] += delta
  filter.value = next
}

/** A Bloom filter you fill by hand. With `counting`, positions are counters and words can be removed. */
export function FilterDemo({ counting }: { counting: boolean }) {
  const unit = counting ? 'counter' : 'bit'

  const isWordSearched = searched.value.word.length > 0
  const lowest = Math.min(...searched.value.hashes.map((i) => filter.value[i]))
  const unset = [...new Set(searched.value.hashes)]
    .filter((i) => !filter.value[i])
    .sort((a, b) => a - b)
  const unsetList =
    unset.length < 2
      ? unset.join('')
      : `${unset.slice(0, -1).join(', ')} and ${unset[unset.length - 1]}`
  const plural = unset.length === 1 ? '' : 's'

  const numberField = (
    id: string,
    label: string,
    signalValue: typeof size | typeof hashes,
    max: number,
  ) => (
    <Field
      id={id}
      label={label}
      onChange={(event) => {
        const target = event.target as HTMLInputElement
        const n = parseInt(target.value, 10)
        // An empty or invalid field keeps the current value instead of breaking the filter.
        if (!Number.isNaN(n)) {
          signalValue.value = Math.min(max, Math.max(1, n))
          reset()
        }
        target.value = String(signalValue.value)
      }}
      value={signalValue}
      type="number"
      min={1}
      max={max}
    />
  )

  return (
    <div class="spread">
      <aside>
        {numberField('size', `Size (${unit}s)`, size, 1000)}
        {numberField('hashes', 'Hash functions', hashes, 16)}

        <ul>
          {words.value.map((word, index) => {
            const isHighlighted = index === highlighted.value.index
            return (
              <li
                key={index}
                class="flex items-baseline justify-between border-b border-rule"
              >
                <button
                  type="button"
                  aria-pressed={isHighlighted}
                  class={cx(
                    'min-h-[2.75rem] flex-1 text-left',
                    isHighlighted
                      ? 'font-semibold text-accent'
                      : 'hover:text-accent',
                  )}
                  onClick={() => {
                    highlighted.value = isHighlighted
                      ? { ...NONE, index: -1 }
                      : { word, index, hashes: computeHashes(word) }
                  }}
                >
                  {word}
                </button>
                {counting && (
                  <button
                    type="button"
                    aria-label={`Remove ${word}`}
                    class="min-h-[2.75rem] min-w-[2.75rem] text-ink-2 hover:text-accent"
                    onClick={() => {
                      touch(word, -1)
                      words.value = words.value.filter((_, i) => i !== index)
                      highlighted.value = { ...NONE, index: -1 }
                    }}
                  >
                    &times;
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </aside>
      <div>
        <div class="grid gap-x-8 lg:grid-cols-2">
          <Search
            id="add"
            label="Add a word"
            placeholder="e.g. whale"
            magnifier={false}
            type="text"
            onKeyUp={(event) => {
              if (event.key !== 'Enter') return
              const target = event.target as HTMLInputElement
              const word = target.value
              if (word.length > 0) {
                touch(word, 1)
                words.value = [...words.value, word]
                highlighted.value = {
                  word,
                  index: words.value.length - 1,
                  hashes: computeHashes(word),
                }
              }
              target.value = ''
            }}
          >
            <p class="min-h-[3rem] pt-3 text-ink-2">
              {counting
                ? 'Press Enter to add. Each cell counts the words touching it, so a word can be removed with ×.'
                : 'Press Enter to add. Each word sets one bit per hash function. Select a word to see which bits it set.'}
            </p>
          </Search>
          <Search
            id="search"
            label="Look up a word"
            placeholder="e.g. whale"
            onInput={(event) => {
              const word = (event.target as HTMLInputElement).value
              searched.value = {
                word,
                hashes: word.length ? computeHashes(word) : [],
              }
            }}
          >
            <p role="status" class="min-h-[3rem] pt-3">
              {isWordSearched &&
                (lowest > 0 ? (
                  <>
                    <strong class="font-semibold text-accent">
                      Possible match.
                    </strong>{' '}
                    {counting ? (
                      <>
                        The lowest of the {searched.value.hashes.length}{' '}
                        counters for &ldquo;{searched.value.word}&rdquo; is{' '}
                        {lowest}, so it may have been added up to {lowest}{' '}
                        {lowest === 1 ? 'time' : 'times'}.
                      </>
                    ) : (
                      <>
                        All {searched.value.hashes.length} bits for &ldquo;
                        {searched.value.word}&rdquo; are set, so it may have
                        been added.
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <strong class="font-semibold">Certain miss.</strong>{' '}
                    {unit === 'bit' ? 'Bit' : 'Counter'}
                    {plural} {unsetList} for &ldquo;
                    <s>{searched.value.word}</s>&rdquo;{' '}
                    {unset.length === 1 ? 'is' : 'are'}{' '}
                    {counting ? 'zero' : 'not set'}, so it was never added.
                  </>
                ))}
            </p>
          </Search>
        </div>

        <ul class="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] pl-px pt-px">
          {filter.value.map((count, index) => {
            const isSet = count > 0
            const isProbed =
              isWordSearched && searched.value.hashes.includes(index)
            return (
              <li
                key={index}
                class="bit"
                data-set={isSet}
                data-hit={
                  highlighted.value.hashes.includes(index) ? 'true' : undefined
                }
                data-probe={isProbed ? (isSet ? 'set' : 'unset') : undefined}
              >
                <span class="readout absolute left-1 top-0.5 text-[0.65rem] leading-none opacity-80">
                  {index}
                </span>
                {counting && isSet && (
                  <span class="readout absolute inset-0 grid place-items-center text-base font-semibold">
                    {count}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
        <p class="pt-4 text-ink-2">
          {counting
            ? 'Number: words touching the cell. Red: touched by the selected word. Solid frame: the lookup checked this counter and it is above zero. Dashed frame: checked and zero.'
            : 'Filled: bit is set. Red: set by the selected word. Solid frame: the lookup checked this bit and it is set. Dashed frame: checked and not set.'}
        </p>
      </div>
    </div>
  )
}

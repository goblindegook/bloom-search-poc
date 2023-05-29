import './style.css'
import React from 'preact/compat'
import { render } from 'preact'
import { signal } from '@preact/signals'
import { hashLocations } from '@pacote/bloom-filter/src/hash'
import cx from 'classnames'

const n = signal<number>(100)
const hashes = signal<number>(3)
const words = signal<string[]>([])
const filter = signal<boolean[]>(Array(n.value).fill(false))
const added = signal<{ word: string; hashes: number[] }>({
  word: '',
  hashes: [],
})
const highlighted = signal<{ word: string; hashes: number[] }>({
  word: '',
  hashes: [],
})
const searched = signal<{ word: string; hashes: number[] }>({
  word: '',
  hashes: [],
})

function App() {
  const computeHashes = hashLocations(n.value, hashes.value, 0)

  const reset = () => {
    words.value = []
    filter.value = Array(n.value).fill(false)
    added.value = { word: '', hashes: [] }
    highlighted.value = { word: '', hashes: [] }
  }

  return (
    <>
      <h1>Bloom Filter</h1>
      <div class="config">
        <label>
          <span>Size</span>
          <input
            onChange={(event: any) => {
              n.value = Number(event.target.value)
              reset()
            }}
            value={n}
            type="number"
          />
        </label>
        <label>
          <span>Hashes</span>
          <input
            onChange={(event: any) => {
              hashes.value = Number(event.target.value)
              reset()
            }}
            value={hashes}
            type="number"
          />
        </label>
      </div>
      <div class="add">
        <label>
          Add
          <input
            onKeyUp={(event: any) => {
              if (event.key === 'Enter') {
                const word = event.target.value
                const locations = computeHashes(word)
                words.value = words.value.concat(word)
                locations.forEach((location) => {
                  filter.value[location] = true
                })
                added.value = { word, hashes: locations }
                event.target.value = ''
              }
            }}
          />
        </label>
        <div class="last-word">
          <>{added.value.word}</>
          <ul class="added-hashes">
            {added.value.hashes.map((value) => (
              <li class="added-hash">{value}</li>
            ))}
          </ul>
        </div>
      </div>
      <div class="added-words">
        {words.value.map((word) => (
          <div
            class={cx('added-word', {
              highlighted: word === highlighted.value.word,
            })}
          >
            <button
              onClick={(event) => {
                if (word === highlighted.value.word) {
                  highlighted.value = { word: '', hashes: [] }
                } else {
                  highlighted.value = { word, hashes: computeHashes(word) }
                }
                event.preventDefault()
              }}
            >
              {word}
            </button>
            {/* <button
              onClick={(event) => {
                words.value = words.value
                  .slice(0, index)
                  .concat(words.value.slice(index + 1, words.value.length))
                event.preventDefault()
              }}
            >
              X
            </button> */}
          </div>
        ))}
      </div>
      <ul class="filter">
        {filter.value.map((value, index) => (
          <li
            class={cx({
              location: true,
              on: value,
              off: !value,
              highlighted: highlighted.value.hashes.includes(index),
              added: added.value.hashes.includes(index),
              searched:
                searched.value.hashes.length > 0 &&
                searched.value.hashes.includes(index),
            })}
          >
            <span class="index">{index}</span>
          </li>
        ))}
      </ul>

      <label>
        Search
        <input
          onKeyUp={(event: any) => {
            const word = event.target.value
            if (word.length) {
              searched.value = { word, hashes: computeHashes(word) }
            } else {
              searched.value = { word, hashes: [] }
            }
          }}
        />
      </label>

      {searched.value.word !== '' && (
        <>
          {searched.value.hashes.every((index) => filter.value[index])
            ? 'Probably there.'
            : 'Definitely not there.'}
        </>
      )}
    </>
  )
}

render(<App />, document.getElementById('app')!)

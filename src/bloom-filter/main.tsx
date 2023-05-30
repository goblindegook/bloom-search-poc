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
const highlighted = signal<{ word: string; hashes: number[] }>({
  word: '',
  hashes: [],
})
const searched = signal<{ word: string; hashes: number[] }>({
  word: '',
  hashes: [],
})

type InputProps = React.JSX.HTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
}

const Input = ({ id, label, ...props }: InputProps) => (
  <div class="pb-6">
    <label for={id} class="block mb-2 text-sm font-medium text-gray-900">
      {label}
    </label>
    <input
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      id={id}
      {...props}
    />
  </div>
)

function App() {
  const computeHashes = hashLocations(n.value, hashes.value, 0)

  const reset = () => {
    words.value = []
    filter.value = Array(n.value).fill(false)
    highlighted.value = { word: '', hashes: [] }
  }

  const isWordSearched = searched.value.word.length > 0
  const isWordFound = searched.value.hashes.every(
    (index) => filter.value[index]
  )

  return (
    <div class="p-8">
      <h1 class="text-4xl font-extrabold leading-none tracking-tight text-gray-900 pb-8">
        Bloom Filter
      </h1>

      <div class="grid grid-cols-4 gap-8">
        <div class="bg-gray-100 p-8 rounded-lg shadow-sm">
          <Input
            id="size"
            label="Size"
            onChange={(event: any) => {
              n.value = Number(event.target.value)
              reset()
            }}
            value={n}
            type="number"
          />
          <Input
            id="hashes"
            label="Hashes"
            onChange={(event: any) => {
              hashes.value = Number(event.target.value)
              reset()
            }}
            value={hashes}
            type="number"
          />
          <Input
            id="add"
            label="Add Text"
            onKeyUp={(event: any) => {
              if (event.key === 'Enter') {
                const word = event.target.value
                const locations = computeHashes(word)
                words.value = words.value.concat(word)
                locations.forEach((location) => {
                  filter.value[location] = true
                })
                highlighted.value = { word, hashes: locations }
                event.target.value = ''
              }
            }}
          />

          <ul>
            {words.value.map((word) => (
              <li class="inline">
                <button
                  class={cx(
                    'border focus:outline-none focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-4 py-1 mr-2 mb-2',
                    highlighted.value.word === word
                      ? 'text-white border-yellow-400 bg-yellow-400 hover:bg-yellow-300'
                      : 'text-gray-900 border-gray-300 bg-white hover:bg-gray-100'
                  )}
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
              </li>
            ))}
          </ul>
        </div>

        <div class="col-span-3">
          <div class="mb-6 relative">
            <label for="search" class="sr-only">
              Search
            </label>
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                aria-hidden="true"
                class="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              id="search"
              onKeyUp={(event: any) => {
                const word = event.target.value
                if (word.length) {
                  searched.value = { word, hashes: computeHashes(word) }
                } else {
                  searched.value = { word, hashes: [] }
                }
              }}
              class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            />
            {isWordSearched && (
              <div
                class={cx(
                  'text-white absolute right-2.5 bottom-2.5 font-medium rounded-lg text-sm px-4 py-2',
                  isWordFound ? 'bg-emerald-700' : 'bg-rose-700'
                )}
              >
                {isWordFound ? 'Probably found' : 'Definitely missing'}
              </div>
            )}
          </div>

          <ul class="grid grid-cols-10 justify-evenly justify-items-center gap-4 m-12">
            {filter.value.map((value, index) => {
              const isSearched =
                isWordSearched && searched.value.hashes.includes(index)
              const isHighlighted = highlighted.value.hashes.includes(index)
              return (
                <li
                  class={cx(
                    'border-4 rounded-md shadow-md h-12 w-12 relative',
                    {
                      'bg-yellow-400': isHighlighted,
                      'bg-slate-200': !value,
                      'bg-slate-500': !isHighlighted && value,
                    },
                    isSearched
                      ? {
                          'border-emerald-400': value,
                          'border-rose-600': !value,
                        }
                      : 'border-transparent'
                  )}
                >
                  <div class="absolute shadow-md bottom-0 right-0 rounded-full bg-white p-1 text-xs text-slate-600 text-center align-baseline w-6 h-6 translate-y-1/2 translate-x-1/2">
                    {index}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

render(<App />, document.getElementById('app')!)

import './style.css'
import { signal } from '@preact/signals'
import { render } from 'preact'
import { stemmer } from 'stemmer'
import { Input } from '../components/Input'
import { Navigation } from '../components/Navigation'

const term = signal('example')

function App() {
  return (
    <>
      <Navigation />
      <div class="p-8">
        <h1 class="text-4xl font-extrabold leading-none tracking-tight text-gray-900 pb-8">
          Stemmer
        </h1>
        <div class="grid grid-cols-[1fr_2rem_1fr] gap-8">
          <Input
            id="term"
            onKeyUp={(event) => {
              const target = event.target as HTMLInputElement
              term.value = target.value ?? ''
            }}
            value={term}
            type="text"
          />
          <div class="text-3xl leading-none tracking-tight text-gray-400 text-center align-middle">
            &rarr;
          </div>
          <div class="text-xl">{stemmer(term.value)}</div>
        </div>
      </div>
    </>
  )
}

// biome-ignore lint/style/noNonNullAssertion: exists
render(<App />, document.getElementById('app')!)

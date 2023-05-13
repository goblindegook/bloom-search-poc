import './style.css'
import { getBloomSearch } from './search/bloom-search'
import { getLunr } from './search/lunr'
import { getElasticlunr } from './search/elasticlunr'

const input = document.querySelector('#search') as HTMLInputElement

input.addEventListener('input', searchHandler)
input.addEventListener('change', searchHandler)
input.addEventListener('keyup', searchHandler)
input.addEventListener('click', searchHandler)

async function searchHandler(event: Event): Promise<void> {
  const terms = (event.target as HTMLInputElement).value || ''

  const searches: Record<string, Search> = {
    'bloom-search': await getBloomSearch(),
    elasticlunr: await getElasticlunr(),
    lunr: await getLunr(),
  }

  Object.entries(searches).forEach(([name, index]) => {
    const start = Number(new Date())
    const results = index.search(terms)
    const finish = Number(new Date())
    const latency = finish - start

    renderSummary(`#${name}-summary`, results, latency)
    renderResults(`#${name}-results`, results)
  })
}

function renderSummary(
  selector: string,
  results: string[],
  latency: number
): void {
  const container = document.querySelector(selector)
  if (container) {
    container.innerHTML = `${results.length} results, ${latency}ms`
  }
}

function renderResults(selector: string, files: string[]): void {
  const container = document.querySelector(selector)
  if (container) {
    container.innerHTML = files.reduce(
      (html, file) =>
        html +
        `<li>
          <article class="search-result-single">
            <a href="/bloom-search-poc/documents/${file}">${file}</a>
          </article>
        </li>`,
      ''
    )
  }
}

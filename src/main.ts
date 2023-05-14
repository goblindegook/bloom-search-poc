import './style.css'
import { Search } from './search/search'
import { getBloomSearch } from './search/bloom-search'
import { getLunr } from './search/lunr'
import { getElasticlunr } from './search/elasticlunr'
import { getMiniSearch } from './search/minisearch'

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
    minisearch: await getMiniSearch(),
  }

  Object.entries(searches).forEach(async ([name, index]) => {
    const start = Number(new Date())
    const results = await index.search(terms)
    const finish = Number(new Date())
    const latency = finish - start

    renderSummary(
      `#${name}-summary`,
      results,
      latency,
      index.size,
      index.gzippedSize
    )
    renderResults(`#${name}-results`, results)
  })
}

function renderSummary(
  selector: string,
  results: string[],
  latency: number,
  size: number,
  gzippedSize: number
): void {
  const container = document.querySelector(selector)
  if (container) {
    container.innerHTML = `
      ${kb(size)} (${kb(gzippedSize)} gzipped)<br>
      ${results.length} results, ${latency}ms
    `
  }
}

function kb(size: number): string {
  return (size / 1024).toFixed(2) + ' KB'
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

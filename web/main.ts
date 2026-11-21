import './styles.css'
import type { Algorithm } from '../src/index.js'
import { DATASET } from './data.js'
import { buildViewModel, toSegments, type ViewModel, type ViewOptions } from './model.js'

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id)
  if (!node) throw new Error(`missing element #${id}`)
  return node as T
}

const queryInput = el<HTMLInputElement>('query')
const clearBtn = el<HTMLButtonElement>('clear')
const algorithmSelect = el<HTMLSelectElement>('algorithm')
const thresholdInput = el<HTMLInputElement>('threshold')
const thresholdValue = el<HTMLOutputElement>('threshold-value')
const limitInput = el<HTMLInputElement>('limit')
const limitValue = el<HTMLOutputElement>('limit-value')
const caseInput = el<HTMLInputElement>('case-insensitive')
const resultsList = el<HTMLOListElement>('results')
const resultsCount = el<HTMLSpanElement>('results-count')
const resultsNote = el<HTMLSpanElement>('results-note')
const emptyState = el<HTMLParagraphElement>('empty-state')

let activeIndex = -1

function currentOptions(): ViewOptions {
  return {
    algorithm: algorithmSelect.value as Algorithm,
    threshold: Number(thresholdInput.value),
    limit: Number(limitInput.value),
    caseInsensitive: caseInput.checked,
  }
}

function renderLabel(row: ViewModel['rows'][number]): HTMLSpanElement {
  const span = document.createElement('span')
  span.className = 'label'
  for (const segment of toSegments(row.text, row.highlight)) {
    if (segment.matched) {
      const mark = document.createElement('mark')
      mark.textContent = segment.text
      span.appendChild(mark)
    } else {
      span.appendChild(document.createTextNode(segment.text))
    }
  }
  return span
}

function render(model: ViewModel): void {
  resultsList.replaceChildren()
  activeIndex = -1

  if (model.preview) {
    resultsCount.textContent = `${DATASET.length} items`
    resultsNote.textContent = 'Start typing to rank them.'
  } else {
    resultsCount.textContent = `${model.rows.length} ${model.rows.length === 1 ? 'match' : 'matches'}`
    resultsNote.textContent = `of ${model.total}, ranked by ${algorithmSelect.options[algorithmSelect.selectedIndex].text}`
  }

  const noResults = model.rows.length === 0 && !model.preview
  emptyState.hidden = !noResults

  model.rows.forEach((row, index) => {
    const li = document.createElement('li')
    li.className = 'result'
    li.dataset.index = String(index)

    const rank = document.createElement('span')
    rank.className = 'rank'
    rank.textContent = String(index + 1)

    const label = renderLabel(row)

    const score = document.createElement('span')
    score.className = 'score'
    if (!model.preview) {
      const bar = document.createElement('span')
      bar.className = 'score-bar'
      const fill = document.createElement('span')
      fill.style.width = `${row.percent}%`
      bar.appendChild(fill)
      const pct = document.createElement('span')
      pct.className = 'score-pct'
      pct.textContent = `${row.percent}%`
      score.append(bar, pct)
    }

    li.append(rank, label, score)
    li.addEventListener('mousemove', () => setActive(index))
    resultsList.appendChild(li)
  })
}

function setActive(index: number): void {
  const items = Array.from(resultsList.children) as HTMLElement[]
  if (items.length === 0) return
  activeIndex = Math.max(0, Math.min(index, items.length - 1))
  items.forEach((item, i) => item.classList.toggle('is-active', i === activeIndex))
  items[activeIndex]?.scrollIntoView({ block: 'nearest' })
}

function update(options: { pushHash?: boolean } = {}): void {
  const query = queryInput.value
  clearBtn.hidden = query.length === 0
  render(buildViewModel(query, DATASET, currentOptions()))
  if (options.pushHash !== false) {
    const trimmed = query.trim()
    const hash = trimmed ? `#q=${encodeURIComponent(trimmed)}` : ''
    history.replaceState(null, '', `${location.pathname}${location.search}${hash}`)
  }
}

function readInitialQuery(): string {
  const params = new URLSearchParams(location.search)
  const fromSearch = params.get('q')
  if (fromSearch) return fromSearch
  const hash = location.hash.replace(/^#/, '')
  const hashParams = new URLSearchParams(hash)
  return hashParams.get('q') ?? ''
}

// Wire up controls.
queryInput.addEventListener('input', () => update())
clearBtn.addEventListener('click', () => {
  queryInput.value = ''
  queryInput.focus()
  update()
})
algorithmSelect.addEventListener('change', () => update())
caseInput.addEventListener('change', () => update())
thresholdInput.addEventListener('input', () => {
  thresholdValue.textContent = Number(thresholdInput.value).toFixed(2)
  update()
})
limitInput.addEventListener('input', () => {
  limitValue.textContent = limitInput.value
  update()
})

// Keyboard navigation over the result list.
queryInput.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    setActive(activeIndex + 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    setActive(activeIndex <= 0 ? resultsList.children.length - 1 : activeIndex - 1)
  }
})

// Initial paint, honouring ?q= or #q= so the explorer is shareable and screenshot-friendly.
thresholdValue.textContent = Number(thresholdInput.value).toFixed(2)
limitValue.textContent = limitInput.value
queryInput.value = readInitialQuery()
update({ pushHash: false })
queryInput.focus()

import { search, type Algorithm, type SearchResult } from '../src/index.js'

/** Options the explorer UI collects and feeds straight into the library's `search`. */
export interface ViewOptions {
  algorithm: Algorithm
  threshold: number
  limit: number
  caseInsensitive: boolean
}

/** A single ranked row, ready to render. `highlight` holds indices into `text`, not DOM. */
export interface ViewRow {
  text: string
  /** Similarity in 0–1 as returned by the library. */
  score: number
  /** `score` as a rounded 0–100 percentage, for display. */
  percent: number
  /** Indices of the characters in `text` matched by the subsequence highlighter. */
  highlight: number[]
}

export interface ViewModel {
  query: string
  rows: ViewRow[]
  /** How many items were searched (the full dataset size). */
  total: number
  /** True when the query was empty and `rows` is just a preview of the dataset. */
  preview: boolean
}

/**
 * Greedy, case-insensitive subsequence match used purely for visual highlighting. Scanning `target`
 * left to right, it marks the first run of characters that spell out `query` in order and returns
 * their indices in `target`. If `query` is not a subsequence of `target` — or either string is
 * empty — it returns an empty array. This is deliberately separate from the library's numeric
 * similarity scoring: it answers "which letters do I underline?", not "how close is this?".
 */
export function highlightIndices(query: string, target: string): number[] {
  if (query.length === 0 || target.length === 0) return []
  const q = query.toLowerCase()
  const t = target.toLowerCase()
  const indices: number[] = []
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      indices.push(ti)
      qi++
    }
  }
  return qi === q.length ? indices : []
}

/**
 * Turn a query plus the current control settings into a ranked, render-ready view model. All of the
 * ranking is delegated to `fuzzykit.search`; this layer only maps results to rows and attaches the
 * highlight indices. With an empty query it returns a capped preview of the dataset so the UI has
 * something to show on first paint.
 */
export function buildViewModel(query: string, items: readonly string[], options: ViewOptions): ViewModel {
  const trimmed = query.trim()
  const limit = Math.max(0, Math.floor(options.limit))

  if (trimmed.length === 0) {
    const rows: ViewRow[] = items.slice(0, limit).map((text) => ({
      text,
      score: 0,
      percent: 0,
      highlight: [],
    }))
    return { query: '', rows, total: items.length, preview: true }
  }

  const results = search(trimmed, items, {
    algorithm: options.algorithm,
    threshold: options.threshold,
    limit,
    caseInsensitive: options.caseInsensitive,
  })

  const rows: ViewRow[] = results.map((result: SearchResult<string>) => ({
    text: result.item,
    score: result.score,
    percent: Math.round(result.score * 100),
    highlight: highlightIndices(trimmed, result.item),
  }))

  return { query: trimmed, rows, total: items.length, preview: false }
}

/**
 * Split a string into alternating unmatched / matched segments based on a sorted list of highlight
 * indices. Useful for rendering without touching the DOM from this module: the caller decides how to
 * present each segment. Returned in order; `matched` segments carry the highlighted characters.
 */
export interface Segment {
  text: string
  matched: boolean
}

export function toSegments(text: string, highlight: number[]): Segment[] {
  if (highlight.length === 0) return text.length ? [{ text, matched: false }] : []
  const marked = new Set(highlight)
  const segments: Segment[] = []
  let buffer = ''
  let bufferMatched = marked.has(0)
  for (let i = 0; i < text.length; i++) {
    const isMatch = marked.has(i)
    if (isMatch === bufferMatched) {
      buffer += text[i]
    } else {
      if (buffer) segments.push({ text: buffer, matched: bufferMatched })
      buffer = text[i]
      bufferMatched = isMatch
    }
  }
  if (buffer) segments.push({ text: buffer, matched: bufferMatched })
  return segments
}

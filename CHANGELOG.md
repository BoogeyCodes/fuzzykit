# Changelog

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0]

### Added
- **Interactive explorer app** (`web/`): a Vite + vanilla-TS single-page app built on the library.
  Live ranking of a few-hundred-item catalogue as you type, an algorithm selector, threshold slider,
  limit and case-insensitive toggle, per-result score bars and percentages, and matched-character
  highlighting. The query is reflected in the URL (`?q=` / `#q=`). Dark, teal, responsive and
  keyboard-navigable.
- DOM-free, unit-tested view-model module (`web/model.ts`) with a greedy case-insensitive subsequence
  highlighter, covered by `test/model.test.ts`.
- `jaccardSimilarity(a, b)` — Jaccard index over the set of character bigrams, a stricter,
  repeat-insensitive companion to the Dice coefficient.
- Tooling: Vite scripts (`dev`, `build:web`, `preview`, `typecheck:web`), a multi-stage nginx
  `Dockerfile`, and CI now also runs the web typecheck and build on every leg.

### Notes
- The library is unchanged in behaviour and API; the explorer is development-only and is excluded
  from the published npm package.

## [0.1.0]

### Added
- Levenshtein (2-row), Jaro-Winkler and Sorensen-Dice similarity.
- Ranked `search()` and `bestMatch()`; dual ESM/CJS build.

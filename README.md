# fuzzykit

[![CI](https://github.com/BoogeyCodes/fuzzykit/actions/workflows/ci.yml/badge.svg)](https://github.com/BoogeyCodes/fuzzykit/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-success)
![ESM + CJS](https://img.shields.io/badge/module-ESM%20%2B%20CJS-blue)
![License: MIT](https://img.shields.io/badge/license-MIT-green)

String similarity and fuzzy search for TypeScript, with no runtime dependencies. Three well-known
similarity measures and a ranked search built on top, so you can answer "did you mean …?" in a few
lines.

```ts
import { search } from 'fuzzykit'

const commands = ['commit', 'checkout', 'clone', 'branch', 'merge', 'rebase', 'status']

search('chekout', commands, { limit: 3 })
// [ { item: 'checkout', score: 0.97 }, { item: 'cherry-pick', score: 0.70 }, ... ]
```

## Why

"Did you mean?", typo-tolerant filters, record linkage, autocomplete ranking — they all come down to
"how similar are these two strings, and which candidates are closest?". fuzzykit provides the three
measures you reach for most, each implemented from its definition and tested against the canonical
reference values, plus a small `search` that ranks a list for you. It is dependency-free and ships as
both ESM and CommonJS.

## The measures

| Function | What it measures | Best for |
| --- | --- | --- |
| `levenshtein` / `levenshteinSimilarity` | Minimum single-character edits | general-purpose, typos |
| `jaro` / `jaroWinkler` | Matching characters, transpositions, shared prefix | short strings, names |
| `diceCoefficient` | Shared adjacent-letter pairs (bigrams) | longer phrases, word order |

```ts
import { levenshtein, jaroWinkler, diceCoefficient } from 'fuzzykit'

levenshtein('kitten', 'sitting')        // 3
jaroWinkler('MARTHA', 'MARHTA')         // 0.961
diceCoefficient('healed', 'sealed')     // 0.8
```

Every similarity function returns a value in `0–1` (`1` is identical); `levenshtein` itself returns
the raw edit distance, with `levenshteinSimilarity` for the normalised form.

## Fuzzy search

```ts
import { search, bestMatch } from 'fuzzykit'

// strings
search('aple', ['apple', 'maple', 'grape'])            // apple first

// objects, by a key
const users = [{ name: 'Alice Johnson' }, { name: 'Alicia Jones' }]
search('alice', users, { key: (u) => u.name })

// the single closest match, or null
bestMatch('bananna', ['banana', 'panama'])             // { item: 'banana', score: ... }
```

Options:

| Option | Default | Meaning |
| --- | --- | --- |
| `key` | — | For objects, the field to match against |
| `algorithm` | `'jaro-winkler'` | `'jaro-winkler'`, `'dice'` or `'levenshtein'` |
| `threshold` | `0.3` | Drop results scoring below this |
| `limit` | all | Keep at most this many |
| `caseInsensitive` | `true` | Lower-case both sides before comparing |

A case-insensitive **substring** match scores a perfect `1`, so exact and prefix matches always rank
above approximate ones.

## Install

```bash
npm install fuzzykit
```

Node 18+. Ships as ESM and CommonJS with type definitions. No runtime dependencies.

## Implementation notes

- **Levenshtein** uses the two-row dynamic-programming recurrence, so memory is `O(min(a, b))` rather
  than the full matrix.
- **Jaro–Winkler** counts matches within the standard sliding window, halves the transpositions, and
  boosts a shared prefix of up to four characters.
- **Dice** counts shared bigrams by multiplicity (a repeated pair matches as many times as it
  appears), not mere presence.
- **Jaccard** compares the *sets* of distinct bigrams: shared pairs over the union of pairs. Order-
  insensitive like Dice, but it ignores repeats.

## Development

```bash
npm install
npm run typecheck
npm test            # 23 tests across the three measures and the search
npm run build       # ESM + CJS + .d.ts via tsup
```

Each measure is tested against its textbook reference values (`jaro('MARTHA','MARHTA') ≈ 0.944`,
`levenshtein('kitten','sitting') = 3`, `dice('night','nacht') = 0.25`), plus symmetry, empty-string
and edge cases, and the search ranking behaviour. CI runs on Linux and Windows across Node 18/20/22.

## License

MIT

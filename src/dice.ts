/**
 * Sørensen–Dice coefficient over character bigrams: twice the number of shared adjacent-letter pairs
 * divided by the total number of pairs. It is forgiving of word order and insertions, which makes it
 * good for comparing longer phrases.
 */
export function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0

  const bigrams = new Map<string, number>()
  for (let i = 0; i < a.length - 1; i++) {
    const bigram = a.slice(i, i + 2)
    bigrams.set(bigram, (bigrams.get(bigram) ?? 0) + 1)
  }

  let intersection = 0
  for (let i = 0; i < b.length - 1; i++) {
    const bigram = b.slice(i, i + 2)
    const count = bigrams.get(bigram) ?? 0
    if (count > 0) {
      bigrams.set(bigram, count - 1)
      intersection++
    }
  }

  return (2 * intersection) / (a.length - 1 + (b.length - 1))
}

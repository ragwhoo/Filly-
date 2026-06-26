import type { FieldCandidate, MatchingStrategy, ProfileKey } from '~/types'
import { normalize } from '~/lib/fields'
import { ALIAS_MAP, ALIAS_VALUES } from '~/lib/aliases'

const WEIGHTS: Record<string, number> = {
  name: 100,
  id: 80,
  autocomplete: 80,
  ariaLabel: 60,
  placeholder: 40,
  labelText: 30,
  dataset: 20,
}

const MIN_SCORE = 40

export class AliasMatchingStrategy implements MatchingStrategy {
  match(field: FieldCandidate): ProfileKey | null {
    const scores = new Map<ProfileKey, number>()

    const entries: [string | undefined, number][] = [
      [field.name, WEIGHTS.name],
      [field.id, WEIGHTS.id],
      [field.autocomplete, WEIGHTS.autocomplete],
      [field.ariaLabel, WEIGHTS.ariaLabel],
      [field.placeholder, WEIGHTS.placeholder],
      [field.labelText, WEIGHTS.labelText],
    ]

    for (const [value, weight] of entries) {
      if (!value) continue
      this.scoreValue(value, weight, scores)
    }

    if (field.dataset) {
      for (const val of Object.values(field.dataset)) {
        this.scoreValue(val, WEIGHTS.dataset, scores)
      }
    }

    let best: ProfileKey | null = null
    let bestScore = 0

    for (const [key, score] of scores) {
      if (score > bestScore) {
        bestScore = score
        best = key
      }
    }

    return bestScore >= MIN_SCORE ? best : null
  }

  private scoreValue(
    value: string,
    weight: number,
    scores: Map<ProfileKey, number>,
  ): void {
    const normalized = normalize(value)
    if (!normalized) return

    const exact = ALIAS_MAP[normalized]
    if (exact) {
      scores.set(exact, (scores.get(exact) || 0) + weight)
      return
    }

    for (const alias of ALIAS_VALUES) {
      if (normalized.includes(alias)) {
        const key = ALIAS_MAP[alias]
        scores.set(key, (scores.get(key) || 0) + Math.round(weight / 2))
      }
    }
  }
}

export class MatchingEngine {
  private strategy: MatchingStrategy

  constructor(strategy: MatchingStrategy = new AliasMatchingStrategy()) {
    this.strategy = strategy
  }

  setStrategy(strategy: MatchingStrategy): void {
    this.strategy = strategy
  }

  match(field: FieldCandidate): ProfileKey | null {
    return this.strategy.match(field)
  }

  matchAll(fields: FieldCandidate[]): Map<FieldCandidate, ProfileKey | null> {
    const results = new Map<FieldCandidate, ProfileKey | null>()
    for (const field of fields) {
      results.set(field, this.match(field))
    }
    return results
  }
}

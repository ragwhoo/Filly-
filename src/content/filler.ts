import type { Profile, ProfileKey, FieldCandidate, FillResponse } from '~/types'

function fillElement(element: HTMLElement, value: string): void {
  const tag = element.tagName.toLowerCase()

  if (tag === 'select') {
    const select = element as HTMLSelectElement
    const option = Array.from(select.options).find(
      (o) => o.value.toLowerCase() === value.toLowerCase(),
    )
    if (option) {
      select.value = option.value
    } else {
      select.value = value
    }
  } else if (tag === 'textarea' || tag === 'input') {
    const input = element as HTMLInputElement
    input.value = value
  }

  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

export function fillFields(
  matches: Map<FieldCandidate, ProfileKey | null>,
  profile: Profile,
  forceFill = false,
): FillResponse {
  let fieldsMatched = 0
  let fieldsFilled = 0

  for (const [field, profileKey] of matches) {
    if (!profileKey) continue
    fieldsMatched++

    const value = profile[profileKey]
    if (!value) continue

    const input = field.element as HTMLInputElement
    if (!forceFill && input.value && input.value.trim() !== '') continue

    fillElement(field.element, value)
    fieldsFilled++
  }

  return {
    success: fieldsFilled > 0,
    fieldsMatched,
    fieldsFilled,
  }
}

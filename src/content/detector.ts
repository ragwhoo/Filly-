import type { FieldCandidate } from '~/types'
import { getLabelText, getDatasetAttributes, SKIP_TYPES } from '~/lib/fields'

const FORM_SELECTOR = 'input, textarea, select'

function shouldSkip(element: HTMLElement): boolean {
  const input = element as HTMLInputElement
  return SKIP_TYPES.has(input.type) || input.disabled || input.readOnly
}

function extractField(element: HTMLElement): FieldCandidate | null {
  if (shouldSkip(element)) return null

  return {
    element,
    name: (element as HTMLInputElement).name || undefined,
    id: element.id || undefined,
    placeholder: (element as HTMLInputElement).placeholder || undefined,
    ariaLabel: element.getAttribute('aria-label') || undefined,
    autocomplete: (element as HTMLInputElement).autocomplete || undefined,
    labelText: getLabelText(element),
    dataset: getDatasetAttributes(element),
  }
}

export function detectFields(container: HTMLElement = document.body): FieldCandidate[] {
  const elements = container.querySelectorAll<HTMLElement>(FORM_SELECTOR)
  const fields: FieldCandidate[] = []
  for (const el of elements) {
    const field = extractField(el)
    if (field) fields.push(field)
  }
  return fields
}

export function observeDynamicFields(
  callback: (fields: FieldCandidate[]) => void,
  debounceMs = 300,
): MutationObserver {
  let timer: ReturnType<typeof setTimeout> | null = null

  const observer = new MutationObserver((mutations) => {
    const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0)
    if (!hasAddedNodes) return

    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      const fields = detectFields()
      if (fields.length > 0) callback(fields)
    }, debounceMs)
  })

  observer.observe(document.body, { childList: true, subtree: true })
  return observer
}

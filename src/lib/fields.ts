export function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function getLabelText(element: HTMLElement): string | undefined {
  const id = element.id
  if (id) {
    const label = document.querySelector(`label[for="${CSS.escape(id)}"]`)
    if (label?.textContent) return label.textContent.trim()
  }
  const parent = element.closest('label')
  if (parent?.textContent) {
    const text = parent.textContent.replace(element.textContent || '', '').trim()
    if (text) return text
  }
  return undefined
}

export function getDatasetAttributes(element: HTMLElement): DOMStringMap | undefined {
  const dataset = element.dataset
  if (dataset && Object.keys(dataset).length > 0) {
    return dataset
  }
  return undefined
}

export const SKIP_TYPES = new Set(['password', 'hidden', 'file', 'submit'])

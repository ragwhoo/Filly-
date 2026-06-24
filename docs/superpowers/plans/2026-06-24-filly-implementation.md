# Filly Implementation Plan

> **For agentic workers:** This plan builds the complete Filly Chrome Extension. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready, local-first Chrome extension for one-click form autofill using deterministic alias matching.

**Architecture:** Popup React app ↔ chrome.storage.local → Content script → Field detection → Alias matching → Autofill. No background service worker. Single profile. Static alias dictionary with weighted scoring.

**Tech Stack:** Plasmo, React 18, TypeScript 5, TailwindCSS 3, Chrome Manifest V3

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `.gitignore` (update existing)

**package.json:**
```json
{
  "name": "filly",
  "version": "1.0.0",
  "description": "Lightweight, local-first form autofill extension",
  "scripts": {
    "dev": "plasmo dev",
    "build": "plasmo build",
    "package": "plasmo package"
  },
  "dependencies": {
    "plasmo": "0.89.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "autoprefixer": "10.4.17",
    "postcss": "8.4.35",
    "tailwindcss": "3.4.1",
    "typescript": "5.3.3"
  },
  "manifest": {
    "name": "Filly",
    "description": "One-click form autofill",
    "version": "1.0.0",
    "permissions": ["storage"]
  }
}
```

- [ ] **Step 1: Create package.json** with the above content
- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "~/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,ts}"],
  theme: {
    extend: {}
  },
  plugins: []
}
```

- [ ] **Step 4: Create postcss.config.js**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

- [ ] **Step 5: Update .gitignore**

Append to `.gitignore`:
```
# Build output
build/
.chromium/
artifacts/
*.zip

# IDE
.vscode/
.idea/
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: node_modules/ created, package-lock.json created

- [ ] **Step 7: Create directory structure**

Run: `mkdir -p src/{popup/{components,hooks},content,lib,storage,types}`

- [ ] **Step 8: Commit scaffolding**

```bash
git add .
git commit -m "chore: scaffold Filly project with Plasmo, React, TailwindCSS"
```

---

### Task 2: Shared Types

**Files:**
- Create: `src/types/index.ts`

This file contains ALL shared TypeScript types — imported by every layer.

- [ ] **Step 1: Write types/index.ts**

```ts
export interface Profile {
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  pincode: string
  linkedin: string
  github: string
  portfolio: string
  college: string
  degree: string
  graduationYear: string
  currentCompany: string
  currentRole: string
  resumeUrl: string
}

export type ProfileKey = keyof Profile

export interface FieldCandidate {
  element: HTMLElement
  name?: string
  id?: string
  placeholder?: string
  ariaLabel?: string
  autocomplete?: string
  labelText?: string
  dataset?: DOMStringMap
}

export interface MatchingStrategy {
  match(field: FieldCandidate): ProfileKey | null
}

export interface FillRequest {
  action: 'fillForm'
  forceFill?: boolean
}

export interface FillResponse {
  success: boolean
  fieldsMatched: number
  fieldsFilled: number
}

export interface SerializableProfile {
  firstName?: string
  lastName?: string
  fullName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
  linkedin?: string
  github?: string
  portfolio?: string
  college?: string
  degree?: string
  graduationYear?: string
  currentCompany?: string
  currentRole?: string
  resumeUrl?: string
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add shared TypeScript types"
```

---

### Task 3: Profile Defaults and Field Metadata

**Files:**
- Create: `src/lib/profile.ts`

- [ ] **Step 1: Write profile.ts**

```ts
import type { Profile } from '~/types'

export const DEFAULT_PROFILE: Profile = {
  firstName: '',
  lastName: '',
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  linkedin: '',
  github: '',
  portfolio: '',
  college: '',
  degree: '',
  graduationYear: '',
  currentCompany: '',
  currentRole: '',
  resumeUrl: '',
}

export const PROFILE_FIELDS: { key: keyof Profile; label: string; section: string }[] = [
  { key: 'firstName', label: 'First Name', section: 'Personal' },
  { key: 'lastName', label: 'Last Name', section: 'Personal' },
  { key: 'fullName', label: 'Full Name', section: 'Personal' },
  { key: 'email', label: 'Email', section: 'Contact' },
  { key: 'phone', label: 'Phone', section: 'Contact' },
  { key: 'address', label: 'Address', section: 'Location' },
  { key: 'city', label: 'City', section: 'Location' },
  { key: 'state', label: 'State', section: 'Location' },
  { key: 'country', label: 'Country', section: 'Location' },
  { key: 'pincode', label: 'Pincode', section: 'Location' },
  { key: 'linkedin', label: 'LinkedIn', section: 'Online' },
  { key: 'github', label: 'GitHub', section: 'Online' },
  { key: 'portfolio', label: 'Portfolio', section: 'Online' },
  { key: 'resumeUrl', label: 'Resume URL', section: 'Online' },
  { key: 'college', label: 'College', section: 'Education' },
  { key: 'degree', label: 'Degree', section: 'Education' },
  { key: 'graduationYear', label: 'Graduation Year', section: 'Education' },
  { key: 'currentCompany', label: 'Current Company', section: 'Work' },
  { key: 'currentRole', label: 'Current Role', section: 'Work' },
]

export function isProfile(value: unknown): value is Profile {
  if (typeof value !== 'object' || value === null) return false
  const p = value as Record<string, unknown>
  return PROFILE_FIELDS.every((f) => typeof p[f.key] === 'string')
}
```

- [ ] **Step 1: Write and commit profile.ts**

```bash
git add src/lib/profile.ts
git commit -m "feat: add profile defaults and field metadata"
```

---

### Task 4: Field Normalization Utilities

**Files:**
- Create: `src/lib/fields.ts`

- [ ] **Step 1: Write fields.ts**

```ts
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
```

- [ ] **Step 1: Write and commit fields.ts**

```bash
git add src/lib/fields.ts
git commit -m "feat: add field normalization and label detection utilities"
```

---

### Task 5: Alias Dictionary

**Files:**
- Create: `src/lib/aliases.ts`

- [ ] **Step 1: Write aliases.ts**

```ts
import type { ProfileKey } from '~/types'

export const ALIAS_MAP: Record<string, ProfileKey> = {
  firstname: 'firstName',
  fname: 'firstName',
  givenname: 'firstName',
  lastname: 'lastName',
  lname: 'lastName',
  surname: 'lastName',
  fullname: 'fullName',
  email: 'email',
  emailaddress: 'email',
  useremail: 'email',
  phone: 'phone',
  mobile: 'phone',
  mobilenumber: 'phone',
  contactnumber: 'phone',
  phonenumber: 'phone',
  address: 'address',
  addr: 'address',
  street: 'address',
  city: 'city',
  state: 'state',
  country: 'country',
  pincode: 'pincode',
  zip: 'pincode',
  zipcode: 'pincode',
  postal: 'pincode',
  postcode: 'pincode',
  linkedin: 'linkedin',
  github: 'github',
  portfolio: 'portfolio',
  website: 'portfolio',
  college: 'college',
  university: 'college',
  school: 'college',
  degree: 'degree',
  graduationyear: 'graduationYear',
  gradyear: 'graduationYear',
  yearofgraduation: 'graduationYear',
  company: 'currentCompany',
  currentcompany: 'currentCompany',
  employer: 'currentCompany',
  role: 'currentRole',
  currentrole: 'currentRole',
  jobtitle: 'currentRole',
  designation: 'currentRole',
  resume: 'resumeUrl',
  cv: 'resumeUrl',
  resumeurl: 'resumeUrl',
  curriculumvitae: 'resumeUrl',
}

export const ALIAS_VALUES = Object.keys(ALIAS_MAP)
export const ALIAS_SET = new Set(ALIAS_VALUES)
```

- [ ] **Step 1: Write and commit aliases.ts**

```bash
git add src/lib/aliases.ts
git commit -m "feat: add alias dictionary"
```

---

### Task 6: Storage Layer

**Files:**
- Create: `src/storage/index.ts`

- [ ] **Step 1: Write storage/index.ts**

```ts
import type { Profile } from '~/types'
import { DEFAULT_PROFILE, isProfile } from '~/lib/profile'

const STORAGE_KEY = 'profile'

export async function getProfile(): Promise<Profile | null> {
  const result = await chrome.storage.local.get(STORAGE_KEY)
  const data = result[STORAGE_KEY]
  if (isProfile(data)) return data as Profile
  return null
}

export async function saveProfile(profile: Profile): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: profile })
}

export async function clearProfile(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY)
}

export function exportProfile(profile: Profile): string {
  return JSON.stringify(profile, null, 2)
}

export function importProfile(json: string): Profile {
  const parsed = JSON.parse(json)
  if (!isProfile(parsed)) {
    throw new Error('Invalid profile data')
  }
  return { ...DEFAULT_PROFILE, ...parsed }
}

export function downloadProfile(profile: Profile): void {
  const json = exportProfile(profile)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'filly-profile.json'
  a.click()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 1: Write and commit storage/index.ts**

```bash
git add src/storage/index.ts
git commit -m "feat: add storage layer with CRUD, import, export"
```

---

### Task 7: Field Detector

**Files:**
- Create: `src/content/detector.ts`

- [ ] **Step 1: Write detector.ts**

```ts
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
```

- [ ] **Step 1: Write and commit detector.ts**

```bash
git add src/content/detector.ts
git commit -m "feat: add form field detector with MutationObserver support"
```

---

### Task 8: Alias Matching Engine

**Files:**
- Create: `src/content/matcher.ts`

- [ ] **Step 1: Write matcher.ts**

```ts
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

const MIN_SCORE = 60

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
```

- [ ] **Step 1: Write and commit matcher.ts**

```bash
git add src/content/matcher.ts
git commit -m "feat: add alias matching engine with pluggable strategy"
```

---

### Task 9: Form Filler

**Files:**
- Create: `src/content/filler.ts`

- [ ] **Step 1: Write filler.ts**

```ts
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
```

- [ ] **Step 1: Write and commit filler.ts**

```bash
git add src/content/filler.ts
git commit -m "feat: add form filler with event dispatching"
```

---

### Task 10: Content Script Entry Point

**Files:**
- Create: `src/content/index.ts`

- [ ] **Step 1: Write content/index.ts**

```ts
import type { FillRequest, FillResponse, Profile } from '~/types'
import { detectFields } from './detector'
import { MatchingEngine } from './matcher'
import { fillFields } from './filler'

let currentProfile: Profile | null = null
const engine = new MatchingEngine()

chrome.runtime.onMessage.addListener(
  (request: FillRequest, _sender, sendResponse: (response: FillResponse) => void) => {
    if (request.action !== 'fillForm') return false

    if (!currentProfile) {
      chrome.storage.local.get('profile', (result) => {
        const profile = result.profile as Profile | undefined
        if (!profile) {
          sendResponse({ success: false, fieldsMatched: 0, fieldsFilled: 0 })
          return
        }
        currentProfile = profile
        doFill(request.forceFill ?? false, sendResponse)
      })
      return true
    }

    doFill(request.forceFill ?? false, sendResponse)
    return true
  },
)

function doFill(
  forceFill: boolean,
  sendResponse: (response: FillResponse) => void,
): void {
  const fields = detectFields()
  const matches = engine.matchAll(fields)
  const response = fillFields(matches, currentProfile!, forceFill)
  sendResponse(response)
}
```

- [ ] **Step 1: Write and commit content/index.ts**

```bash
git add src/content/index.ts
git commit -m "feat: add content script entry point with message listener"
```

---

### Task 11: Popup Tailwind CSS

**Files:**
- Create: `src/popup/style.css`

- [ ] **Step 1: Write style.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 1: Write and commit style.css**

```bash
git add src/popup/style.css
git commit -m "feat: add TailwindCSS entry for popup"
```

---

### Task 12: useProfile Hook

**Files:**
- Create: `src/popup/hooks/useProfile.ts`

- [ ] **Step 1: Write useProfile.ts**

```ts
import { useState, useEffect, useCallback } from 'react'
import type { Profile } from '~/types'
import { getProfile, saveProfile, clearProfile } from '~/storage'
import { DEFAULT_PROFILE } from '~/lib/profile'

interface UseProfileReturn {
  profile: Profile | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  update: (profile: Profile) => Promise<void>
  remove: () => Promise<void>
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const p = await getProfile()
      setProfile(p)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(async (p: Profile) => {
    setError(null)
    try {
      await saveProfile(p)
      setProfile(p)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile')
    }
  }, [])

  const remove = useCallback(async () => {
    setError(null)
    try {
      await clearProfile()
      setProfile(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to clear profile')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { profile, loading, error, refresh, update, remove }
}
```

- [ ] **Step 1: Write and commit useProfile.ts**

```bash
git add src/popup/hooks/useProfile.ts
git commit -m "feat: add useProfile hook for storage CRUD"
```

---

### Task 13: ProfileEditor Component

**Files:**
- Create: `src/popup/components/ProfileEditor.tsx`

- [ ] **Step 1: Write ProfileEditor.tsx**

```tsx
import { useState } from 'react'
import type { Profile } from '~/types'
import { DEFAULT_PROFILE, PROFILE_FIELDS } from '~/lib/profile'

interface ProfileEditorProps {
  initial?: Profile | null
  onSave: (profile: Profile) => void
  onCancel?: () => void
}

export function ProfileEditor({ initial, onSave, onCancel }: ProfileEditorProps) {
  const [profile, setProfile] = useState<Profile>(initial ?? DEFAULT_PROFILE)

  const sections = ['Personal', 'Contact', 'Location', 'Online', 'Education', 'Work'] as const

  function handleChange(key: keyof Profile, value: string) {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(profile)
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h1 className="text-lg font-semibold text-gray-900">Edit Profile</h1>

      {sections.map((section) => (
        <fieldset key={section}>
          <legend className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            {section}
          </legend>
          <div className="space-y-2">
            {PROFILE_FIELDS.filter((f) => f.section === section).map((field) => (
              <div key={field.key}>
                <label className="block text-xs text-gray-600 mb-0.5">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={profile[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white text-sm rounded px-3 py-2 hover:bg-blue-700"
        >
          Save Profile
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 text-sm rounded px-3 py-2 hover:bg-gray-200"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
```

- [ ] **Step 1: Write and commit ProfileEditor.tsx**

```bash
git add src/popup/components/ProfileEditor.tsx
git commit -m "feat: add ProfileEditor component"
```

---

### Task 14: ProfileView Component

**Files:**
- Create: `src/popup/components/ProfileView.tsx`

- [ ] **Step 1: Write ProfileView.tsx**

```tsx
import type { Profile } from '~/types'

interface ProfileViewProps {
  profile: Profile
  onEdit: () => void
  onFill: () => void
  onExport: () => void
  onImport: () => void
  onClear: () => void
}

export function ProfileView({
  profile,
  onEdit,
  onFill,
  onExport,
  onImport,
  onClear,
}: ProfileViewProps) {
  const hasProfile = profile.firstName || profile.email

  return (
    <div className="p-4 space-y-4">
      {hasProfile ? (
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Your Profile</h1>
          <div className="mt-2 text-sm text-gray-600 space-y-0.5">
            {profile.firstName && (
              <p>
                {profile.firstName}
                {profile.lastName ? ` ${profile.lastName}` : ''}
              </p>
            )}
            {profile.email && <p>{profile.email}</p>}
            {profile.phone && <p>{profile.phone}</p>}
            {(profile.currentCompany || profile.currentRole) && (
              <p className="text-gray-400">
                {profile.currentCompany && profile.currentRole
                  ? `${profile.currentCompany} · ${profile.currentRole}`
                  : profile.currentCompany || profile.currentRole}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">No profile saved yet.</p>
      )}

      <button
        onClick={onFill}
        className="w-full bg-blue-600 text-white text-sm rounded px-3 py-2 hover:bg-blue-700 font-medium"
      >
        Fill Current Page
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onEdit}
          className="bg-gray-100 text-gray-700 text-sm rounded px-3 py-2 hover:bg-gray-200"
        >
          Edit Profile
        </button>
        <button
          onClick={onExport}
          className="bg-gray-100 text-gray-700 text-sm rounded px-3 py-2 hover:bg-gray-200"
        >
          Export Profile
        </button>
        <button
          onClick={onImport}
          className="bg-gray-100 text-gray-700 text-sm rounded px-3 py-2 hover:bg-gray-200"
        >
          Import Profile
        </button>
        <button
          onClick={onClear}
          className="bg-red-50 text-red-600 text-sm rounded px-3 py-2 hover:bg-red-100"
        >
          Clear Profile
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 1: Write and commit ProfileView.tsx**

```bash
git add src/popup/components/ProfileView.tsx
git commit -m "feat: add ProfileView component"
```

---

### Task 15: ActionBar Component (File Import Trigger)

**Files:**
- Create: `src/popup/components/ActionBar.tsx`

Renders a hidden file input. Exposes a ref so the parent (Popup) can trigger file selection when the Import button is clicked in ProfileView.

- [ ] **Step 1: Write ActionBar.tsx**

```tsx
import { forwardRef } from 'react'

interface ActionBarProps {
  onImport: (json: string) => void
  onImportError: (error: string) => void
}

export const ActionBar = forwardRef<HTMLInputElement, ActionBarProps>(
  function ActionBar({ onImport, onImportError }, ref) {
    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string
          onImport(text)
        } catch {
          onImportError('Failed to read file')
        }
      }
      reader.onerror = () => onImportError('Failed to read file')
      reader.readAsText(file)

      e.target.value = ''
    }

    return (
      <input
        ref={ref}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="hidden"
      />
    )
  },
)
```

- [ ] **Step 1: Write and commit ActionBar.tsx**

```bash
git add src/popup/components/ActionBar.tsx
git commit -m "feat: add ActionBar with forwarded file input ref"
```

---

### Task 16: Popup Root Component

**Files:**
- Create: `src/popup/Popup.tsx`

- [ ] **Step 1: Write Popup.tsx**

```tsx
import { useState, useRef } from 'react'
import type { Profile, FillResponse } from '~/types'
import { useProfile } from './hooks/useProfile'
import { ProfileEditor } from './components/ProfileEditor'
import { ProfileView } from './components/ProfileView'
import { ActionBar } from './components/ActionBar'
import { downloadProfile } from '~/storage'
import { importProfile } from '~/storage'

export function Popup() {
  const { profile, loading, error, refresh, update, remove } = useProfile()
  const [editing, setEditing] = useState(!profile)
  const [importError, setImportError] = useState<string | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  async function handleFill() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return

    try {
      const response = await chrome.tabs.sendMessage<FillResponse>(tab.id, {
        action: 'fillForm',
      })
      if (response?.fieldsFilled > 0) {
        window.close()
      }
    } catch {
      // Content script may not be injected
    }
  }

  function handleSave(updatedProfile: Profile) {
    update(updatedProfile)
    setEditing(false)
  }

  function handleExport() {
    if (profile) downloadProfile(profile)
  }

  function handleImport(json: string) {
    try {
      const imported = importProfile(json)
      update(imported)
      setImportError(null)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Invalid profile file')
    }
  }

  function handleClear() {
    remove()
    setEditing(true)
  }

  if (loading) {
    return (
      <div className="w-72 p-4 text-center text-sm text-gray-400">Loading...</div>
    )
  }

  return (
    <div className="w-72">
      <ActionBar ref={importInputRef} onImport={handleImport} onImportError={setImportError} />

      {(error || importError) && (
        <div className="px-4 pt-2">
          <p className="text-xs text-red-500">{error || importError}</p>
        </div>
      )}

      {editing || !profile ? (
        <ProfileEditor
          initial={profile}
          onSave={handleSave}
          onCancel={profile ? () => setEditing(false) : undefined}
        />
      ) : (
        <ProfileView
          profile={profile}
          onEdit={() => setEditing(true)}
          onFill={handleFill}
          onExport={handleExport}
          onImport={() => importInputRef.current?.click()}
          onClear={handleClear}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 1: Write and commit Popup.tsx**

```bash
git add src/popup/Popup.tsx
git commit -m "feat: add Popup root component"
```

---

### Task 17: Popup Entry Point

**Files:**
- Create: `src/popup/index.tsx`
- Create: `src/popup/index.html` (if Plasmo requires it)

For Plasmo, the popup entry point is `src/popup.tsx` or `src/popup/index.tsx`.

- [ ] **Step 1: Write popup/index.tsx**

```tsx
import './style.css'
import { Popup } from './Popup'

export default Popup
```

- [ ] **Step 2: Commit**

```bash
git add src/popup/index.tsx
git commit -m "feat: add popup entry point"
```

---

### Task 18: Validate Build

- [ ] **Step 1: Run dev build**

Run: `npm run build`
Expected: Build succeeds, output in `build/` directory

If build fails, fix any TypeScript errors (import paths, type mismatches) and rebuild.

- [ ] **Step 2: Commit working build**

```bash
git add -A
git commit -m "chore: fix build issues, production-ready"
```

---

### Task 19: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README.md**

```md
# Filly

> Lightweight, local-first form autofill for Chrome.

Filly stores a single profile in `chrome.storage.local` and fills web forms using deterministic alias-based field matching. No backend, no encryption, no AI, no telemetry.

## Features

- **Profile Management** — Save your personal, contact, education, and work details
- **One-Click Autofill** — Fill forms on any website with a single click
- **Smart Field Matching** — Weighted scoring using name, id, label, placeholder, and more
- **Import/Export** — Backup or transfer your profile as JSON
- **Privacy-First** — Everything stays on your machine. No data ever leaves

## Install

1. Download the latest release or build from source
2. Go to `chrome://extensions`
3. Enable Developer Mode
4. Click "Load unpacked" and select the `build/` directory

## Development

```bash
npm install
npm run dev     # Development mode with hot reload
npm run build   # Production build
```

## Tech Stack

- [Plasmo](https://docs.plasmo.com/) — Framework
- React 18 — UI
- TypeScript 5 — Type safety
- TailwindCSS 3 — Styling
- Chrome Manifest V3

## Project Structure

```
src/
├── popup/          # Popup UI (React)
│   ├── Popup.tsx
│   ├── components/
│   │   ├── ProfileEditor.tsx
│   │   ├── ProfileView.tsx
│   │   └── ActionBar.tsx
│   └── hooks/
│       └── useProfile.ts
├── content/        # Content script
│   ├── index.ts
│   ├── detector.ts
│   ├── matcher.ts
│   └── filler.ts
├── lib/            # Shared pure logic
│   ├── profile.ts
│   ├── fields.ts
│   └── aliases.ts
├── storage/        # chrome.storage.local wrapper
│   └── index.ts
└── types/          # TypeScript interfaces
    └── index.ts
```

## How It Works

1. Open the Filly popup and fill in your profile
2. Navigate to any website with a form
3. Click "Fill Current Page"
4. Filly detects form fields, matches them using alias scoring, and fills them

## Field Matching

Filly uses a weighted scoring system:

| Source | Weight |
|---|---|
| `name` attribute | 100 |
| `id` attribute | 80 |
| `autocomplete` attribute | 80 |
| `aria-label` attribute | 60 |
| `placeholder` attribute | 40 |
| `label text` | 30 |
| `data-*` attributes | 20 |

Score threshold: 60. Substring matches receive half weight.

## License

MIT
```

- [ ] **Step 2: Commit README.md**

```bash
git add README.md
git commit -m "docs: add comprehensive README"
```

---

### Task 20: .gitignore Update and Final Commit

- [ ] **Step 1: Ensure .gitignore covers build artifacts**

Current .gitignore should include:
```
node_modules/
.next/
.env
.env.local
dist/
build/
.DS_Store
build/
.chromium/
artifacts/
*.zip
.vscode/
.idea/
```

- [ ] **Step 2: Final commit**

```bash
git add .
git commit -m "chore: finalize project setup"
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors

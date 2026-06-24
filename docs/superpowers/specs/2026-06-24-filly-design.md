# Filly — Chrome Extension Design Spec

> A lightweight, local-first Chrome extension for one-click form autofill.

## Overview

Filly stores a single user profile locally and fills web forms using alias-based field matching. No backend, no encryption, no AI, no cloud — just a profile saved to `chrome.storage.local` and a static alias dictionary.

## Core Principles

- Local-first
- No backend
- No authentication
- No encryption
- No cloud sync
- No telemetry
- No analytics
- No AI/ML/LLM
- No resume parsing
- No password management
- Minimal bundle size
- Extremely fast

## Architecture

```
Popup UI  ←→  chrome.storage.local
                    ↓
Content Script → Field Detection → Alias Matching → Autofill
```

- **Popup**: React app that reads/writes the profile in storage
- **Content Script**: Injected into pages, listens for fill commands from popup
- **No background service worker**

## Project Structure

```
src/
├── popup/
│   ├── Popup.tsx
│   ├── components/
│   │   ├── ProfileEditor.tsx
│   │   ├── ProfileView.tsx
│   │   └── ActionBar.tsx
│   └── hooks/
│       └── useProfile.ts
├── content/
│   ├── index.ts
│   ├── detector.ts
│   ├── matcher.ts
│   └── filler.ts
├── lib/
│   ├── profile.ts
│   ├── fields.ts
│   └── aliases.ts
├── storage/
│   └── index.ts
└── types/
    └── index.ts
```

## Data Model

### Profile

```ts
interface Profile {
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
```

### Messages

```ts
type FillRequest = { action: 'fillForm'; forceFill?: boolean }
type FillResponse = { success: boolean; fieldsMatched: number; fieldsFilled: number }
```

### Field Candidate

```ts
interface FieldCandidate {
  element: HTMLElement
  name?: string
  id?: string
  placeholder?: string
  ariaLabel?: string
  autocomplete?: string
  labelText?: string
  dataset?: DOMStringMap
}
```

## Storage

Single key `profile` in `chrome.storage.local`.

```ts
getProfile(): Promise<Profile | null>
saveProfile(profile: Profile): Promise<void>
clearProfile(): Promise<void>
```

- Export: download profile as JSON file
- Import: upload JSON, validate structure, save profile
- Clear: remove profile from storage

## Field Detection

Detect `input`, `textarea`, `select` elements. Skip `password`, `hidden`, `file`, `submit` types.

Extract: `name`, `id`, `placeholder`, `aria-label`, `autocomplete`, `dataset`, and associated label text (via `label[for]` or wrapping).

Support dynamically added fields via `MutationObserver`:
- Watch for `childList` mutations on the document body
- Scan added nodes for form elements
- Debounce to 300ms

## Alias Matching

### Pluggable Strategy Interface

```ts
interface MatchingStrategy {
  match(field: FieldCandidate): keyof Profile | null
}
```

Default implementation: `AliasMatchingStrategy`.

### Normalization

```ts
function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}
```

### Scoring Weights

| Source | Weight |
|---|---|
| `name` | 100 |
| `id` | 80 |
| `autocomplete` | 80 |
| `aria-label` | 60 |
| `placeholder` | 40 |
| `label text` | 30 |
| `data-* attributes` | 20 |

### Algorithm

1. For each attribute on a field candidate, normalize the value
2. Check exact alias match → full weight
3. Check substring alias match → half weight
4. Accumulate scores by Profile field
5. Highest score wins
6. Ignore scores below 60

### Alias Dictionary

```ts
const ALIAS_MAP: Record<string, keyof Profile> = {
  firstname: 'firstName', fname: 'firstName', givenname: 'firstName',
  lastname: 'lastName', lname: 'lastName', surname: 'lastName',
  fullname: 'fullName',
  email: 'email', emailaddress: 'email', useremail: 'email',
  phone: 'phone', mobile: 'phone', mobilenumber: 'phone',
  contactnumber: 'phone', phonenumber: 'phone',
  address: 'address', addr: 'address', street: 'address',
  city: 'city', state: 'state', country: 'country',
  pincode: 'pincode', zip: 'pincode', zipcode: 'pincode',
  postal: 'pincode', postcode: 'pincode',
  linkedin: 'linkedin', github: 'github',
  portfolio: 'portfolio', website: 'portfolio',
  college: 'college', university: 'college', school: 'college',
  degree: 'degree',
  graduationyear: 'graduationYear', gradyear: 'graduationYear',
  yearofgraduation: 'graduationYear',
  company: 'currentCompany', currentcompany: 'currentCompany',
  employer: 'currentCompany',
  role: 'currentRole', currentrole: 'currentRole',
  jobtitle: 'currentRole', designation: 'currentRole',
  resume: 'resumeUrl', cv: 'resumeUrl', resumeurl: 'resumeUrl',
  curriculumvitae: 'resumeUrl',
}
```

## Autofill Rules

- Never overwrite non-empty fields by default
- Only overwrite if `forceFill=true`
- Dispatch proper `input` and `change` events after filling
- Support `input`, `textarea`, and `select` elements
- Return `fieldsMatched` and `fieldsFilled` statistics

## Popup UI

### States

- **No profile**: Show ProfileEditor
- **Profile exists**: Show ProfileView with actions

### Actions

- Fill Current Page
- Edit Profile
- Export Profile (download JSON)
- Import Profile (upload JSON, validate, save)
- Clear Profile

### Form Sections

| Section | Fields |
|---|---|
| Personal | First Name, Last Name, Full Name |
| Contact | Email, Phone |
| Location | Address, City, State, Country, Pincode |
| Online | LinkedIn, GitHub, Portfolio, Resume URL |
| Education | College, Degree, Graduation Year |
| Work | Current Company, Current Role |

## Performance

- Typical forms complete in under 100ms
- No external runtime dependencies in content scripts
- Small bundle size
- Fast startup

## Deliverables

- Complete project structure
- TypeScript types
- Storage layer
- Popup UI
- Content script
- Detector implementation
- Alias matching engine
- Autofill implementation
- Import/export support
- README
- Build instructions
- Open-source-ready codebase

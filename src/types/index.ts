export interface Profile {
  title: string
  firstName: string
  middleName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  fax: string
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
  userId: string
  sex: string
  driversLicense: string
  age: string
  birthPlace: string
  income: string
  customMessage: string
  comments: string
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
  title?: string
  firstName?: string
  middleName?: string
  lastName?: string
  fullName?: string
  email?: string
  phone?: string
  fax?: string
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
  userId?: string
  sex?: string
  driversLicense?: string
  age?: string
  birthPlace?: string
  income?: string
  customMessage?: string
  comments?: string
}

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

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

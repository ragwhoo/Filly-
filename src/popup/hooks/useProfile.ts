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

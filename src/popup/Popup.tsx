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

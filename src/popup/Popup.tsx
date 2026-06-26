import { useState, useRef } from 'react'
import type { Profile, FillResponse } from '~/types'
import { useProfile } from './hooks/useProfile'
import { ProfileEditor } from './components/ProfileEditor'
import { ProfileView } from './components/ProfileView'
import { ActionBar } from './components/ActionBar'
import { downloadProfile } from '~/storage'
import { importProfile } from '~/storage'

function Logo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      <path d="M12 10v6" />
      <path d="M9 13h6" />
    </svg>
  )
}

export function Popup() {
  const { profile, loading, error, refresh, update, remove } = useProfile()
  const [editing, setEditing] = useState(!profile)
  const [importError, setImportError] = useState<string | null>(null)
  const [fillSuccess, setFillSuccess] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)

  async function handleFill() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return

    try {
      const response = await chrome.tabs.sendMessage<FillResponse>(tab.id, {
        action: 'fillForm',
      })
      if (response?.fieldsFilled > 0) {
        setFillSuccess(true)
        setTimeout(() => setFillSuccess(false), 2000)
        setTimeout(() => window.close(), 1200)
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
      <>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-purple-100 bg-white/70">
          <div className="text-blue-600"><Logo /></div>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">Filly</span>
        </div>
        <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
      </>
    )
  }

  return (
    <div className="min-h-[200px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-purple-100 bg-white/70">
        <div className="text-blue-600"><Logo /></div>
        <span className="text-sm font-semibold text-gray-900 tracking-tight">Filly</span>
      </div>

      {(error || importError) && (
        <div className="px-4 pt-3">
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-2 py-1.5">{error || importError}</p>
        </div>
      )}

      {fillSuccess && (
        <div className="px-4 pt-3">
          <p className="text-xs text-green-700 bg-green-50 rounded-lg px-2 py-1.5 text-center font-medium">
            Form filled successfully
          </p>
        </div>
      )}

      <ActionBar ref={importInputRef} onImport={handleImport} onImportError={setImportError} />

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

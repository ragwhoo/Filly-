import { useState } from 'react'
import type { Profile } from '~/types'
import { DEFAULT_PROFILE, PROFILE_FIELDS } from '~/lib/profile'

interface ProfileEditorProps {
  initial?: Profile | null
  onSave: (profile: Profile) => void
  onCancel?: () => void
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function sectionAccent(section: string): string {
  const map: Record<string, string> = {
    Personal: 'bg-blue-50 border-blue-200',
    Contact: 'bg-green-50 border-green-200',
    Location: 'bg-amber-50 border-amber-200',
    Online: 'bg-purple-50 border-purple-200',
    Education: 'bg-cyan-50 border-cyan-200',
    Work: 'bg-orange-50 border-orange-200',
  }
  return map[section] || 'bg-gray-50 border-gray-200'
}

function sectionDot(section: string): string {
  const map: Record<string, string> = {
    Personal: 'bg-blue-500',
    Contact: 'bg-green-500',
    Location: 'bg-amber-500',
    Online: 'bg-purple-500',
    Education: 'bg-cyan-500',
    Work: 'bg-orange-500',
  }
  return map[section] || 'bg-gray-500'
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
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <BackIcon />
          </button>
        )}
        <h1 className="text-sm font-semibold text-gray-900">Edit Profile</h1>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {sections.map((section) => {
          const fields = PROFILE_FIELDS.filter((f) => f.section === section)
          if (fields.length === 0) return null

          return (
          <div key={section} className={`rounded-2xl border ${sectionAccent(section)} overflow-hidden shadow-md`}>
            <div className="px-3 py-2 flex items-center gap-2 border-b border-inherit bg-white/80">
              <span className={`w-2 h-2 rounded-full ${sectionDot(section)}`} />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">{section}</span>
            </div>
            <div className="p-3 space-y-2.5 bg-white/90">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={profile[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                  />
                </div>
              ))}
            </div>
          </div>
          )
        })}
      </div>

      <div className="flex gap-2 px-4 py-3 border-t border-gray-100 bg-white/80">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-2xl px-3 py-2.5 hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
        >
          Save Profile
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-2xl px-3 py-2.5 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

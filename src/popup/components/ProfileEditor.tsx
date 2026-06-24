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

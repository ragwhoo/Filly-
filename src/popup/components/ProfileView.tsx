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

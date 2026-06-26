import type { Profile } from '~/types'

interface ProfileViewProps {
  profile: Profile
  onEdit: () => void
  onFill: () => void
  onExport: () => void
  onImport: () => void
  onClear: () => void
}

function Avatar({ name }: { name: string }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  return (
    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
      {initial}
    </div>
  )
}

function FillIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function ImportIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

export function ProfileView({
  profile,
  onEdit,
  onFill,
  onExport,
  onImport,
  onClear,
}: ProfileViewProps) {
  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Your Profile'

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-purple-100 shadow-md">
        <Avatar name={displayName} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
          {profile.email && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{profile.email}</p>
          )}
          {(profile.currentCompany || profile.currentRole) && (
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {[profile.currentCompany, profile.currentRole].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onFill}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-2xl px-4 py-3 hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
      >
        <FillIcon />
        Fill Current Page
      </button>

      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onEdit}
          className="flex flex-col items-center gap-1 bg-white text-gray-600 text-xs rounded-2xl px-2 py-2.5 hover:bg-gray-50 hover:text-gray-800 transition-colors border border-gray-200 shadow-sm"
        >
          <EditIcon />
          Edit
        </button>
        <button
          onClick={onExport}
          className="flex flex-col items-center gap-1 bg-white text-gray-600 text-xs rounded-2xl px-2 py-2.5 hover:bg-gray-50 hover:text-gray-800 transition-colors border border-gray-200 shadow-sm"
        >
          <ExportIcon />
          Export
        </button>
        <button
          onClick={onImport}
          className="flex flex-col items-center gap-1 bg-white text-gray-600 text-xs rounded-2xl px-2 py-2.5 hover:bg-gray-50 hover:text-gray-800 transition-colors border border-gray-200 shadow-sm"
        >
          <ImportIcon />
          Import
        </button>
        <button
          onClick={onClear}
          className="flex flex-col items-center gap-1 bg-white text-red-500 text-xs rounded-2xl px-2 py-2.5 hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-200 shadow-sm"
        >
          <TrashIcon />
          Clear
        </button>
      </div>
    </div>
  )
}

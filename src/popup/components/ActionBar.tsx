import { forwardRef } from 'react'

interface ActionBarProps {
  onImport: (json: string) => void
  onImportError: (error: string) => void
}

export const ActionBar = forwardRef<HTMLInputElement, ActionBarProps>(
  function ActionBar({ onImport, onImportError }, ref) {
    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string
          onImport(text)
        } catch {
          onImportError('Failed to read file')
        }
      }
      reader.onerror = () => onImportError('Failed to read file')
      reader.readAsText(file)

      e.target.value = ''
    }

    return (
      <input
        ref={ref}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="hidden"
      />
    )
  },
)

import { useCallback, useEffect, useState } from 'react'
import type { SettingsRow } from '../store/rows'
import { getSettings } from './api'

// Loads the single settings row for a dashboard panel.
export function useSettingsRow() {
  const [row, setRow] = useState<SettingsRow | null | undefined>(undefined)
  const [error, setError] = useState('')

  const fetchRow = useCallback(
    () =>
      getSettings().then(
        (next) => {
          setRow(next)
          setError('')
        },
        (e: Error) => setError(e.message),
      ),
    [],
  )

  useEffect(() => {
    fetchRow()
  }, [fetchRow])

  const load = () => {
    setError('')
    setRow(undefined)
    void fetchRow()
  }

  return { row, setRow, error, load }
}

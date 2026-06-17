const SYNC_KEYS = [
  'assessment_answers',
  'exercise_sessions',
  'followup_records',
  'learn_card_state',
  'symptom_lock',
  'exercise_pause',
] as const

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

export function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem('device_id')
    if (!id) {
      id = generateUUID()
      localStorage.setItem('device_id', id)
    }
    return id
  } catch {
    return ''
  }
}

export async function syncToCloud(): Promise<void> {
  try {
    const deviceId = getOrCreateDeviceId()
    if (!deviceId) return

    const data: Record<string, unknown> = {}
    for (const key of SYNC_KEYS) {
      const raw = localStorage.getItem(key)
      if (raw) {
        try { data[key] = JSON.parse(raw) } catch { /* skip malformed */ }
      }
    }

    await fetch('/api/data/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, data }),
    })
  } catch {
    // 静默失败，localStorage 是主数据源
  }
}

export async function restoreFromCloud(deviceId: string): Promise<'ok' | 'not_found' | 'error'> {
  try {
    const res = await fetch('/api/data/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId.trim() }),
    })

    if (res.status === 404) return 'not_found'
    if (!res.ok) return 'error'

    const restored = await res.json() as Record<string, unknown>

    for (const key of SYNC_KEYS) {
      if (restored[key] != null) {
        localStorage.setItem(key, JSON.stringify(restored[key]))
      }
    }
    localStorage.setItem('device_id', deviceId.trim())

    return 'ok'
  } catch {
    return 'error'
  }
}

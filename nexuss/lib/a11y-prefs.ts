export type TextSize = 'default' | 'large' | 'xlarge'

export interface Prefs {
  textSize: TextSize
  highContrast: boolean
  reduceMotion: boolean
}

export const DEFAULT_PREFS: Prefs = {
  textSize: 'default',
  highContrast: false,
  reduceMotion: false,
}

const STORAGE_KEY = 'nexus-a11y'

export function loadPrefs(): Prefs {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFS
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFS

    const parsed = JSON.parse(raw)
    const validSizes: TextSize[] = ['default', 'large', 'xlarge']
    const textSize: TextSize = validSizes.includes(parsed?.textSize) ? parsed.textSize : DEFAULT_PREFS.textSize
    const highContrast = typeof parsed?.highContrast === 'boolean' ? parsed.highContrast : DEFAULT_PREFS.highContrast
    const reduceMotion = typeof parsed?.reduceMotion === 'boolean' ? parsed.reduceMotion : DEFAULT_PREFS.reduceMotion

    return { textSize, highContrast, reduceMotion }
  } catch {
    return DEFAULT_PREFS
  }
}

export function savePrefs(prefs: Prefs): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch (err) {
    console.error('Failed to save accessibility preferences to localStorage', err)
  }
}

export function applyPrefs(prefs: Prefs): void {
  if (typeof window === 'undefined') return

  const doc = document.documentElement
  if (!doc) return

  // Text size: data-text-size="default|large|xlarge"
  doc.setAttribute('data-text-size', prefs.textSize || 'default')

  // High contrast: data-contrast="high" (remove attribute if false)
  if (prefs.highContrast) {
    doc.setAttribute('data-contrast', 'high')
  } else {
    doc.removeAttribute('data-contrast')
  }

  // Reduce motion: data-motion="reduce" (remove attribute if false)
  if (prefs.reduceMotion) {
    doc.setAttribute('data-motion', 'reduce')
  } else {
    doc.removeAttribute('data-motion')
  }
}

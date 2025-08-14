import { useEffect, useMemo, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

const MODES = [
  { key: 'system', icon: Monitor, label: 'System' },
  { key: 'light', icon: Sun, label: 'Light' },
  { key: 'dark', icon: Moon, label: 'Dark' },
]

const segmentWidth = 36
const segmentHeight = 28
const segmentGap = 6

export default function ThemeSwitch() {
  const [mode, setMode] = useState('system')

  useEffect(() => {
    try {
      const t = window.localStorage.getItem('theme')
      setMode(t === 'light' || t === 'dark' ? t : 'system')
    } catch (_) {}
  }, [])

  const thumbX = useMemo(() => {
    const idx = MODES.findIndex((m) => m.key === mode)
    return 4 + idx * (segmentWidth + segmentGap)
  }, [mode])

  const apply = (next) => {
    setMode(next)
    if (typeof window !== 'undefined' && typeof window.__setTheme === 'function') {
      window.__setTheme(next)
    }
  }

  return (
    <div className="theme-switch" aria-label="Theme switch" role="tablist">
      <div className="theme-thumb" style={{ transform: `translateX(${thumbX}px)`, width: segmentWidth, height: segmentHeight }} />
      {MODES.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          className={`theme-option ${mode === key ? 'is-active' : ''}`}
          aria-pressed={mode === key}
          title={label}
          onClick={() => apply(key)}
          style={{ width: segmentWidth, height: segmentHeight }}
        >
          <Icon size={16} strokeWidth={2} />
        </button>
      ))}
    </div>
  )
}



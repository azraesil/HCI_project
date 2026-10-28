'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Kayıtlı tema veya sistem tercihi kontrolü
    const savedTheme = localStorage.getItem('nexus-theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('nexus-theme', nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  }

  // Hydration hatasını önlemek için mount olana kadar boş buton göster
  if (!mounted) {
    return (
      <div className="size-10 rounded-lg border border-border bg-card/50" />
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'light' ? 'Switch to Dark mode' : 'Switch to Light mode'}
      aria-label={theme === 'light' ? 'Switch to Dark mode' : 'Switch to Light mode'}
      className="relative flex size-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {theme === 'light' ? (
        <Moon className="size-[18px] text-slate-700 transition-transform duration-200 hover:-rotate-12" />
      ) : (
        <Sun className="size-[18px] text-amber-400 transition-transform duration-200 hover:rotate-45" />
      )}
      <span className="sr-only">
        {theme === 'light' ? 'Switch to Dark mode' : 'Switch to Light mode'}
      </span>
    </button>
  )
}
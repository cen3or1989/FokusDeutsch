import { useState, useEffect, useCallback } from 'react'

export const useExamTimer = (onPhaseChange, onTimeUp) => {
  // Timer phases: 'initial', 'teil1-3', 'schriftlich', 'completed'
  const [phase, setPhase] = useState('initial')
  
  // Main timer (90 min for Teil 1-3, then 30 min for Schriftlicher Ausdruck)
  const [mainTimeRemaining, setMainTimeRemaining] = useState(5400) // 90 minutes
  
  // Sub-timer for Hörverstehen (20 minutes hard limit)
  const [hoerTimeRemaining, setHoerTimeRemaining] = useState(1200) // 20 minutes
  const [isHoerActive, setIsHoerActive] = useState(false)
  const [hoerLocked, setHoerLocked] = useState(false)
  
  const [isRunning, setIsRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  // Main timer effect
  useEffect(() => {
    let interval = null
    if (isRunning && mainTimeRemaining > 0) {
      interval = setInterval(() => {
        setMainTimeRemaining(time => {
          if (time <= 1) {
            if (phase === 'teil1-3') {
              // Transition to Schriftlicher Ausdruck phase
              setPhase('schriftlich')
              setMainTimeRemaining(1800) // 30 minutes
              onPhaseChange?.('schriftlich')
              return 1800
            } else if (phase === 'schriftlich') {
              // Exam completed
              setIsRunning(false)
              setPhase('completed')
              onTimeUp?.()
              return 0
            }
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, mainTimeRemaining, phase, onPhaseChange, onTimeUp])

  // Hörverstehen sub-timer effect
  useEffect(() => {
    let interval = null
    if (isRunning && isHoerActive && hoerTimeRemaining > 0 && !hoerLocked) {
      interval = setInterval(() => {
        setHoerTimeRemaining(time => {
          if (time <= 1) {
            setHoerLocked(true)
            setIsHoerActive(false)
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, isHoerActive, hoerTimeRemaining, hoerLocked])

  // Prevent accidental leave while timer running
  useEffect(() => {
    const handler = (e) => {
      if (isRunning) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isRunning])

  const startTimer = useCallback(() => {
    setIsRunning(true)
    setHasStarted(true)
    setPhase('teil1-3')
    setMainTimeRemaining(5400) // 90 minutes
    sessionStorage.setItem('exam_in_progress', '1')
    onPhaseChange?.('teil1-3')
  }, [onPhaseChange])

  const stopTimer = useCallback(() => {
    setIsRunning(false)
    sessionStorage.removeItem('exam_in_progress')
  }, [])

  const startHoerverstehen = useCallback(() => {
    if (phase === 'teil1-3' && !hoerLocked) {
      setIsHoerActive(true)
      setHoerTimeRemaining(1200) // Reset to 20 minutes
    }
  }, [phase, hoerLocked])

  const startSchriftlicherAusdruck = useCallback(() => {
    if (phase === 'teil1-3') {
      setPhase('schriftlich')
      setMainTimeRemaining(1800) // 30 minutes
      setIsHoerActive(false)
      onPhaseChange?.('schriftlich')
    }
  }, [phase, onPhaseChange])

  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const getTimeColor = useCallback((timeRemaining) => {
    if (timeRemaining <= 300) return 'var(--error-color)' // Last 5 minutes
    if (timeRemaining <= 600) return 'var(--warning-color)' // Last 10 minutes
    return 'var(--text-color)'
  }, [])

  const getCurrentDisplayTime = useCallback(() => {
    if (isHoerActive && !hoerLocked) {
      return hoerTimeRemaining
    }
    return mainTimeRemaining
  }, [isHoerActive, hoerLocked, hoerTimeRemaining, mainTimeRemaining])

  const getCurrentTimerLabel = useCallback(() => {
    if (phase === 'schriftlich') {
      return 'Schriftlicher Ausdruck'
    }
    if (isHoerActive && !hoerLocked) {
      return 'Hörverstehen'
    }
    if (phase === 'teil1-3') {
      return 'Lesen, Sprachbausteine & Hören'
    }
    return 'Prüfung'
  }, [phase, isHoerActive, hoerLocked])

  return {
    // Current state
    phase,
    timeRemaining: getCurrentDisplayTime(),
    mainTimeRemaining,
    hoerTimeRemaining,
    isRunning,
    hasStarted,
    isHoerActive,
    hoerLocked,
    
    // Actions
    startTimer,
    stopTimer,
    startHoerverstehen,
    startSchriftlicherAusdruck,
    
    // Display helpers
    formatTime: formatTime(getCurrentDisplayTime()),
    mainFormatTime: formatTime(mainTimeRemaining),
    hoerFormatTime: formatTime(hoerTimeRemaining),
    timeColor: getTimeColor(getCurrentDisplayTime()),
    timerLabel: getCurrentTimerLabel(),
    
    // Phase checks
    canAccessTeil1_3: phase === 'teil1-3',
    canAccessSchriftlich: phase === 'schriftlich',
    canAccessHoeren: phase === 'teil1-3' && !hoerLocked,
    isCompleted: phase === 'completed'
  }
}

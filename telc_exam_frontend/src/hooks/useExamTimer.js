import { useState, useEffect, useCallback } from 'react'

export const useExamTimer = (initialTime = 5400, onTimeUp) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    let interval = null
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsRunning(false)
            onTimeUp?.()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, timeRemaining, onTimeUp])

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
    sessionStorage.setItem('exam_in_progress', '1')
  }, [])

  const stopTimer = useCallback(() => {
    setIsRunning(false)
    sessionStorage.removeItem('exam_in_progress')
  }, [])

  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const getTimeColor = useCallback(() => {
    if (timeRemaining <= 540) return 'var(--error-color)'
    if (timeRemaining <= 1080) return 'var(--warning-color)'
    return 'var(--text-color)'
  }, [timeRemaining])

  return {
    timeRemaining,
    isRunning,
    hasStarted,
    startTimer,
    stopTimer,
    formatTime: formatTime(timeRemaining),
    timeColor: getTimeColor()
  }
}

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/lib/api'
import { useExamTimer } from '@/hooks/useExamTimer'
import { useExamAnswers } from '@/hooks/useExamAnswers'
import { useTranslation } from '@/hooks/useTranslation'
import { useAudio } from '@/hooks/useAudio'

const ExamContext = createContext()

export const useExam = () => {
  const context = useContext(ExamContext)
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider')
  }
  return context
}

export const ExamProvider = ({ children, examId, onComplete, onCancelExam }) => {
  const [exam, setExam] = useState(null)
  const [originalExam, setOriginalExam] = useState(null)
  const [currentSection, setCurrentSection] = useState('leseverstehen')
  const [studentName, setStudentName] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  // Tab states
  const [leseTab, setLeseTab] = useState('teil1')
  const [sprachTab, setSprachTab] = useState('teil1')
  const [hoerTab, setHoerTab] = useState('teil1')

  // Section language states
  const [sectionLang, setSectionLang] = useState({
    lv1: 'de', lv2: 'de', lv3: 'de', sb1: 'de', sb2: 'de', sa: 'de',
    hv_teil1: 'de', hv_teil2: 'de', hv_teil3: 'de'
  })

  // Reset section languages when main section changes
  useEffect(() => {
    console.log('Section changed to:', currentSection)
    setSectionLang({
      lv1: 'de', lv2: 'de', lv3: 'de', sb1: 'de', sb2: 'de', sa: 'de',
      hv_teil1: 'de', hv_teil2: 'de', hv_teil3: 'de'
    })
  }, [currentSection])

  // Handle submit function
  const handleSubmitCallback = useCallback(async () => {
    if (!studentName.trim()) {
      toast.error('Bitte geben Sie Ihren Namen ein')
      return
    }

    try {
      const normalizedAnswers = answersHook.normalizeAnswersForSubmit()
      
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_name: studentName,
          answers: normalizedAnswers,
          timer_phase: timer.phase
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setIsSubmitted(true)
        onComplete(result)
      } else {
        toast.error('Fehler beim Einreichen der Prüfung')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Fehler beim Einreichen der Prüfung')
    }
  }, [studentName, examId, onComplete])

  // Phase change handler
  const handlePhaseChange = useCallback((newPhase) => {
    console.log('Phase changed to:', newPhase)
    if (newPhase === 'schriftlich') {
      // Auto-navigate to Schriftlicher Ausdruck when phase changes
      setCurrentSection('schriftlicher_ausdruck')
      toast.info('Zeit für Teil 1-3 beendet. Schriftlicher Ausdruck beginnt jetzt.')
    }
  }, [])

  // Custom hooks
  const timer = useExamTimer(handlePhaseChange, handleSubmitCallback)
  const answersHook = useExamAnswers(exam || {}) // Pass empty object if exam is null
  const translation = useTranslation(examId)
  const audio = useAudio()

  // Load exam data
  useEffect(() => {
    if (examId) {
      fetchExam()
    }
  }, [examId])

  // Load translations when exam loads
  useEffect(() => {
    if (exam) {
      translation.loadClientTranslations()
    }
  }, [exam])

  // Clear flag when submitted
  useEffect(() => {
    if (isSubmitted) {
      sessionStorage.removeItem('exam_in_progress')
    }
  }, [isSubmitted])

  const fetchExam = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}`)
      const data = await response.json()
      setExam(data)
      setOriginalExam(structuredClone(data))
    } catch (error) {
      console.error('Failed to fetch exam:', error)
    } finally {
      setLoading(false)
    }
  }

  // Navigation restrictions based on timer phase and progress
  const canNavigateToSection = useCallback((section) => {
    if (section === 'leseverstehen' || section === 'sprachbausteine') {
      return timer.canAccessTeil1_3
    }
    if (section === 'hoerverstehen') {
      return timer.canAccessHoeren
    }
    if (section === 'schriftlicher_ausdruck') {
      // For Schriftlicher Ausdruck: need timer access + minimum 50% progress
      const teil1_3Progress = answersHook.getTeil1_3Progress()
      return timer.canAccessSchriftlich && teil1_3Progress.hasMinimumForWriting
    }
    return false
  }, [timer, answersHook])

  // Enhanced setCurrentSection with phase restrictions
  const setCurrentSectionSafe = useCallback((section) => {
    if (canNavigateToSection(section)) {
      setCurrentSection(section)
      
      // Start Hörverstehen timer when entering that section
      if (section === 'hoerverstehen' && timer.phase === 'teil1-3') {
        timer.startHoerverstehen()
        toast.info('Hörverstehen Timer gestartet: 20 Minuten')
      }
    } else {
      if (timer.phase === 'schriftlich' && section !== 'schriftlicher_ausdruck') {
        toast.error('Rückkehr zu Teil 1-3 ist nicht mehr möglich')
      } else if (timer.hoerLocked && section === 'hoerverstehen') {
        toast.error('Hörverstehen Zeit ist abgelaufen')
      } else if (section === 'schriftlicher_ausdruck') {
        const teil1_3Progress = answersHook.getTeil1_3Progress()
        if (!timer.canAccessSchriftlich) {
          toast.error('Schriftlicher Ausdruck ist noch nicht verfügbar')
        } else if (!teil1_3Progress.hasMinimumForWriting) {
          toast.error(`Sie müssen mindestens 50% der Aufgaben (${Math.ceil(teil1_3Progress.total * 0.5)}/${teil1_3Progress.total}) in Teil 1-3 beantworten`)
        }
      } else {
        toast.error('Dieser Bereich ist derzeit nicht verfügbar')
      }
    }
  }, [canNavigateToSection, timer])

  const value = {
    // Exam data
    exam,
    originalExam,
    loading,
    
    // Navigation
    currentSection,
    setCurrentSection: setCurrentSectionSafe,
    canNavigateToSection,
    leseTab,
    setLeseTab,
    sprachTab,
    setSprachTab,
    hoerTab,
    setHoerTab,
    
    // Student info
    studentName,
    setStudentName,
    isSubmitted,
    
    // Language
    sectionLang,
    setSectionLang,
    
    // Hooks
    timer,
    answers: answersHook,
    translation,
    audio,
    
    // Actions
    handleSubmit: handleSubmitCallback,
    onCancelExam,
    
    // Utilities
    setExam
  }


  
  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  )
}

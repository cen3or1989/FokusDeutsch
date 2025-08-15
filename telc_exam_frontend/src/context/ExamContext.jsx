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

  // Custom hooks - MUST be defined before using them
  const answersHook = useExamAnswers(exam || {}) // Pass empty object if exam is null
  const translation = useTranslation(examId)
  const audio = useAudio()

  // Handle submit function
  const handleSubmitCallback = useCallback(async () => {
    if (!studentName.trim()) {
      toast.error('Bitte geben Sie Ihren Namen ein')
      return
    }

    try {
      const normalizedAnswers = answersHook.normalizeAnswersForSubmit()
      
      // Debug logging
      console.log('Submitting exam with:', {
        examId,
        studentName,
        normalizedAnswers
      })
      
      const requestBody = {
        student_name: studentName,
        answers: normalizedAnswers,
        timer_phase: timer.phase
      }
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2))
      
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        
        try {
          const errorJson = JSON.parse(errorText)
          console.error('Error JSON:', errorJson)
        } catch (e) {
          console.error('Could not parse error response as JSON')
        }
      }
      
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
  }, [studentName, examId, onComplete, answersHook, timer.phase])

  // Timer hook MUST come after handleSubmitCallback
  const timer = useExamTimer(5400, handleSubmitCallback)

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

  // Navigation logic
  const canNavigateToSection = useCallback((sectionKey) => {
    if (!timer.hasStarted) return false
    
    switch (sectionKey) {
      case 'leseverstehen':
      case 'sprachbausteine':
        return timer.phase === 'teil1-3'
      case 'hoerverstehen':
        return timer.phase === 'teil1-3' && !timer.hoerLocked
      case 'schriftlicher_ausdruck':
        return timer.phase === 'schriftlich' || 
               (timer.phase === 'teil1-3' && answersHook.getTeil1_3Progress().hasMinimumForWriting)
      default:
        return false
    }
  }, [timer, answersHook])

  const value = {
    // Exam data
    exam,
    originalExam,
    loading,
    
    // Navigation
    currentSection,
    setCurrentSection,
    leseTab,
    setLeseTab,
    sprachTab,
    setSprachTab,
    hoerTab,
    setHoerTab,
    canNavigateToSection,
    
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

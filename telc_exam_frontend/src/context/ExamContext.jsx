import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/lib/api'
import { useExamTimer } from '@/hooks/useExamTimer'
import { useExamAnswers } from '@/hooks/useExamAnswers'
import { useTranslation } from '@/hooks/useTranslation'
import { useAudio } from '@/hooks/useAudio'
import { logError, logApiCall, logComponentRender } from '@/lib/debugUtils'

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

  // Handle submit function - without timer dependency to avoid circular dependency
  const handleSubmitCallback = useCallback(async (timerPhase = 'teil1-3') => {
    if (!studentName.trim()) {
      toast.error('Bitte geben Sie Ihren Namen ein')
      return
    }

    try {
      let normalizedAnswers = answersHook.normalizeAnswersForSubmit()
      
      // Filter out schriftlicher_ausdruck when in teil1-3 phase
      if (timerPhase === 'teil1-3') {
        const { schriftlicher_ausdruck, ...filteredAnswers } = normalizedAnswers
        normalizedAnswers = filteredAnswers
      }
      
      // Debug logging
      console.log('Submitting exam with:', {
        examId,
        studentName,
        normalizedAnswers,
        timerPhase
      })
      
      const requestBody = {
        student_name: studentName,
        answers: normalizedAnswers,
        timer_phase: timerPhase
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
          // Show specific error message if available
          toast.error(errorJson.error || 'Fehler beim Einreichen der Prüfung')
        } catch (e) {
          console.error('Could not parse error response as JSON')
          toast.error('Fehler beim Einreichen der Prüfung')
        }
        return
      }
      
      if (response.ok) {
        const result = await response.json()
        console.log('Submission successful:', result)
        setIsSubmitted(true)
        toast.success('Prüfung erfolgreich eingereicht!')
        if (onComplete) {
          onComplete(result)
        }
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Netzwerkfehler beim Einreichen der Prüfung')
    }
  }, [studentName, examId, onComplete, answersHook])

  // Create a ref to store the timer
  const timerRef = useRef(null)
  
  // Timer hook with submit callback that gets phase at runtime
  const timer = useExamTimer(5400, () => {
    const currentPhase = timerRef.current?.phase || 'teil1-3'
    handleSubmitCallback(currentPhase)
  })
  
  // Update the ref when timer changes
  useEffect(() => {
    timerRef.current = timer
  }, [timer])

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
    const startTime = performance.now()
    
    try {
      setLoading(true)
      logComponentRender('ExamContext', { examId })
      
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}`)
      const duration = performance.now() - startTime
      
      logApiCall(`${API_BASE_URL}/api/exams/${examId}`, 'GET', response.status, duration)
      
      if (!response.ok) {
        const errorText = await response.text()
        const error = new Error(`Failed to fetch exam: ${response.status} ${response.statusText}`)
        logError(error, { 
          type: 'api_error',
          examId,
          responseText: errorText,
          status: response.status
        })
        throw error
      }
      
      const data = await response.json()
      
      if (!data || !data.id) {
        const error = new Error('Invalid exam data received from server')
        logError(error, { 
          type: 'invalid_data',
          examId,
          data: data
        })
        throw error
      }
      
      setExam(data)
      setOriginalExam(structuredClone(data))
      console.log('Exam loaded successfully')
    } catch (error) {
      logError(error, { 
        type: 'exam_fetch_error',
        examId,
        duration: performance.now() - startTime
      })
      
      // Set a minimal exam object to prevent white screen
      setExam({
        id: examId,
        title: 'Prüfung',
        error: true,
        errorMessage: error.message
      })
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

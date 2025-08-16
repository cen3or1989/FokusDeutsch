import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/lib/api'
import { useExamTimer } from '@/hooks/useExamTimer'
import { useExamAnswers } from '@/hooks/useExamAnswers'
import { useTranslation } from '@/hooks/useTranslation'
import { useAudio } from '@/hooks/useAudio'
import { logError, logApiCall, logComponentRender, logSubmissionAttempt, validateAnswers } from '@/lib/debugUtils'

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
  const handleSubmitCallback = useCallback(async (timerPhase = null) => {
    if (!studentName.trim()) {
      toast.error('Bitte geben Sie Ihren Namen ein')
      return
    }

    // Determine the correct timer phase if not provided
    let currentTimerPhase = timerPhase
    if (!currentTimerPhase || typeof currentTimerPhase !== 'string') {
      // Get the current timer phase from the timer ref
      currentTimerPhase = timerRef.current?.phase || 'teil1-3'
    }

    // Safety check to ensure we have a valid timer phase
    if (!['teil1-3', 'schriftlich'].includes(currentTimerPhase)) {
      console.warn('Invalid timer phase detected, defaulting to teil1-3:', currentTimerPhase)
      currentTimerPhase = 'teil1-3'
    }

    try {
      let normalizedAnswers = answersHook.normalizeAnswersForSubmit()
      
      // Log submission attempt for debugging
      logSubmissionAttempt(examId, normalizedAnswers, currentTimerPhase, studentName)
      
      // Validate answers before submission
      const validation = validateAnswers(normalizedAnswers)
      if (!validation.isValid) {
        console.warn('Answer validation issues:', validation.issues)
        // Don't block submission for validation issues, just log them
      }
      
      // Filter out schriftlicher_ausdruck when in teil1-3 phase
      if (currentTimerPhase === 'teil1-3') {
        const { schriftlicher_ausdruck, ...filteredAnswers } = normalizedAnswers
        normalizedAnswers = filteredAnswers
      }
      
      // Additional validation before submission
      const totalAnswered = Object.values(normalizedAnswers).reduce((total, section) => {
        if (section === 'hoerverstehen') {
          return total + Object.values(section).reduce((hvTotal, teil) => {
            return hvTotal + (Array.isArray(teil) ? teil.filter(v => typeof v === 'boolean').length : 0)
          }, 0)
        } else if (Array.isArray(section)) {
          return total + section.filter(v => v !== '' && v !== undefined && v !== null).length
        }
        return total
      }, 0)

      if (totalAnswered === 0) {
        toast.error('Bitte beantworten Sie mindestens eine Frage vor dem Einreichen')
        return
      }
      
      // Debug logging - use a safe object for logging
      const debugInfo = {
        examId,
        studentName,
        timerPhase: currentTimerPhase,
        totalAnswered,
        validationIssues: validation.issues,
        answerSections: Object.keys(normalizedAnswers)
      }
      console.log('Submitting exam with:', debugInfo)
      
      const requestBody = {
        student_name: studentName,
        answers: normalizedAnswers,
        timer_phase: currentTimerPhase
      }
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2))
      
      const startTime = performance.now()
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      const duration = performance.now() - startTime
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      const responseText = await response.text()
      console.log('Response text:', responseText)
      
      // Log API call
      logApiCall(`${API_BASE_URL}/api/exams/${examId}/submit`, 'POST', response.status, duration, {
        examId,
        studentName,
        timerPhase: currentTimerPhase,
        totalAnswered
      })
      
      if (!response.ok) {
        console.error('Error response:', responseText)
        
        try {
          const errorJson = JSON.parse(responseText)
          console.error('Error JSON:', errorJson)
          
          // Show specific error message if available
          const errorMessage = errorJson.error || errorJson.message || 'Fehler beim Einreichen der Prüfung'
          toast.error(errorMessage)
          
          // Log detailed error information
          logError(new Error(errorMessage), {
            type: 'submission_error',
            examId,
            status: response.status,
            errorJson,
            requestBody: {
              student_name: requestBody.student_name,
              timer_phase: requestBody.timer_phase,
              answerSections: Object.keys(requestBody.answers)
            }
          })
        } catch (e) {
          console.error('Could not parse error response as JSON:', e)
          toast.error(`Fehler beim Einreichen der Prüfung (Status: ${response.status})`)
          
          logError(new Error(`HTTP ${response.status}: ${responseText}`), {
            type: 'submission_http_error',
            examId,
            status: response.status,
            responseText,
            requestBody: {
              student_name: requestBody.student_name,
              timer_phase: requestBody.timer_phase,
              answerSections: Object.keys(requestBody.answers)
            }
          })
        }
        return
      }
      
      if (response.ok) {
        let result
        try {
          result = JSON.parse(responseText)
        } catch (e) {
          console.error('Could not parse success response as JSON:', e)
          toast.error('Unerwartetes Antwortformat vom Server')
          return
        }
        
        console.log('Submission successful:', result)
        setIsSubmitted(true)
        toast.success('Prüfung erfolgreich eingereicht!')
        
        if (onComplete) {
          onComplete(result)
        }
      }
    } catch (error) {
      console.error('Submit error:', error)
      
      // Log network errors
      logError(error, {
        type: 'submission_network_error',
        examId,
        studentName,
        timerPhase: currentTimerPhase
      })
      
      toast.error('Netzwerkfehler beim Einreichen der Prüfung. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.')
    }
  }, [studentName, examId, onComplete, answersHook])

  // Create a ref to store the timer
  const timerRef = useRef(null)
  
  // Timer hook with callbacks
  const timer = useExamTimer(
    // onPhaseChange
    (newPhase) => {
      // No-op for now; could be used for analytics or UI updates
      console.log('Timer phase changed to:', newPhase)
    },
    // onTimeUp
    () => {
      const currentPhase = timerRef.current?.phase || 'teil1-3'
      handleSubmitCallback(currentPhase)
    }
  )
  
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
    const currentTimer = timerRef.current
    if (!currentTimer?.hasStarted) return false
    
    switch (sectionKey) {
      case 'leseverstehen':
      case 'sprachbausteine':
        return currentTimer.phase === 'teil1-3'
      case 'hoerverstehen':
        return currentTimer.phase === 'teil1-3' && !currentTimer.hoerLocked
      case 'schriftlicher_ausdruck':
        return currentTimer.phase === 'schriftlich' || 
               (currentTimer.phase === 'teil1-3' && answersHook.getTeil1_3Progress().hasMinimumForWriting)
      default:
        return false
    }
  }, [answersHook])

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

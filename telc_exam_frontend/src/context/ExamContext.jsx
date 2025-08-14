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
      
      console.log('Submitting exam:', {
        examId,
        studentName,
        answers: normalizedAnswers,
        apiUrl: `${API_BASE_URL}/api/exams/${examId}/submit`
      })
      
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_name: studentName,
          answers: normalizedAnswers
        })
      })
      
      const responseText = await response.text()
      console.log('Submit response:', response.status, responseText)
      
      if (response.ok) {
        try {
          const result = JSON.parse(responseText)
          setIsSubmitted(true)
          onComplete(result)
        } catch (e) {
          console.error('Failed to parse response:', e)
          toast.error('Fehler beim Verarbeiten der Antwort')
        }
      } else {
        // Try to parse error message
        let errorMessage = 'Fehler beim Einreichen der Prüfung'
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `Fehler ${response.status}: ${response.statusText || 'Unbekannter Fehler'}`
        }
        console.error('Submit failed:', response.status, responseText)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Submit error:', error)
      if (error.message === 'Failed to fetch') {
        toast.error('Keine Verbindung zum Server. Bitte stellen Sie sicher, dass der Backend-Server läuft.')
      } else {
        toast.error(`Fehler beim Einreichen: ${error.message}`)
      }
    }
  }, [studentName, examId, onComplete, answersHook])

  // Custom hooks
  const timer = useExamTimer(5400, handleSubmitCallback)
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

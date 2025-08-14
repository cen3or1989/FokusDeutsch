import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useExam } from '@/context/ExamContext'

const QuickAnswerMap = () => {
  const { answers, setCurrentSection, setLeseTab, setSprachTab, setHoerTab } = useExam()
  const [isVisible, setIsVisible] = useState(true)

  // Get answers data safely
  const answersData = answers?.answers || {}

  // Simple and reliable answer status check
  const isAnswered = (questionNum) => {
    if (!answersData) return false
    
    // Questions 1-5: Leseverstehen Teil 1
    if (questionNum <= 5) {
      const answer = answersData.leseverstehen_teil1?.[questionNum - 1]
      return answer !== '' && answer !== null && answer !== undefined
    }
    
    // Questions 6-10: Leseverstehen Teil 2  
    if (questionNum <= 10) {
      const answer = answersData.leseverstehen_teil2?.[questionNum - 6]
      return answer !== '' && answer !== null && answer !== undefined
    }
    
    // Questions 11-20: Leseverstehen Teil 3
    if (questionNum <= 20) {
      const answer = answersData.leseverstehen_teil3?.[questionNum - 11]
      return answer !== '' && answer !== null && answer !== undefined
    }
    
    // Questions 21-30: Sprachbausteine Teil 1
    if (questionNum <= 30) {
      const answer = answersData.sprachbausteine_teil1?.[questionNum - 21]
      return answer !== '' && answer !== null && answer !== undefined
    }
    
    // Questions 31-40: Sprachbausteine Teil 2
    if (questionNum <= 40) {
      const answer = answersData.sprachbausteine_teil2?.[questionNum - 31]
      return answer !== '' && answer !== null && answer !== undefined
    }
    
    // Questions 41-45: Hörverstehen Teil 1
    if (questionNum <= 45) {
      const answer = answersData.hoerverstehen?.teil1?.[questionNum - 41]
      return typeof answer === 'boolean'
    }
    
    // Questions 46-55: Hörverstehen Teil 2
    if (questionNum <= 55) {
      const answer = answersData.hoerverstehen?.teil2?.[questionNum - 46]
      return typeof answer === 'boolean'
    }
    
    // Questions 56-60: Hörverstehen Teil 3
    const answer = answersData.hoerverstehen?.teil3?.[questionNum - 56]
    return typeof answer === 'boolean'
  }

  // Navigate to specific question
  const goToQuestion = (questionNum) => {
    if (questionNum <= 5) {
      setCurrentSection('leseverstehen')
      setLeseTab('teil1')
    } else if (questionNum <= 10) {
      setCurrentSection('leseverstehen') 
      setLeseTab('teil2')
    } else if (questionNum <= 20) {
      setCurrentSection('leseverstehen')
      setLeseTab('teil3')
    } else if (questionNum <= 30) {
      setCurrentSection('sprachbausteine')
      setSprachTab('teil1')
    } else if (questionNum <= 40) {
      setCurrentSection('sprachbausteine')
      setSprachTab('teil2')
    } else if (questionNum <= 45) {
      setCurrentSection('hoerverstehen')
      setHoerTab('teil1')
    } else if (questionNum <= 55) {
      setCurrentSection('hoerverstehen')
      setHoerTab('teil2')
    } else {
      setCurrentSection('hoerverstehen')
      setHoerTab('teil3')
    }
  }

  // Calculate answered questions count
  const answeredCount = Array.from({ length: 60 }, (_, i) => i + 1)
    .filter(num => isAnswered(num)).length

  if (!isVisible) {
    return (
      <div className="fixed right-4 bottom-4 z-40">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg transition-all duration-200"
          title="Antwortübersicht anzeigen"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed right-4 bottom-4 z-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 max-w-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Antwortübersicht
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {answeredCount}/60
          </span>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
            title="Ausblenden"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-6 gap-1">
        {Array.from({ length: 60 }, (_, i) => i + 1).map((questionNum) => {
          const answered = isAnswered(questionNum)
          
          return (
            <button
              key={questionNum}
              onClick={() => goToQuestion(questionNum)}
              className={`
                w-8 h-8 text-xs font-medium rounded transition-all duration-200 hover:scale-105
                ${answered 
                  ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }
              `}
              title={`Frage ${questionNum} ${answered ? '(beantwortet)' : '(nicht beantwortet)'}`}
            >
              {questionNum}
            </button>
          )
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">Fortschritt</span>
          <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
            {Math.round((answeredCount / 60) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / 60) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default QuickAnswerMap

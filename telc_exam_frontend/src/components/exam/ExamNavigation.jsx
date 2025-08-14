import { BookOpen, MessageSquare, Headphones, PenLine } from 'lucide-react'
import { useExam } from '@/context/ExamContext'

const ExamNavigation = () => {
  const { currentSection, setCurrentSection, answers } = useExam()

  const sections = [
    { key: 'leseverstehen', label: 'Leseverstehen', icon: BookOpen },
    { key: 'sprachbausteine', label: 'Sprachbausteine', icon: MessageSquare },
    { key: 'hoerverstehen', label: 'Hörverstehen', icon: Headphones },
    { key: 'schriftlicher_ausdruck', label: 'Schriftlicher Ausdruck', icon: PenLine }
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {sections.map(({ key, label, icon: Icon }) => {
        const progress = answers.getProgress(key)
        const isActive = currentSection === key
        
        return (
          <button
            key={key}
            className={`tile-tab ${isActive ? 'active' : ''}`}
            onClick={() => setCurrentSection(key)}
            aria-pressed={isActive}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {progress.total > 0 && (
              <div className="text-xs mt-1 opacity-75">
                {progress.answered}/{progress.total}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default ExamNavigation

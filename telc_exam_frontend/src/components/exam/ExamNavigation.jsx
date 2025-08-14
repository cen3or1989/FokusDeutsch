import { BookOpen, MessageSquare, Headphones, PenLine, Lock, AlertTriangle } from 'lucide-react'
import { useExam } from '@/context/ExamContext'

const ExamNavigation = () => {
  const { currentSection, setCurrentSection, answers, canNavigateToSection, timer } = useExam()
  
  // Get overall progress for Teil 1-3
  const teil1_3Progress = answers.getTeil1_3Progress()

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
        const canAccess = canNavigateToSection(key)
        const isLocked = !canAccess
        const isHoerLocked = key === 'hoerverstehen' && timer.hoerLocked
        
        return (
          <button
            key={key}
            className={`tile-tab ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
            onClick={() => setCurrentSection(key)}
            disabled={isLocked}
            aria-pressed={isActive}
            title={isLocked ? 'Bereich nicht verfügbar' : label}
          >
            <div className="flex items-center gap-1">
              <Icon className="w-5 h-5" />
              {isHoerLocked && <AlertTriangle className="w-3 h-3" style={{ color: 'var(--error-color)' }} />}
              {isLocked && !isHoerLocked && <Lock className="w-3 h-3" />}
            </div>
            <span className={isLocked ? 'opacity-50' : ''}>{label}</span>
            {progress.total > 0 && (
              <div className={`text-xs mt-1 opacity-75 ${isLocked ? 'opacity-25' : ''}`}>
                {progress.answered}/{progress.total}
              </div>
            )}
            {/* Timer info for specific sections */}
            {key === 'hoerverstehen' && timer.phase === 'teil1-3' && (
              <div className="text-xs mt-1">
                {timer.isHoerActive ? (
                  <span style={{ color: 'var(--warning-color)' }}>
                    {timer.hoerFormatTime}
                  </span>
                ) : timer.hoerLocked ? (
                  <span style={{ color: 'var(--error-color)' }}>
                    Gesperrt
                  </span>
                ) : (
                  <span style={{ color: 'var(--muted-foreground)' }}>
                    20 Min.
                  </span>
                )}
              </div>
            )}
            {key === 'schriftlicher_ausdruck' && (
              <div className="text-xs mt-1">
                {timer.phase === 'schriftlich' ? (
                  <span style={{ color: 'var(--warning-color)' }}>
                    {timer.formatTime}
                  </span>
                ) : (
                  <div>
                    {teil1_3Progress.hasMinimumForWriting ? (
                      <span style={{ color: 'var(--success-color)' }}>
                        Verfügbar
                      </span>
                    ) : (
                      <span style={{ color: 'var(--muted-foreground)' }}>
                        {teil1_3Progress.answered}/{Math.ceil(teil1_3Progress.total * 0.5)} (50%)
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default ExamNavigation

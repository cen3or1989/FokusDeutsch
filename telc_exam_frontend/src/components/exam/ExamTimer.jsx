import { Clock, AlertTriangle } from 'lucide-react'
import { useExam } from '@/context/ExamContext'

const ExamTimer = ({ compact = false }) => {
  const { timer } = useExam()

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <div className="flex flex-col">
          <span 
            className="text-sm font-bold" 
            style={{ color: timer.timeColor }}
          >
            {timer.formatTime}
          </span>
          {timer.timerLabel !== 'Prüfung' && (
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {timer.timerLabel}
            </span>
          )}
        </div>
        {timer.hoerLocked && (
          <AlertTriangle className="w-4 h-4" style={{ color: 'var(--error-color)' }} />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <Clock className="w-6 h-6" />
        <span 
          className="text-xl font-bold" 
          style={{ color: timer.timeColor }}
        >
          {timer.formatTime}
        </span>
        {timer.hoerLocked && (
          <AlertTriangle className="w-5 h-5" style={{ color: 'var(--error-color)' }} />
        )}
      </div>
      
      {timer.timerLabel !== 'Prüfung' && (
        <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {timer.timerLabel}
        </span>
      )}
      
      {/* Show additional timer info in Teil 1-3 phase */}
      {timer.phase === 'teil1-3' && (
        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {timer.isHoerActive ? (
            <span>Hörverstehen: {timer.hoerFormatTime} | Gesamt: {timer.mainFormatTime}</span>
          ) : (
            <span>Teil 1-3: {timer.mainFormatTime}</span>
          )}
          {timer.hoerLocked && (
            <span className="block" style={{ color: 'var(--error-color)' }}>
              Hörverstehen gesperrt
            </span>
          )}
        </div>
      )}
      
      {/* Show phase info for Schriftlicher Ausdruck */}
      {timer.phase === 'schriftlich' && (
        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          30 Minuten für Schriftlichen Ausdruck
        </div>
      )}
    </div>
  )
}

export default ExamTimer

import { Clock } from 'lucide-react'
import { useExam } from '@/context/ExamContext'

const ExamTimer = ({ compact = false }) => {
  const { timer } = useExam()

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span 
          className="text-sm font-bold" 
          style={{ color: timer.timeColor }}
        >
          {timer.formatTime}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-6 h-6" />
      <span 
        className="text-xl font-bold" 
        style={{ color: timer.timeColor }}
      >
        {timer.formatTime}
      </span>
    </div>
  )
}

export default ExamTimer

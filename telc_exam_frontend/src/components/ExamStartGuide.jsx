import { useState } from 'react'
import { X, MapPin, FileText, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const ExamStartGuide = ({ 
  studentName, 
  setStudentName, 
  onStartExam, 
  disabled 
}) => {
  const [showGuide, setShowGuide] = useState(true)

  const handleStart = () => {
    setShowGuide(false)
    onStartExam()
  }

  if (!showGuide) {
    return (
      <div className="flex items-stretch gap-2">
        <Input
          id="student_name_top"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Bitte Ihren Namen eingeben"
          className="name-input"
          style={{ marginBottom: 0 }}
        />
        <Button 
          onClick={handleStart}
          disabled={disabled}
          className="btn-primary"
          style={{ height: '44px' }}
        >
          Prüfung starten
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Willkommen zur telc B2 Prüfung
            </h2>
            <button
              onClick={() => setShowGuide(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="student_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ihr Name
              </label>
              <Input
                id="student_name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Bitte geben Sie Ihren vollständigen Namen ein"
                className="text-base"
              />
            </div>

            {/* Guide Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Navigationshilfen während der Prüfung
              </h3>

              {/* QuickAnswerMap Guide */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Antwortübersicht (rechts unten)
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    Zeigt Ihren Fortschritt und ermöglicht schnelle Navigation zwischen den Fragen.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <div 
                          key={num}
                          className={`w-6 h-6 rounded text-xs flex items-center justify-center text-white font-medium ${
                            num <= 2 ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-blue-700 dark:text-blue-300">
                      Grün = beantwortet
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <EyeOff className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-700 dark:text-blue-300">
                      Ein-/Ausblenden möglich
                    </span>
                  </div>
                </div>
              </div>

              {/* AnswerSheet Guide */}
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">
                    Antwortbogen (links)
                  </h4>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                    Übersicht aller Ihrer Antworten, organisiert nach Prüfungsteilen.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full border-2 border-red-600 bg-red-600"></div>
                      <span className="text-xs text-red-700 dark:text-red-300">Beantwortet</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-400 bg-white"></div>
                      <span className="text-xs text-red-700 dark:text-red-300">Offen</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timer Info */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-lg flex items-center justify-center">
                  ⏱️
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                    Prüfungszeit: 90 Minuten
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Der Timer startet automatisch und läuft kontinuierlich. Sie können zwischen den Aufgaben beliebig wechseln.
                  </p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                💡 Hilfreiche Tipps
              </h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Nutzen Sie die Antwortübersicht zur schnellen Navigation</li>
                <li>• Alle Antworten werden automatisch gespeichert</li>
                <li>• Sie können Aufgaben in beliebiger Reihenfolge bearbeiten</li>
                <li>• Überprüfen Sie Ihre Antworten im Antwortbogen vor der Abgabe</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {studentName.trim() ? (
                <span className="text-green-600 dark:text-green-400">✓ Name eingegeben</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">! Bitte Namen eingeben</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowGuide(false)}
              >
                Ohne Anleitung starten
              </Button>
              <Button
                onClick={handleStart}
                disabled={!studentName.trim()}
                className="btn-primary"
              >
                Prüfung starten
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ExamStartGuide

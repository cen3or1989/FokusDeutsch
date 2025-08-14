import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const AnswerSheet = ({ answers, onAnswerChange, onSubmit, studentName, onStudentNameChange, disabled = false }) => {
  const [isVisible, setIsVisible] = useState(false)

  // Themed radio-like dot for light/dark without changing light mode visuals
  const Dot = ({ selected }) => (
    <div
      className={`w-3 h-3 rounded-full border ${selected ? 'bg-black border-black dark:bg-foreground dark:border-foreground' : 'bg-white border-black dark:bg-card dark:border-border'}`}
    />
  )

  const computeAnsweredCount = () => {
    if (!answers) return { answered: 0, total: 60 }
    const countNonEmpty = (arr = []) => arr.filter(v => v !== '' && v !== undefined && v !== null).length
    const countBoolean = (arr = []) => arr.filter(v => typeof v === 'boolean').length
    const a1 = countNonEmpty(answers.leseverstehen_teil1)
    const a2 = countNonEmpty(answers.leseverstehen_teil2)
    const a3 = countNonEmpty(answers.leseverstehen_teil3)
    const s1 = countNonEmpty(answers.sprachbausteine_teil1)
    const s2 = countNonEmpty(answers.sprachbausteine_teil2)
    const hv1 = countBoolean(answers?.hoerverstehen?.teil1)
    const hv2 = countBoolean(answers?.hoerverstehen?.teil2)
    const hv3 = countBoolean(answers?.hoerverstehen?.teil3)
    const answered = a1 + a2 + a3 + s1 + s2 + hv1 + hv2 + hv3
    return { answered, total: 60 }
  }
  const sheetProgress = computeAnsweredCount()

  const renderCircleOption = (section, questionNum, option, isSelected) => {
    const sectionStartMap = {
      'leseverstehen_teil1': 1,
      'leseverstehen_teil2': 6,
      'leseverstehen_teil3': 11,
      'sprachbausteine_teil1': 21,
      'sprachbausteine_teil2': 31,
      'hoerverstehen_teil1': 41,
      'hoerverstehen_teil2': 46,
      'hoerverstehen_teil3': 56
    }
    
    const answerIndex = questionNum - sectionStartMap[section]
    
    return (
      <div 
        key={option}
        className="flex flex-col items-center cursor-pointer mx-1 p-1 hover:bg-gray-100 dark:hover:bg-muted rounded transition-colors"
        onClick={() => { if (disabled) return; onAnswerChange(section, answerIndex, option) }}
      >
        <div
          className={`w-4 h-4 rounded-full border-2 transition-all ${
            isSelected 
              ? 'bg-red-600 border-red-600 dark:bg-primary dark:border-primary' 
              : 'bg-white border-gray-400 dark:bg-card dark:border-gray-500 hover:border-red-400'
          }`}
        >
          {isSelected && (
            <div className="w-full h-full rounded-full bg-white dark:bg-primary-foreground scale-50 transform"></div>
          )}
        </div>
        <span className={`text-xs mt-1 font-medium ${isSelected ? 'text-red-600 dark:text-primary' : 'text-gray-700 dark:text-foreground'}`}>
          {option}
        </span>
      </div>
    )
  }

  const renderBooleanOption = (section, questionNum, value, label, isSelected) => {
    const sectionStartMap = {
      'hoerverstehen_teil1': 41,
      'hoerverstehen_teil2': 46,
      'hoerverstehen_teil3': 56
    }
    
    const answerIndex = questionNum - sectionStartMap[section]
    
    return (
      <div 
        key={value}
        className="flex flex-col items-center cursor-pointer mx-1 p-1 hover:bg-gray-100 dark:hover:bg-muted rounded transition-colors"
        onClick={() => { if (disabled) return; onAnswerChange(section, answerIndex, value) }}
      >
        <div
          className={`w-4 h-4 rounded-full border-2 transition-all ${
            isSelected 
              ? 'bg-red-600 border-red-600 dark:bg-primary dark:border-primary' 
              : 'bg-white border-gray-400 dark:bg-card dark:border-gray-500 hover:border-red-400'
          }`}
        >
          {isSelected && (
            <div className="w-full h-full rounded-full bg-white dark:bg-primary-foreground scale-50 transform"></div>
          )}
        </div>
        <span className={`text-xs mt-1 font-bold ${isSelected ? 'text-red-600 dark:text-primary' : 'text-gray-700 dark:text-foreground'}`}>
          {label}
        </span>
      </div>
    )
  }

  const renderQuestionRow = (section, questionNum, options, type = 'letter') => {
    const sectionStartMap = {
      'leseverstehen_teil1': 1,
      'leseverstehen_teil2': 6,
      'leseverstehen_teil3': 11,
      'sprachbausteine_teil1': 21,
      'sprachbausteine_teil2': 31,
      'hoerverstehen_teil1': 41,
      'hoerverstehen_teil2': 46,
      'hoerverstehen_teil3': 56
    }
    
    const answerIndex = questionNum - sectionStartMap[section]
    let currentAnswer
    if (section.startsWith('hoerverstehen')) {
      const teil = section.split('_')[1]
      currentAnswer = answers?.hoerverstehen?.[teil]?.[answerIndex]
    } else {
      currentAnswer = answers[section] ? answers[section][answerIndex] : ''
    }

    return (
      <div key={questionNum} className="flex items-center mb-2 p-2 bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-muted rounded-full mr-3 flex-shrink-0">
          <span className="text-xs font-bold text-gray-700 dark:text-foreground">{questionNum}</span>
        </div>
        <div className="flex flex-wrap gap-1 flex-1 justify-center px-2">
          {type === 'letter' ? 
            options.map(option => renderCircleOption(section, questionNum, option, currentAnswer === option)) :
            [
              renderBooleanOption(section, questionNum, true, '+', currentAnswer === true),
              renderBooleanOption(section, questionNum, false, '-', currentAnswer === false)
            ]
          }
        </div>
        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-muted rounded-full ml-3 flex-shrink-0">
          <span className="text-xs font-bold text-gray-700 dark:text-foreground">{questionNum}</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Slide-out Toggle Button */}
      <div className="fixed top-1/2 left-0 z-[60] transform -translate-y-1/2">
        <button
          onClick={() => { if (disabled) return; setIsVisible(!isVisible) }}
          className={`antwortbogen-toggle ${
            disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
          } text-white transition-all duration-300 ease-in-out ${
            isVisible 
              ? 'rounded-r-lg px-3 py-6 transform translate-x-0' 
              : 'rounded-r-lg px-2 py-8 transform translate-x-0'
          }`}
          disabled={disabled}
        >
          <div className="flex flex-col items-center gap-2">
            {isVisible ? (
              <>
                <span className="text-xs font-bold transform rotate-180">Schließen</span>
                <div className="w-0.5 h-4 bg-white/40"></div>
                <span className="text-xs transform rotate-180">{sheetProgress.answered}/{sheetProgress.total}</span>
              </>
            ) : (
              <>
                <span className="text-xs font-bold transform rotate-180">Antwortbogen</span>
                {!disabled && (
                  <>
                    <div className="w-0.5 h-4 bg-white/40"></div>
                    <span className="text-xs transform rotate-180">{sheetProgress.answered}/{sheetProgress.total}</span>
                  </>
                )}
              </>
            )}
          </div>
        </button>
      </div>

      {/* Slide-out Panel */}
      <div 
        className={`antwortbogen-panel fixed top-0 left-0 h-full z-[60] transition-transform duration-300 ease-in-out ${
          isVisible ? 'transform translate-x-0' : 'transform -translate-x-full'
        }`}
      >
        {/* Backdrop/Overlay */}
        {isVisible && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55]"
            onClick={() => setIsVisible(false)}
          />
        )}
        
        {/* Panel Content */}
        <div className="relative z-[70] h-full bg-white dark:bg-card border-r-2 border-gray-400 dark:border-border shadow-2xl">
          {/* Panel Header */}
          <div className="sticky top-0 bg-red-600 dark:bg-red-700 text-white p-4 border-b border-red-700 dark:border-red-800 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <h2 className="text-lg font-bold">Antwortbogen</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  {sheetProgress.answered}/{sheetProgress.total} beantwortet
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Antwortbogen schließen"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="h-full overflow-y-auto pb-20">
            <div className="p-4">
            {/* Name Input (first element) */}
            <div className="mb-4">
              <Input
                value={studentName}
                onChange={(e) => onStudentNameChange(e.target.value)}
                className="border-red-500 text-sm dark:bg-card dark:text-foreground dark:border-border dark:focus-visible:ring-2 dark:focus-visible:ring-primary/40"
                placeholder="Bitte Ihren Namen eingeben"
              />
            </div>
            {/* Leseverstehen Section */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6 dark:bg-red-950/20 dark:border-red-800">
              <div className="flex items-center mb-4 pb-2 border-b border-red-300 dark:border-red-800">
                <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                <h3 className="text-sm font-bold text-red-800 dark:text-red-300 uppercase tracking-wide">Leseverstehen</h3>
              </div>
              <div className="space-y-6">
                {/* Teil 1 (1-5) - Column */}
                <div className="bg-white dark:bg-card rounded-lg p-3 border border-red-200 dark:border-red-900">
                  <h4 className="text-sm font-bold mb-3 text-red-700 dark:text-red-400 flex items-center">
                    <span className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded text-xs mr-2">Teil 1</span>
                    Fragen 1-5
                  </h4>
                  <div className="space-y-2">
                    {[1,2,3,4,5].map(num => renderQuestionRow('leseverstehen_teil1', num, ['a','b','c','d','e','f','g','h','i','j']))}
                  </div>
                </div>
                
                {/* Teil 2 (6-10) - Column */}
                <div className="bg-white dark:bg-card rounded-lg p-3 border border-red-200 dark:border-red-900">
                  <h4 className="text-sm font-bold mb-3 text-red-700 dark:text-red-400 flex items-center">
                    <span className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded text-xs mr-2">Teil 2</span>
                    Fragen 6-10
                  </h4>
                  <div className="space-y-2">
                    {[6,7,8,9,10].map(num => renderQuestionRow('leseverstehen_teil2', num, ['a','b','c']))}
                  </div>
                </div>
                
                {/* Teil 3 (11-20) - Column */}
                <div className="bg-white dark:bg-card rounded-lg p-3 border border-red-200 dark:border-red-900">
                  <h4 className="text-sm font-bold mb-3 text-red-700 dark:text-red-400 flex items-center">
                    <span className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded text-xs mr-2">Teil 3</span>
                    Fragen 11-20
                  </h4>
                  <div className="space-y-2">
                    {[11,12,13,14,15,16,17,18,19,20].map(num => renderQuestionRow('leseverstehen_teil3', num, ['a','b','c','d','e','f','g','h','i','j','k','l','x']))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sprachbausteine Section */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6 dark:bg-blue-950/20 dark:border-blue-800">
              <div className="flex items-center mb-4 pb-2 border-b border-blue-300 dark:border-blue-800">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">Sprachbausteine</h3>
              </div>
              <div className="space-y-6">
                {/* Teil 1 (21-30) - Column */}
                <div className="bg-white dark:bg-card rounded-lg p-3 border border-blue-200 dark:border-blue-900">
                  <h4 className="text-sm font-bold mb-3 text-blue-700 dark:text-blue-400 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs mr-2">Teil 1</span>
                    Fragen 21-30
                  </h4>
                  <div className="space-y-2">
                    {[21,22,23,24,25,26,27,28,29,30].map(num => renderQuestionRow('sprachbausteine_teil1', num, ['a','b','c']))}
                  </div>
                </div>
                
                {/* Teil 2 (31-40) - Column */}
                <div className="bg-white dark:bg-card rounded-lg p-3 border border-blue-200 dark:border-blue-900">
                  <h4 className="text-sm font-bold mb-3 text-blue-700 dark:text-blue-400 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs mr-2">Teil 2</span>
                    Fragen 31-40
                  </h4>
                  <div className="space-y-2">
                    {[31,32,33,34,35,36,37,38,39,40].map(num => renderQuestionRow('sprachbausteine_teil2', num, ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o']))}
                  </div>
                </div>
              </div>
            </div>

            {/* Hörverstehen Section */}
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6 dark:bg-green-950/20 dark:border-green-800">
              <div className="flex items-center mb-4 pb-2 border-b border-green-300 dark:border-green-800">
                <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                <h3 className="text-sm font-bold text-green-800 dark:text-green-300 uppercase tracking-wide">Hörverstehen</h3>
              </div>
              <div className="space-y-6">
                {/* Teil 1 (41-45) - Column */}
                <div className="bg-white dark:bg-card rounded-lg p-3 border border-green-200 dark:border-green-900">
                  <h4 className="text-sm font-bold mb-3 text-green-700 dark:text-green-400 flex items-center">
                    <span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs mr-2">Teil 1</span>
                    Fragen 41-45
                  </h4>
                  <div className="space-y-2">
                    {[41,42,43,44,45].map(num => renderQuestionRow('hoerverstehen_teil1', num, [], 'boolean'))}
                  </div>
                </div>
                
                {/* Teil 2 (46-55) - Column */}
                <div className="bg-white dark:bg-card rounded-lg p-3 border border-green-200 dark:border-green-900">
                  <h4 className="text-sm font-bold mb-3 text-green-700 dark:text-green-400 flex items-center">
                    <span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs mr-2">Teil 2</span>
                    Fragen 46-55
                  </h4>
                  <div className="space-y-2">
                    {[46,47,48,49,50,51,52,53,54,55].map(num => renderQuestionRow('hoerverstehen_teil2', num, [], 'boolean'))}
                  </div>
                </div>
                
                {/* Teil 3 (56-60) - Column */}
                <div className="bg-white dark:bg-card rounded-lg p-3 border border-green-200 dark:border-green-900">
                  <h4 className="text-sm font-bold mb-3 text-green-700 dark:text-green-400 flex items-center">
                    <span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs mr-2">Teil 3</span>
                    Fragen 56-60
                  </h4>
                  <div className="space-y-2">
                    {[56,57,58,59,60].map(num => renderQuestionRow('hoerverstehen_teil3', num, [], 'boolean'))}
                  </div>
                </div>
              </div>
            </div>

            {/* Schriftlicher Ausdruck */}
            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 mb-6 dark:bg-purple-950/20 dark:border-purple-800">
              <div className="flex items-center mb-4 pb-2 border-b border-purple-300 dark:border-purple-800">
                <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
                <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wide">Schriftlicher Ausdruck</h3>
              </div>
              <div className="bg-white dark:bg-card rounded-lg p-4 border border-purple-200 dark:border-purple-900">
                <h4 className="text-sm font-bold mb-3 text-purple-700 dark:text-purple-400">Aufgabenwahl:</h4>
                <div className="flex gap-6 justify-center">
                  <div 
                    className="flex items-center cursor-pointer p-3 rounded-lg border-2 transition-colors hover:bg-purple-50 dark:hover:bg-purple-950/30"
                    style={{
                      borderColor: answers.schriftlicher_ausdruck?.selected_task === 'A' ? '#7c3aed' : '#d1d5db',
                      backgroundColor: answers.schriftlicher_ausdruck?.selected_task === 'A' ? '#7c3aed' : 'transparent'
                    }}
                    onClick={() => onAnswerChange('schriftlicher_ausdruck', 'selected_task', 'A')}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 ${answers.schriftlicher_ausdruck?.selected_task === 'A' ? 'bg-white border-white' : 'bg-white border-gray-400'}`}>
                      {answers.schriftlicher_ausdruck?.selected_task === 'A' && (
                        <div className="w-full h-full rounded-full bg-purple-600 scale-50 transform"></div>
                      )}
                    </div>
                    <span className={`text-sm font-bold ${answers.schriftlicher_ausdruck?.selected_task === 'A' ? 'text-white' : 'text-gray-700 dark:text-foreground'}`}>
                      Aufgabe A
                    </span>
                  </div>
                  <div 
                    className="flex items-center cursor-pointer p-3 rounded-lg border-2 transition-colors hover:bg-purple-50 dark:hover:bg-purple-950/30"
                    style={{
                      borderColor: answers.schriftlicher_ausdruck?.selected_task === 'B' ? '#7c3aed' : '#d1d5db',
                      backgroundColor: answers.schriftlicher_ausdruck?.selected_task === 'B' ? '#7c3aed' : 'transparent'
                    }}
                    onClick={() => onAnswerChange('schriftlicher_ausdruck', 'selected_task', 'B')}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 ${answers.schriftlicher_ausdruck?.selected_task === 'B' ? 'bg-white border-white' : 'bg-white border-gray-400'}`}>
                      {answers.schriftlicher_ausdruck?.selected_task === 'B' && (
                        <div className="w-full h-full rounded-full bg-purple-600 scale-50 transform"></div>
                      )}
                    </div>
                    <span className={`text-sm font-bold ${answers.schriftlicher_ausdruck?.selected_task === 'B' ? 'text-white' : 'text-gray-700 dark:text-foreground'}`}>
                      Aufgabe B
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-gray-50 dark:bg-muted/50 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-700">
              <Button 
                onClick={onSubmit}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={!studentName.trim() || disabled}
              >
                🏁 Prüfung endgültig einreichen
              </Button>
              <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-2">
                Bitte überprüfen Sie alle Antworten vor dem Einreichen
              </p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AnswerSheet


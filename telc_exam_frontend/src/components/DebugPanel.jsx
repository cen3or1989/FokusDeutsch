import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getDebugInfo, clearDebugLogs, validateAnswers } from '@/lib/debugUtils'

const DebugPanel = ({ examId, answers, studentName, timerPhase }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)

  const loadDebugInfo = () => {
    const info = getDebugInfo()
    setDebugInfo(info)
  }

  const clearLogs = () => {
    clearDebugLogs()
    setDebugInfo(null)
  }

  const validateCurrentAnswers = () => {
    if (!answers) return { isValid: false, issues: ['No answers available'] }
    return validateAnswers(answers)
  }

  return (
    <>
      {/* Debug Toggle Button */}
      <div className="fixed bottom-4 right-4 z-[70]">
        <button
          onClick={() => {
            setIsVisible(!isVisible)
            if (!isVisible) {
              loadDebugInfo()
            }
          }}
          className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-mono"
        >
          {isVisible ? '🔒' : '🐛'} Debug
        </button>
      </div>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Debug Panel</h2>
                <div className="flex gap-2">
                  <Button onClick={loadDebugInfo} size="sm">
                    Refresh
                  </Button>
                  <Button onClick={clearLogs} size="sm" variant="outline">
                    Clear Logs
                  </Button>
                  <Button onClick={() => setIsVisible(false)} size="sm" variant="outline">
                    Close
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-4 space-y-6">
                {/* Current State */}
                <div>
                  <h3 className="font-semibold mb-2">Current State</h3>
                  <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm font-mono">
                    <div>Exam ID: {examId}</div>
                    <div>Student: {studentName || 'Not set'}</div>
                    <div>Timer Phase: {timerPhase || 'Not set'}</div>
                    <div>Answers Count: {answers ? Object.keys(answers).length : 0}</div>
                  </div>
                </div>

                {/* Answer Validation */}
                <div>
                  <h3 className="font-semibold mb-2">Answer Validation</h3>
                  <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
                    {(() => {
                      const validation = validateCurrentAnswers()
                      return (
                        <div>
                          <div className={`font-bold ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                            Status: {validation.isValid ? 'Valid' : 'Invalid'}
                          </div>
                          {validation.issues.length > 0 && (
                            <div className="mt-2">
                              <div className="font-semibold">Issues:</div>
                              <ul className="list-disc list-inside text-red-600">
                                {validation.issues.map((issue, index) => (
                                  <li key={index}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Recent Errors */}
                {debugInfo?.errorLogs?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Recent Errors ({debugInfo.errorLogs.length})</h3>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-sm max-h-40 overflow-y-auto">
                      {debugInfo.errorLogs.map((log, index) => (
                        <div key={index} className="mb-2 p-2 bg-white dark:bg-gray-800 rounded border">
                          <div className="font-semibold text-red-600">{log.error.message}</div>
                          <div className="text-xs text-gray-600">{log.timestamp}</div>
                          {log.context?.type && (
                            <div className="text-xs text-gray-500">Type: {log.context.type}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent API Calls */}
                {debugInfo?.apiLogs?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Recent API Calls ({debugInfo.apiLogs.length})</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm max-h-40 overflow-y-auto">
                      {debugInfo.apiLogs.map((log, index) => (
                        <div key={index} className="mb-2 p-2 bg-white dark:bg-gray-800 rounded border">
                          <div className="font-semibold">{log.method} {log.url}</div>
                          <div className="text-xs">
                            Status: {log.status} | Duration: {log.duration?.toFixed(2)}ms
                          </div>
                          <div className="text-xs text-gray-600">{log.timestamp}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Submissions */}
                {debugInfo?.submissionLogs?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Recent Submissions ({debugInfo.submissionLogs.length})</h3>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded text-sm max-h-40 overflow-y-auto">
                      {debugInfo.submissionLogs.map((log, index) => (
                        <div key={index} className="mb-2 p-2 bg-white dark:bg-gray-800 rounded border">
                          <div className="font-semibold">Exam {log.examId} - {log.studentName}</div>
                          <div className="text-xs">
                            Phase: {log.timerPhase} | Answered: {log.totalAnswered}
                          </div>
                          <div className="text-xs text-gray-600">{log.timestamp}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* System Info */}
                <div>
                  <h3 className="font-semibold mb-2">System Info</h3>
                  <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs font-mono">
                    <div>URL: {debugInfo?.url}</div>
                    <div>User Agent: {debugInfo?.userAgent?.substring(0, 100)}...</div>
                    <div>Timestamp: {debugInfo?.timestamp}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

export default DebugPanel
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { API_BASE_URL } from '@/lib/api'

const TestSubmission = ({ examId = 1 }) => {
  const [studentName, setStudentName] = useState('Test Student')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [includeWriting, setIncludeWriting] = useState(false)

  const baseAnswers = {
    leseverstehen_teil1: ['a', 'b', 'c', 'd', 'e'],
    leseverstehen_teil2: ['a', 'b', 'c', 'a', 'b'],
    leseverstehen_teil3: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
    sprachbausteine_teil1: ['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c', 'a'],
    sprachbausteine_teil2: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
    hoerverstehen: {
      teil1: [true, false, true, false, true],
      teil2: [true, false, true, false, true, false, true, false, true, false],
      teil3: [true, false, true, false, true]
    }
  }

  const writingSection = {
    schriftlicher_ausdruck: {
      selected_task: 'A',
      text: 'This is a test submission for task A.'
    }
  }

  const handleTestSubmit = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const answers = includeWriting ? { ...baseAnswers, ...writingSection } : baseAnswers
      const timerPhase = includeWriting ? 'schriftlich' : 'teil1-3'
      
      const requestBody = {
        student_name: studentName,
        answers: answers,
        timer_phase: timerPhase
      }

      console.log('Submitting test data:', requestBody)

      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)

      const responseText = await response.text()
      console.log('Response text:', responseText)

      if (!response.ok) {
        setError(`Error ${response.status}: ${responseText}`)
        return
      }

      const data = JSON.parse(responseText)
      setResult(data)
      console.log('Success:', data)
    } catch (err) {
      console.error('Test submission error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Test Exam Submission</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Student Name</label>
          <Input 
            value={studentName} 
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter student name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Exam ID</label>
          <Input 
            value={examId} 
            disabled
            className="bg-gray-100"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includeWriting"
            checked={includeWriting}
            onChange={(e) => setIncludeWriting(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="includeWriting" className="text-sm font-medium">
            Include Schriftlicher Ausdruck (Writing Section)
          </label>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-medium mb-2">Test Configuration:</h3>
          <p className="text-sm">Timer Phase: <strong>{includeWriting ? 'schriftlich' : 'teil1-3'}</strong></p>
          <p className="text-sm">Sections: <strong>{includeWriting ? 'All sections' : 'Without writing'}</strong></p>
        </div>

        <Button 
          onClick={handleTestSubmit}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Submitting...' : 'Test Submit'}
        </Button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Success!</strong>
            <pre className="text-xs mt-2">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  )
}

export default TestSubmission
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { API_BASE_URL } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const DebugPanel = () => {
  const [apiStatus, setApiStatus] = useState('checking')
  const [apiError, setApiError] = useState(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkApiStatus = async () => {
    setIsChecking(true)
    setApiStatus('checking')
    setApiError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/health`)
      const data = await response.json()
      
      if (response.ok) {
        setApiStatus('healthy')
      } else {
        setApiStatus('unhealthy')
        setApiError(data.error || 'Server returned error')
      }
    } catch (error) {
      setApiStatus('offline')
      setApiError(error.message)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'unhealthy':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <RefreshCw className="h-4 w-4 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'unhealthy':
        return 'bg-yellow-100 text-yellow-800'
      case 'offline':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const testSubmit = async () => {
    try {
      const testData = {
        student_name: 'Test Student',
        answers: {
          leseverstehen_teil1: ['a', 'b', 'c', 'd', 'e'],
          leseverstehen_teil2: [0, 1, 2, 0, 1],
          leseverstehen_teil3: Array(10).fill('a'),
          sprachbausteine_teil1: Array(10).fill('test'),
          sprachbausteine_teil2: Array(10).fill('test'),
          hoerverstehen: {
            teil1: [true, false, true, false, true],
            teil2: Array(10).fill(true),
            teil3: [false, true, false, true, false]
          },
          schriftlicher_ausdruck: {
            selected_task: 'a',
            text: 'Test text'
          }
        }
      }

      console.log('Testing submit with data:', testData)
      const response = await fetch(`${API_BASE_URL}/api/exams/1/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })

      const responseText = await response.text()
      console.log('Test submit response:', response.status, responseText)
      
      if (response.ok) {
        alert('Test submit successful! Check console for details.')
      } else {
        alert(`Test submit failed: ${response.status} - ${responseText}`)
      }
    } catch (error) {
      console.error('Test submit error:', error)
      alert(`Test submit error: ${error.message}`)
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 shadow-lg z-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Debug Panel
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1">{apiStatus}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs space-y-1">
          <p><strong>API URL:</strong> {API_BASE_URL}</p>
          <p><strong>Frontend URL:</strong> {window.location.origin}</p>
          {apiError && (
            <p className="text-red-600"><strong>Error:</strong> {apiError}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={checkApiStatus}
            disabled={isChecking}
          >
            {isChecking ? 'Checking...' : 'Check API'}
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={testSubmit}
            disabled={apiStatus !== 'healthy'}
          >
            Test Submit
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          <p>Common issues:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Backend server not running</li>
            <li>CORS misconfiguration</li>
            <li>Database not connected</li>
            <li>Wrong API URL in .env</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default DebugPanel
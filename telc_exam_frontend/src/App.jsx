import { useState } from 'react'
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom'

import AdminPanel from './components/AdminPanel'
import ExamList from './components/ExamList'
import Landing from './components/Landing'

import ExamInterface from './components/ExamInterface'
import ExamResults from './components/ExamResults'
import ErrorBoundary from './components/ErrorBoundary'
import { Settings, BookOpen } from 'lucide-react'
import './App.css'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [examResult, setExamResult] = useState(null)

  // Don't show header on landing page
  const showHeader = location.pathname !== '/'

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background-color)'}}>
      {showHeader && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
          <div className="container mx-auto px-6 py-3">
            <div className="flex justify-between items-center">
              <button
                className="text-lg font-semibold text-gray-800 hover:text-gray-600 transition-colors"
                onClick={() => {
                  if (location.pathname.startsWith('/exam/') && sessionStorage.getItem('exam_in_progress') === '1') {
                    const leave = window.confirm('Möchten Sie die laufende Prüfung verlassen? Ihr Fortschritt kann verloren gehen.')
                    if (!leave) return
                  }
                  navigate('/exams')
                }}
              >
                Prüfungen
              </button>
              <nav className="flex items-center gap-1">
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                  onClick={() => {
                    if (location.pathname.startsWith('/exam/') && sessionStorage.getItem('exam_in_progress') === '1') {
                      const leave = window.confirm('Möchten Sie die laufende Prüfung verlassen? Ihr Fortschritt kann verloren gehen.')
                      if (!leave) return
                    }
                    navigate('/exams')
                  }}
                >
                  <BookOpen className="w-4 h-4" />
                  Prüfungen
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                  onClick={() => {
                    if (location.pathname.startsWith('/exam/') && sessionStorage.getItem('exam_in_progress') === '1') {
                      const leave = window.confirm('Möchten Sie die laufende Prüfung verlassen? Ihr Fortschritt kann verloren gehen.')
                      if (!leave) return
                    }
                    navigate('/admin')
                  }}
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </button>
              </nav>
            </div>
          </div>
        </header>
      )}

      <Routes>
        <Route path="/" element={<Landing onStart={() => navigate('/exams')} />} />
        <Route path="/exams" element={<ExamList onSelectExam={(id) => navigate(`/exam/${id}`)} />} />

        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/exam/:id" element={
          <ErrorBoundary>
            <ExamInterfaceWrapper onComplete={(result) => { setExamResult(result); navigate('/results'); }} onCancelExam={() => navigate('/')} />
          </ErrorBoundary>
        } />
        <Route path="/results" element={<ExamResults result={examResult} onBackToList={() => navigate('/')} />} />
      </Routes>
    </div>
  )
}

function ExamInterfaceWrapper({ onComplete, onCancelExam }) {
  const { id } = useParams()
  return <ExamInterface examId={id} onComplete={onComplete} onCancelExam={onCancelExam} />
}

export default App

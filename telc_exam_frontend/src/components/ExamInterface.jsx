import { CheckCircle } from 'lucide-react'
import { ExamProvider, useExam } from '@/context/ExamContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import ThemeSwitch from './ThemeSwitch'
import AnswerSheet from './AnswerSheet'
import DebugPanel from './DebugPanel'
import ExamTimer from './exam/ExamTimer'
import ExamNavigation from './exam/ExamNavigation'
import QuickAnswerMap from './exam/QuickAnswerMap'
import ExamStartGuide from './ExamStartGuide'
import LesesverstehenSection from './exam/sections/LesesverstehenSection'
import SprachbausteineSection from './exam/sections/SprachbausteineSection'
import HoerverstehenSection from './exam/sections/HoerverstehenSection'
import SchriftlicherAusdruckSection from './exam/sections/SchriftlicherAusdruckSection'

// Loading component
const ExamLoading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p>Prüfung wird geladen...</p>
    </div>
  </div>
)

// Error component
const ExamError = ({ error, onRetry, onGoBack }) => (
  <div className="flex justify-center items-center h-screen p-6">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2">Fehler beim Laden der Prüfung</h2>
      <p className="text-sm text-gray-600 mb-6">
        {error || 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'}
      </p>
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Erneut versuchen
        </button>
        <button
          onClick={onGoBack}
          className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Zurück zur Übersicht
        </button>
      </div>
    </div>
  </div>
)

// Submitted state component
const ExamSubmitted = () => (
  <div className="container mx-auto p-6 text-center">
    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
    <h2 className="text-2xl font-bold mb-4">Prüfung erfolgreich eingereicht!</h2>
    <p>Ihre Ergebnisse werden verarbeitet...</p>
  </div>
)

// Start guide component
const ExamStartButton = () => {
  const { studentName, setStudentName, timer, isSubmitted } = useExam()

  if (timer.hasStarted || isSubmitted) return null

  return (
    <ExamStartGuide
      studentName={studentName}
      setStudentName={setStudentName}
      onStartExam={timer.startTimer}
      disabled={!studentName.trim()}
    />
  )
}

// Main exam interface content
const ExamInterfaceContent = () => {
  const { 
    exam, 
    loading, 
    isSubmitted, 
    timer, 
    answers, 
    studentName, 
    setStudentName, 
    handleSubmit, 
    currentSection,
    setCurrentSection
  } = useExam()


  if (loading) return <ExamLoading />
  if (isSubmitted) return <ExamSubmitted />
  if (!exam) return <ExamLoading />
  
  // Handle exam error state
  if (exam.error) {
    return (
      <ExamError 
        error={exam.errorMessage}
        onRetry={() => window.location.reload()}
        onGoBack={() => window.location.href = '/exams'}
      />
    )
  }

  return (
    <div className="container mx-auto p-6" style={{backgroundColor: 'var(--background-color)'}}>
      {/* Compact sticky top bar */}
      <div className="sticky top-0 z-50" style={{backgroundColor:'var(--secondary-color)', borderBottom:'1px solid var(--border-color)'}}>
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="truncate">
            <span className="title-chip text-sm font-semibold">
              <i className="fa-solid fa-book"></i>
              <span className="truncate" style={{maxWidth:'60vw'}}>{exam.title || 'Prüfung'}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ExamTimer compact />
            <ThemeSwitch />
          </div>
        </div>
      </div>

      {/* Answer Sheet Component */}
      <AnswerSheet
        answers={answers.answers}
        onAnswerChange={answers.updateAnswer}
        onSubmit={handleSubmit}
        studentName={studentName}
        onStudentNameChange={setStudentName}
        disabled={!timer.hasStarted}
      />

      {/* Debug Panel - only show in development */}
      {import.meta.env.DEV && (
        <DebugPanel
          examId={exam.id}
          answers={answers.answers}
          studentName={studentName}
          timerPhase={timer.phase}
        />
      )}

      {/* Hero + Navigation */}
      <section className="hero-grad rounded-2xl border mb-6" style={{borderColor:'var(--border-color)'}}>
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold" style={{color:'var(--text-color)'}}>Übungsbereich</h2>
            <p className="text-sm" style={{color:'var(--muted-text-color)'}}>
              Wechseln Sie schnell zwischen den Abschnitten und wählen Sie den gewünschten Modus.
            </p>
          </div>

          {/* Timer + Name */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <ExamTimer />
              {answers.showSaved && (
                <span className="text-sm text-green-700 ml-2">Saved</span>
              )}
            </div>
            <div className="flex-1 md:flex-none">
              <ExamStartButton />
            </div>
          </div>

          {/* Navigation Tiles */}
          <ExamNavigation />
        </div>
      </section>

      {/* Exam Content */}
      <Tabs value={currentSection} onValueChange={setCurrentSection} className="w-full relative">
        {!timer.hasStarted && (
          <div className="absolute inset-0 z-40 flex items-center justify-center" 
               style={{background:'rgba(255,255,255,0.7)', backdropFilter:'blur(2px)'}}>
            <div className="bg-white border rounded-lg shadow p-4 text-center max-w-md">
              <div className="font-semibold mb-2">Prüfung ist gesperrt</div>
              <div className="text-sm text-gray-600">
                Bitte geben Sie Ihren Namen ein und klicken Sie auf „Prüfung starten", um zu beginnen.
              </div>
            </div>
          </div>
        )}

        <TabsContent value="leseverstehen">
          <LesesverstehenSection />
        </TabsContent>

        <TabsContent value="sprachbausteine">
          <SprachbausteineSection />
        </TabsContent>

        <TabsContent value="hoerverstehen">
          <HoerverstehenSection />
        </TabsContent>

        <TabsContent value="schriftlicher_ausdruck">
          <SchriftlicherAusdruckSection />
        </TabsContent>
      </Tabs>

      {/* Quick Answer Map */}
      <QuickAnswerMap />
    </div>
  )
}

// Main wrapper component
const ExamInterface = ({ examId, onComplete, onCancelExam }) => {
  return (
    <ExamProvider examId={examId} onComplete={onComplete} onCancelExam={onCancelExam}>
      <ExamInterfaceContent />
    </ExamProvider>
  )
}

export default ExamInterface

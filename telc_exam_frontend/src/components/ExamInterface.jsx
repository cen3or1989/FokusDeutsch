import { CheckCircle } from 'lucide-react'
import { ExamProvider, useExam } from '@/context/ExamContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import ThemeSwitch from './ThemeSwitch'
import AnswerSheet from './AnswerSheet'
import ExamTimer from './exam/ExamTimer'
import ExamNavigation from './exam/ExamNavigation'
import QuickAnswerMap from './exam/QuickAnswerMap'
import ExamStartGuide from './ExamStartGuide'
import LesesverstehenSection from './exam/sections/LesesverstehenSection'
import SprachbausteineSection from './exam/sections/SprachbausteineSection'
import HoerverstehenSection from './exam/sections/HoerverstehenSection'
import SchriftlicherAusdruckSection from './exam/sections/SchriftlicherAusdruckSection'
import DebugPanel from './DebugPanel'

// Loading component
const ExamLoading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p>Prüfung wird geladen...</p>
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
    
    {/* Debug Panel - Remove in production */}
    {import.meta.env.DEV && <DebugPanel />}
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

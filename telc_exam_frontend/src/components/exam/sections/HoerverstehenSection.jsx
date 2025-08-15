import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Play } from 'lucide-react'
import { useExam } from '@/context/ExamContext'
import TranslationControls from '../TranslationControls'
import { getStaticGermanClass, getContentTextClass, getTitleTextClass } from '@/lib/languageUtils'
import FormattedText from '@/components/ui/FormattedText'

const HoerverstehenTeil = memo(({ teil, title, instruction, questionRange }) => {
  const { exam, answers, audio, timer, sectionLang } = useExam()

  if (!exam?.hoerverstehen?.[teil]?.statements) {
    return <div>Keine Daten für {teil} verfügbar</div>
  }

  const statements = exam.hoerverstehen[teil].statements || []
  const paths = statements.map((_, idx) => `hoerverstehen.${teil}.statements[${idx}]`)

  return (
    <Card className="hv-card" style={{backgroundColor: 'var(--secondary-color)'}}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between test-title">
          <span>{title}</span>
          <div className="flex items-center gap-2">
            <TranslationControls sectionKey={`hv_${teil}`} paths={paths} />
            {exam.hoerverstehen[teil].audio_url && (
              <button
                onClick={() => audio.playAudio(exam.hoerverstehen[teil].audio_url, teil)}
                disabled={audio.audioPlaying[teil]}
                className="flex items-center gap-2 btn-primary"
              >
                <Play className="w-4 h-4" />
                {audio.audioPlaying[teil] ? 'Wiedergabe läuft...' : 'Audio abspielen'}
              </button>
            )}
          </div>
        </CardTitle>
        <div className="muted-callout hv-hint mt-3">
          <p className={`text-sm leading-relaxed ${getStaticGermanClass()}`}>
            <strong>Anweisung:</strong> {instruction}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statements.map((statement, index) => {
            const questionNumber = questionRange[0] + index
            return (
              <div key={index} className="hv-item" style={{backgroundColor: 'var(--card)', color: 'var(--text-color)'}}>
                <h5 className={`hv-statement ${getTitleTextClass(`hv_${teil}`, sectionLang)}`} style={{color: 'var(--primary-color)'}}>
                  {questionNumber}. <FormattedText
                    text={statement}
                    className={getContentTextClass(`hv_${teil}`, sectionLang)}
                    isRTL={sectionLang[`hv_${teil}`] === 'fa'}
                    preserveLineBreaks={true}
                  />
                </h5>
                <RadioGroup
                  value={answers.answers.hoerverstehen[teil][index]?.toString()}
                  onValueChange={(value) => answers.updateAnswer(`hoerverstehen_${teil}`, index, value === 'true')}
                  className="hv-options"
                >
                  <div className="radio-pill">
                    <RadioGroupItem 
                      value="true" 
                      id={`hv-${teil}-${index}-true`} 
                      className="radio-group-item"
                      disabled={!timer.hasStarted}
                    />
                    <Label htmlFor={`hv-${teil}-${index}-true`} className="radio-label" style={{fontSize: '14px', fontWeight: '500'}}>Richtig</Label>
                  </div>
                  <div className="radio-pill">
                    <RadioGroupItem 
                      value="false" 
                      id={`hv-${teil}-${index}-false`} 
                      className="radio-group-item"
                      disabled={!timer.hasStarted}
                    />
                    <Label htmlFor={`hv-${teil}-${index}-false`} className="radio-label" style={{fontSize: '14px', fontWeight: '500'}}>Falsch</Label>
                  </div>
                </RadioGroup>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
})

const HoerverstehenSection = () => {
  const { hoerTab, setHoerTab } = useExam()
  
  const handleTabChange = (value) => {
    console.log('Hörverstehen tab changing from', hoerTab, 'to', value)
    setHoerTab(value)
  }
  
  const instructions = {
    teil1: "Sie hören fünf kurze Texte. Sie hören jeden Text zweimal. Zu jedem Text lösen Sie zwei Aufgaben. Wählen Sie bei jeder Aufgabe die richtige Lösung. Lesen Sie jetzt die Aufgaben 41–50. Dafür haben Sie 60 Sekunden Zeit.",
    teil2: "Sie hören ein Gespräch. Sie hören das Gespräch einmal. Dazu lösen Sie fünf Aufgaben. Wählen Sie bei jeder Aufgabe: Sind die Aussagen Richtig oder Falsch? Lesen Sie jetzt die Aufgaben 51–55. Dafür haben Sie 60 Sekunden Zeit.",
    teil3: "Sie hören fünf kurze Texte. Sie hören jeden Text einmal. Zu jedem Text gibt es eine Aufgabe. Wählen Sie bei jeder Aufgabe die richtige Lösung a, b oder c. Lesen Sie jetzt die Aufgaben 56–60. Dafür haben Sie 30 Sekunden Zeit."
  }

  return (
    <div className="space-y-6">
      <Tabs value={hoerTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="tabs-pill-list w-full flex items-center gap-2 justify-start">
          <TabsTrigger value="teil1" className="tab-trigger">Teil 1 (41-45)</TabsTrigger>
          <TabsTrigger value="teil2" className="tab-trigger">Teil 2 (46-55)</TabsTrigger>
          <TabsTrigger value="teil3" className="tab-trigger">Teil 3 (56-60)</TabsTrigger>
        </TabsList>

        <TabsContent value="teil1" className="space-y-4">
          <HoerverstehenTeil 
            teil="teil1" 
            title="Hörverstehen Teil 1" 
            instruction={instructions.teil1}
            questionRange={[41, 50]}
          />
        </TabsContent>

        <TabsContent value="teil2" className="space-y-4">
          <HoerverstehenTeil 
            teil="teil2" 
            title="Hörverstehen Teil 2" 
            instruction={instructions.teil2}
            questionRange={[46, 55]}
          />
        </TabsContent>

        <TabsContent value="teil3" className="space-y-4">
          <HoerverstehenTeil 
            teil="teil3" 
            title="Hörverstehen Teil 3" 
            instruction={instructions.teil3}
            questionRange={[56, 60]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default HoerverstehenSection

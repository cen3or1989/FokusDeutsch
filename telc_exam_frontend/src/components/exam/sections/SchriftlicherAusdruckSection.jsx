import { useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useExam } from '@/context/ExamContext'
import TranslationControls from '../TranslationControls'
import { getStaticGermanClass, getContentTextClass, getTitleTextClass } from '@/lib/languageUtils'
import FormattedText from '@/components/ui/FormattedText'

const SchriftlicherAusdruckSection = () => {
  const { exam, answers, sectionLang } = useExam()
  const essayRef = useRef(null)

  // Focus the essay area when a task is selected
  useEffect(() => {
    if (answers.answers?.schriftlicher_ausdruck?.selected_task && essayRef.current) {
      essayRef.current.focus()
    }
  }, [answers.answers?.schriftlicher_ausdruck?.selected_task])

  if (!exam?.schriftlicher_ausdruck) return null

  const saPaths = []
  if (exam.schriftlicher_ausdruck?.task_a) saPaths.push('schriftlicher_ausdruck.task_a')
  if (exam.schriftlicher_ausdruck?.task_b) saPaths.push('schriftlicher_ausdruck.task_b')

  return (
    <div className="space-y-6">
      <Card style={{backgroundColor: 'var(--secondary-color)'}}>
        <CardHeader>
          <CardTitle className="test-title flex items-center justify-between">
            <span>Schriftlicher Ausdruck</span>
            <TranslationControls sectionKey="sa" paths={saPaths} />
          </CardTitle>
          <div className="muted-callout hv-hint mt-3">
            <p className={`text-sm leading-relaxed ${getStaticGermanClass()}`}>
              <strong>Anweisung:</strong> Wählen Sie Aufgabe A oder Aufgabe B. Zeigen Sie, was Sie können. Schreiben Sie möglichst viel zu allen Punkten. Vergessen Sie nicht Anrede und Gruß. Sie haben 30 Minuten Zeit.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label className={`section-title ${getTitleTextClass('sa', sectionLang)}`} style={{color: 'var(--primary-color)'}}>
                Aufgabe wählen:
              </Label>
              <RadioGroup
                value={answers.answers.schriftlicher_ausdruck.selected_task}
                onValueChange={(value) => answers.updateAnswer("schriftlicher_ausdruck", "selected_task", value)}
                className="mt-2"
              >
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="A" id="task-a" className="radio-group-item mt-2" />
                    <div className="flex-1">
                      <Label htmlFor="task-a" className={`radio-label subsection-title ${getTitleTextClass('sa', sectionLang)}`} style={{color: 'var(--primary-color)', fontSize: '16px', fontWeight: '600'}}>
                        Aufgabe A:
                      </Label>
                      <div className="mt-3 block" style={{color: 'var(--text-color)'}}>
                        <FormattedText
                          as="p"
                          text={exam.schriftlicher_ausdruck.task_a}
                          className={`text-base leading-relaxed whitespace-pre-line ${getContentTextClass('sa', sectionLang)}`}
                          style={{fontSize: '15px', lineHeight: '1.6'}}
                          isRTL={sectionLang['sa'] === 'fa'}
                          preserveLineBreaks={true}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="B" id="task-b" className="radio-group-item mt-2" />
                    <div className="flex-1">
                      <Label htmlFor="task-b" className={`radio-label subsection-title ${getTitleTextClass('sa', sectionLang)}`} style={{color: 'var(--primary-color)', fontSize: '16px', fontWeight: '600'}}>
                        Aufgabe B:
                      </Label>
                      <div className="mt-3 block" style={{color: 'var(--text-color)'}}>
                        <FormattedText
                          as="p"
                          text={exam.schriftlicher_ausdruck.task_b}
                          className={`text-base leading-relaxed whitespace-pre-line ${getContentTextClass('sa', sectionLang)}`}
                          style={{fontSize: '15px', lineHeight: '1.6'}}
                          isRTL={sectionLang['sa'] === 'fa'}
                          preserveLineBreaks={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {answers.answers.schriftlicher_ausdruck.selected_task && (
              <div>
                <Label htmlFor="essay" style={{color: 'var(--primary-color)'}}>
                  Ihr Text (mindestens 150 Wörter):
                </Label>
                <div className="mt-2 p-2 bg-white border rounded-lg shadow-sm">
                  <Textarea
                    id="essay"
                    ref={essayRef}
                    value={answers.answers.schriftlicher_ausdruck.text}
                    onChange={(e) => answers.updateAnswer("schriftlicher_ausdruck", "text", e.target.value)}
                    placeholder="Schreiben Sie Ihren Text hier..."
                    rows={20}
                    className="w-full"
                    style={{
                      backgroundColor: 'var(--card)', 
                      color: 'var(--text-color)', 
                      minHeight: '40vh', 
                      fontSize: '1rem', 
                      lineHeight: 1.6
                    }}
                  />
                </div>
                <div className="mt-2 text-sm" style={{color: 'var(--text-color)'}}>
                  Wortanzahl: {answers.answers.schriftlicher_ausdruck.text.split(/\s+/).filter(word => word.length > 0).length}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SchriftlicherAusdruckSection

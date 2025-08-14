import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useExam } from '@/context/ExamContext'
import TranslationControls from '../TranslationControls'
import { getStaticGermanClass, getContentTextClass, getTitleTextClass, getStaticTitleDirectionClass } from '@/lib/languageUtils'
import FormattedText from '@/components/ui/FormattedText'

const SprachbausteineTeil1 = memo(() => {
  const { exam, sectionLang } = useExam()

  if (!exam?.sprachbausteine_teil1) return null

  const sb1Paths = []
  if (exam.sprachbausteine_teil1.text) sb1Paths.push('sprachbausteine_teil1.text')
  if (Array.isArray(exam.sprachbausteine_teil1.options)) {
    exam.sprachbausteine_teil1.options.forEach((opt, idx) => {
      sb1Paths.push(`sprachbausteine_teil1.options[${idx}].a`)
      sb1Paths.push(`sprachbausteine_teil1.options[${idx}].b`)
      sb1Paths.push(`sprachbausteine_teil1.options[${idx}].c`)
    })
  }

  return (
    <Card style={{backgroundColor: 'var(--secondary-color)'}}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="test-title">Sprachbausteine Teil 1 – Grammatik</CardTitle>
          <TranslationControls sectionKey="sb1" paths={sb1Paths} />
        </div>
        <div className="muted-callout hv-hint mt-3">
          <p className={`text-sm leading-relaxed ${getStaticGermanClass()}`}>
            <strong>Anweisung:</strong> Lesen Sie den folgenden Text und entscheiden Sie, welche Wörter (a, b oder c) in die Lücken 21–30 gehören. Tragen Sie Ihre Lösungen in den Antwortbogen bei den Aufgaben 21–30 ein.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="block" style={{color: 'var(--text-color)'}}>
            <h4 className={getTitleTextClass('sb1', sectionLang)}>Text:</h4>
            <FormattedText
              as="p"
              text={exam.sprachbausteine_teil1.text}
              className={`text-sm leading-relaxed whitespace-pre-line ${getContentTextClass('sb1', sectionLang)}`}
              isRTL={sectionLang['sb1'] === 'fa'}
              preserveLineBreaks={true}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className={`section-title ${getStaticTitleDirectionClass('sb1', sectionLang)}`}>Lücken (21-30):</h4>
          {exam.sprachbausteine_teil1.options.map((option, index) => (
            <div key={index} className="p-4 border rounded" style={{backgroundColor: 'var(--card)', color: 'var(--text-color)'}}>
              <h5 className={`font-medium mb-3 ${getTitleTextClass('sb1', sectionLang)}`} style={{color: 'var(--primary-color)'}}>{index + 21}.</h5>
              <div className="space-y-1">
                <div className={`text-sm ${getStaticTitleDirectionClass('sb1', sectionLang)}`}>
                  <span className="font-medium" style={{color: 'var(--primary-color)'}}>a)</span>{' '}
                  <FormattedText
                    text={option.a}
                    className={getContentTextClass('sb1', sectionLang)}
                    isRTL={sectionLang['sb1'] === 'fa'}
                    preserveLineBreaks={true}
                  />
                </div>
                <div className={`text-sm ${getStaticTitleDirectionClass('sb1', sectionLang)}`}>
                  <span className="font-medium" style={{color: 'var(--primary-color)'}}>b)</span>{' '}
                  <FormattedText
                    text={option.b}
                    className={getContentTextClass('sb1', sectionLang)}
                    isRTL={sectionLang['sb1'] === 'fa'}
                    preserveLineBreaks={true}
                  />
                </div>
                <div className={`text-sm ${getStaticTitleDirectionClass('sb1', sectionLang)}`}>
                  <span className="font-medium" style={{color: 'var(--primary-color)'}}>c)</span>{' '}
                  <FormattedText
                    text={option.c}
                    className={getContentTextClass('sb1', sectionLang)}
                    isRTL={sectionLang['sb1'] === 'fa'}
                    preserveLineBreaks={true}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
})

const SprachbausteineTeil2 = memo(() => {
  const { exam, sectionLang } = useExam()

  if (!exam?.sprachbausteine_teil2) return null

  const sb2Paths = []
  if (exam.sprachbausteine_teil2.text) sb2Paths.push('sprachbausteine_teil2.text')
  if (Array.isArray(exam.sprachbausteine_teil2.words)) {
    exam.sprachbausteine_teil2.words.forEach((_, idx) => {
      sb2Paths.push(`sprachbausteine_teil2.words[${idx}]`)
    })
  }

  return (
    <Card style={{backgroundColor: 'var(--secondary-color)'}}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="test-title">Sprachbausteine Teil 2 – Wortschatz</CardTitle>
          <TranslationControls sectionKey="sb2" paths={sb2Paths} />
        </div>
        <div className="muted-callout hv-hint mt-3">
          <p className={`text-sm leading-relaxed ${getStaticGermanClass()}`}>
            <strong>Anweisung:</strong> Lesen Sie den folgenden Text und entscheiden Sie, welche Wörter aus dem Kasten (a–o) in die Lücken 31–40 gehören. Sie können jedes Wort im Kasten nur einmal verwenden. Nicht alle Wörter passen in den Text. Tragen Sie Ihre Lösungen in den Antwortbogen bei den Aufgaben 31–40 ein.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="block" style={{color: 'var(--text-color)'}}>
            <h4 className={getTitleTextClass('sb2', sectionLang)}>Text:</h4>
            <p className={`text-sm leading-relaxed whitespace-pre-line ${getContentTextClass('sb2', sectionLang)}`}>
              {exam.sprachbausteine_teil2.text}
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className={`section-title ${getStaticTitleDirectionClass('sb2', sectionLang)}`}>Wörter (a-o):</h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {exam.sprachbausteine_teil2.words.map((word, index) => (
              <div key={index} className={`p-2 border rounded ${getStaticTitleDirectionClass('sb2', sectionLang)}`} style={{backgroundColor: 'var(--card)', color: 'var(--text-color)'}}>
                <span className="font-medium" style={{color: 'var(--primary-color)'}}>
                  {String.fromCharCode(97 + index)})
                </span>{' '}
                <span className={getContentTextClass('sb2', sectionLang)}>{word}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className={`font-semibold mb-3 ${getStaticTitleDirectionClass('sb2', sectionLang)}`} style={{color: 'var(--primary-color)'}}>Lücken (31-40):</h4>
          <div className="text-sm" style={{color: 'var(--text-color)'}}>
            <span className={getContentTextClass('sb2', sectionLang)}>Verwenden Sie die Wörter a-o, um die Lücken 31-40 im Text zu füllen.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

const SprachbausteineSection = () => {
  const { sprachTab, setSprachTab } = useExam()
  
  return (
    <div className="space-y-6">
      <Tabs value={sprachTab} onValueChange={setSprachTab} className="w-full">
        <TabsList className="tabs-pill-list w-full flex items-center gap-2 justify-start">
          <TabsTrigger value="teil1" className="tab-trigger tab-sub">Teil 1 (21-30)</TabsTrigger>
          <TabsTrigger value="teil2" className="tab-trigger tab-sub">Teil 2 (31-40)</TabsTrigger>
        </TabsList>

        <TabsContent value="teil1" className="space-y-4">
          <SprachbausteineTeil1 />
        </TabsContent>

        <TabsContent value="teil2" className="space-y-4">
          <SprachbausteineTeil2 />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SprachbausteineSection

import { memo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useExam } from '@/context/ExamContext'
import TranslationControls from '../TranslationControls'
import { getContentTextClass, getStaticGermanClass, getTitleTextClass, getStaticTitleDirectionClass } from '@/lib/languageUtils'
import FormattedText from '@/components/ui/FormattedText'

const LesesverstehenTeil1 = memo(() => {
  const { exam, sectionLang } = useExam()
  const [titleStyles, setTitleStyles] = useState([])
  const [titleOrder, setTitleOrder] = useState([])
  const [textOrder, setTextOrder] = useState([])

  // Randomize typography and display order while preserving title-text relationships
  useEffect(() => {
    const titles = exam?.leseverstehen_teil1?.titles || []
    const texts = exam?.leseverstehen_teil1?.texts || []
    if (!titles.length) return

  if (!exam?.leseverstehen_teil1) {
    return (
      <Card style={{backgroundColor: 'var(--secondary-color)'}}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Teil 1 nicht verfügbar</h3>
            <p className="text-sm text-gray-600">
              Der Inhalt für Leseverstehen Teil 1 ist derzeit nicht verfügbar.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

    const fontPool = [
      "'Georgia', serif",
      "'Times New Roman', Times, serif",
      "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
      "Arial, Helvetica, sans-serif",
      "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Arial, sans-serif",
      "Verdana, Geneva, sans-serif",
      "Tahoma, Geneva, sans-serif",
      "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
      "'Courier New', Courier, monospace",
      "'Garamond', 'Times New Roman', serif",
      "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif",
    ]

    const shuffled = [...fontPool].sort(() => Math.random() - 0.5)
    const styles = titles.map((_, idx) => {
      const fontFamily = shuffled[idx % shuffled.length]
      const fontSize = `${16 + Math.floor(Math.random() * 13)}px`
      return { fontFamily, fontSize }
    })
    setTitleStyles(styles)

    // ⚠️ IMPORTANT: Only randomize titles display order, keep texts in original order
    // This maintains the correct title-text relationship for answer validation
    const titleDisplayOrder = Array.from({ length: titles.length }, (_, i) => i).sort(() => Math.random() - 0.5)
    const textDisplayOrder = Array.from({ length: texts.length }, (_, i) => i) // Keep original order!
    
    setTitleOrder(titleDisplayOrder)
    setTextOrder(textDisplayOrder)
  }, [exam?.leseverstehen_teil1?.titles?.length, exam?.leseverstehen_teil1?.texts?.length])



  const lv1Paths = [
    ...(exam.leseverstehen_teil1?.titles || []).map((_, idx) => `leseverstehen_teil1.titles[${idx}]`),
    ...(exam.leseverstehen_teil1?.texts || []).map((_, idx) => `leseverstehen_teil1.texts[${idx}]`)
  ]

  return (
    <Card style={{backgroundColor: 'var(--secondary-color)'}}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="test-title">Leseverstehen Teil 1 – Überschriften zuordnen</CardTitle>
          <TranslationControls sectionKey="lv1" paths={lv1Paths} />
        </div>
        <div className="muted-callout hv-hint mt-3">
          <p className={`text-sm leading-relaxed ${getStaticGermanClass()}`}>
            <strong>Anweisung:</strong> Lesen Sie zuerst die zehn Überschriften. Lesen Sie dann die fünf Texte und entscheiden Sie, welche Überschrift (a–j) am besten zu welchem Text (1–5) passt. Tragen Sie Ihre Lösungen in den Antwortbogen bei den Aufgaben 1–5 ein.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className={`section-title ${getStaticTitleDirectionClass('lv1', sectionLang)}`}>Überschriften (a-j):</h4>
            <div className="grid grid-cols-1 gap-2">
              {titleOrder.map((idx, visIdx) => (
                <div key={visIdx} className={`block ${getStaticTitleDirectionClass('lv1', sectionLang)}`} style={{color: 'var(--text-color)'}}>
                  <span className="font-medium" style={{color: 'var(--primary-color)'}}>
                    {String.fromCharCode(97 + visIdx)})
                  </span>{' '}
                  <FormattedText
                    text={exam.leseverstehen_teil1.titles[idx]}
                    className={getContentTextClass('lv1', sectionLang)}
                    style={titleStyles[visIdx] || {}}
                    isRTL={sectionLang['lv1'] === 'fa'}
                    preserveLineBreaks={true}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className={`section-title ${getStaticTitleDirectionClass('lv1', sectionLang)}`}>Texte (1-5):</h4>
            {textOrder.map((idx, visIdx) => (
              <div key={visIdx} className="mb-4 block" style={{color: 'var(--text-color)'}}>
                <h5 className={`font-medium mb-2 ${getTitleTextClass('lv1', sectionLang)}`} style={{color: 'var(--primary-color)'}}>
                  Text {visIdx + 1}:
                </h5>
                <FormattedText
                  as="p"
                  text={exam.leseverstehen_teil1.texts[idx]}
                  className={`mb-3 text-sm leading-relaxed ${getContentTextClass('lv1', sectionLang)}`}
                  isRTL={sectionLang['lv1'] === 'fa'}
                  preserveLineBreaks={true}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

const LesesverstehenTeil2 = memo(() => {
  const { exam, sectionLang } = useExam()

  if (!exam?.leseverstehen_teil2) {
    return (
      <Card style={{backgroundColor: 'var(--secondary-color)'}}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Teil 2 nicht verfügbar</h3>
            <p className="text-sm text-gray-600">
              Der Inhalt für Leseverstehen Teil 2 ist derzeit nicht verfügbar.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const texts = Array.isArray(exam.leseverstehen_teil2.texts) ? exam.leseverstehen_teil2.texts : []
  const questions = Array.isArray(exam.leseverstehen_teil2.questions) ? exam.leseverstehen_teil2.questions : []
  const lv2Paths = [
    ...texts.map((_, idx) => `leseverstehen_teil2.texts[${idx}]`),
    ...questions.flatMap((q, qIdx) => [
      `leseverstehen_teil2.questions[${qIdx}].question`,
      ...(q.options || []).map((_, oIdx) => `leseverstehen_teil2.questions[${qIdx}].options[${oIdx}]`)
    ])
  ]

  return (
    <Card style={{backgroundColor: 'var(--secondary-color)'}}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="test-title">Leseverstehen Teil 2 – Detailverständnis</CardTitle>
          <TranslationControls sectionKey="lv2" paths={lv2Paths} />
        </div>
        <div className="muted-callout hv-hint mt-3">
          <p className={`text-sm leading-relaxed ${getStaticGermanClass()}`}>
            <strong>Anweisung:</strong> Lesen Sie den Text aus der Presse und die Aufgaben 6–10. Entscheiden Sie, welche Lösung (a, b oder c) richtig ist. Tragen Sie Ihre Lösungen in den Antwortbogen bei den Aufgaben 6–10 ein.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="block" style={{color: 'var(--text-color)'}}>
            <h4>Text:</h4>
            <div className={`text-sm leading-relaxed space-y-4 ${getContentTextClass('lv2', sectionLang)}`}>
              {texts.map((text, textIndex) => (
                <p key={textIndex}>{text}</p>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className={`section-title ${getStaticTitleDirectionClass('lv2', sectionLang)}`}>Fragen:</h4>
            {questions.map((question, index) => (
              <div key={index} className="p-4 border rounded" style={{backgroundColor: 'var(--card)', color: 'var(--text-color)'}}>
                <h5 className={`font-medium mb-3 ${getTitleTextClass('lv2', sectionLang)}`} style={{color: 'var(--primary-color)'}}>
                  {index + 6}. <FormattedText
                    text={question?.question || ''}
                    className={getContentTextClass('lv2', sectionLang)}
                    isRTL={sectionLang['lv2'] === 'fa'}
                    preserveLineBreaks={true}
                  />
                </h5>
                <div className="space-y-2">
                  {(question.options || []).map((option, optIndex) => (
                    <div key={optIndex} className={`text-sm ${getStaticTitleDirectionClass('lv2', sectionLang)}`}>
                      <span className="font-medium" style={{color: 'var(--primary-color)'}}>
                        {String.fromCharCode(97 + optIndex)})
                      </span>{' '}
                      <FormattedText
                        text={option}
                        className={getContentTextClass('lv2', sectionLang)}
                        isRTL={sectionLang['lv2'] === 'fa'}
                        preserveLineBreaks={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

const LesesverstehenTeil3 = memo(() => {
  const { exam, sectionLang } = useExam()

  if (!exam?.leseverstehen_teil3?.situations || !exam?.leseverstehen_teil3?.ads) {
    return (
      <Card style={{backgroundColor: 'var(--secondary-color)'}}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Teil 3 nicht verfügbar</h3>
            <p className="text-sm text-gray-600">
              Der Inhalt für Leseverstehen Teil 3 ist derzeit nicht verfügbar.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const lv3Paths = [
    ...(exam.leseverstehen_teil3.situations || []).map((_, idx) => `leseverstehen_teil3.situations[${idx}]`),
    ...(exam.leseverstehen_teil3.ads || []).map((_, idx) => `leseverstehen_teil3.ads[${idx}]`)
  ]

  return (
    <Card style={{backgroundColor: 'var(--secondary-color)'}}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="test-title">Leseverstehen Teil 3 – Situationen zuordnen</CardTitle>
          <TranslationControls sectionKey="lv3" paths={lv3Paths} />
        </div>
        <div className="muted-callout hv-hint mt-3">
          <p className={`text-sm leading-relaxed ${getStaticGermanClass()}`}>
            <strong>Anweisung:</strong> Lesen Sie die Situationen 11–20 und die Anzeigen a–l. Finden Sie für jede Situation die passende Anzeige. Sie können jede Anzeige nur einmal verwenden. Die Anzeige aus dem Beispiel können Sie nicht mehr verwenden. Für eine Situation gibt es keine passende Anzeige. In diesem Fall schreiben Sie x. Tragen Sie Ihre Lösungen in den Antwortbogen bei den Aufgaben 11–20 ein.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className={`font-semibold mb-3 ${getStaticTitleDirectionClass('lv3', sectionLang)}`} style={{color: 'var(--primary-color)'}}>Situationen (11-20):</h4>
            <div className="space-y-3">
              {(exam.leseverstehen_teil3.situations || []).map((situation, index) => (
                <div key={index} className="p-3 border rounded" style={{backgroundColor: 'var(--card)', color: 'var(--text-color)'}}>
                  <h5 className={`font-medium ${getTitleTextClass('lv3', sectionLang)}`} style={{color: 'var(--primary-color)'}}>
                    {index + 11}. <span className={getContentTextClass('lv3', sectionLang)}>{situation}</span>
                  </h5>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className={`font-semibold mb-3 ${getStaticTitleDirectionClass('lv3', sectionLang)}`} style={{color: 'var(--primary-color)'}}>Anzeigen (a-l):</h4>
            <div className="grid grid-cols-2 gap-3">
              {(exam.leseverstehen_teil3.ads || []).map((ad, index) => (
                <div key={index} className={`p-3 border rounded ${getStaticTitleDirectionClass('lv3', sectionLang)}`} style={{backgroundColor: 'var(--card)', color: 'var(--text-color)'}}>
                  <span className="font-medium" style={{color: 'var(--primary-color)'}}>
                    {String.fromCharCode(97 + index)})
                  </span>
                  <p className={`text-sm mt-1 ${getContentTextClass('lv3', sectionLang)}`}>{ad}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

const LesesverstehenSection = () => {
  const { leseTab, setLeseTab } = useExam()
  
  const handleTabChange = (value) => {
    console.log('Tab changing from', leseTab, 'to', value)
    setLeseTab(value)
  }
  
  return (
    <div className="space-y-6">
      <Tabs value={leseTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="tabs-pill-list w-full flex items-center gap-2 justify-start">
          <TabsTrigger value="teil1" className="tab-trigger tab-sub">Teil 1 (1-5)</TabsTrigger>
          <TabsTrigger value="teil2" className="tab-trigger tab-sub">Teil 2 (6-10)</TabsTrigger>
          <TabsTrigger value="teil3" className="tab-trigger tab-sub">Teil 3 (11-20)</TabsTrigger>
        </TabsList>

        <TabsContent value="teil1" className="space-y-4">
          <LesesverstehenTeil1 />
        </TabsContent>

        <TabsContent value="teil2" className="space-y-4">
          <LesesverstehenTeil2 />
        </TabsContent>

        <TabsContent value="teil3" className="space-y-4">
          <LesesverstehenTeil3 />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LesesverstehenSection

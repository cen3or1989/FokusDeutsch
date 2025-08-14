import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { Clock, Play, Pause, CheckCircle, Loader2, Headphones, MessageSquare, PenLine, BookOpen, Wand2 } from 'lucide-react'
import ThemeSwitch from './ThemeSwitch'
import { toast } from 'sonner'
import AnswerSheet from './AnswerSheet'
import { API_BASE_URL } from '@/lib/api'

const ExamInterface = ({ examId, onComplete, onCancelExam }) => {
  const [exam, setExam] = useState(null)
  const [originalExam, setOriginalExam] = useState(null)
  const [clientTranslations, setClientTranslations] = useState({})
  const [answers, setAnswers] = useState({})
  const [currentSection, setCurrentSection] = useState('leseverstehen')
  const [timeRemaining, setTimeRemaining] = useState(5400) // 90 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState({})
  const [leseTab, setLeseTab] = useState('teil1')
  const [sprachTab, setSprachTab] = useState('teil1')
  const [hoerTab, setHoerTab] = useState('teil1')
  const [showSaved, setShowSaved] = useState(false)
  const [translating, setTranslating] = useState({})
  const [translateProgress, setTranslateProgress] = useState({})
  const [sectionLang, setSectionLang] = useState({
    lv1: 'de', lv2: 'de', lv3: 'de', sb1: 'de', sb2: 'de', sa: 'de',
    hv_teil1: 'de', hv_teil2: 'de', hv_teil3: 'de'
  })
  const [lv1TitleStyles, setLv1TitleStyles] = useState([])
  const [lv1TitleOrder, setLv1TitleOrder] = useState([])
  const [lv1TextOrder, setLv1TextOrder] = useState([])
  const [mode, setMode] = useState('practice')
  const essayRef = useRef(null)
  const TRANSLATE_CHUNK_SIZE = 8

  const getClientTransKey = () => `translations_${examId}_FA`
  const loadClientTranslations = () => {
    try {
      const raw = localStorage.getItem(getClientTransKey())
      if (raw) setClientTranslations(JSON.parse(raw))
    } catch (_) {}
  }
  const persistClientTranslations = (map) => {
    setClientTranslations(map)
    try { localStorage.setItem(getClientTransKey(), JSON.stringify(map)) } catch(_) {}
  }

  // Generic robust setter for deep paths like a.b[0].c or x[1].y[2]
  const setValueAtPath = (obj, path, value) => {
    // Normalize tokens: 'a.b[0].c' => ['a','b',0,'c']
    const tokens = path.split('.').flatMap(seg => {
      const m = seg.match(/^([^\[]+)(?:\[(\d+)\])?$/)
      if (!m) return [seg]
      const key = m[1]
      const idx = m[2] !== undefined ? parseInt(m[2], 10) : undefined
      return idx !== undefined ? [key, idx] : [key]
    })

    let ref = obj
    for (let i = 0; i < tokens.length; i++) {
      const isLast = i === tokens.length - 1
      const tok = tokens[i]

      if (typeof tok === 'string') {
        const next = tokens[i + 1]
        if (isLast) {
          ref[tok] = value
        } else if (typeof next === 'number') {
          if (!Array.isArray(ref[tok])) ref[tok] = []
          ref = ref[tok]
          i++ // consume index in next loop iteration
          const idx = next
          const nextAfterIdx = tokens[i + 1]
          if (isNaN(idx)) return
          if (i === tokens.length - 1) {
            ref[idx] = value
          } else {
            if (typeof nextAfterIdx === 'number') {
              if (!Array.isArray(ref[idx])) ref[idx] = []
            } else {
              if (ref[idx] === undefined || ref[idx] === null) ref[idx] = {}
            }
            ref = ref[idx]
          }
        } else {
          if (ref[tok] === undefined || ref[tok] === null) ref[tok] = {}
          ref = ref[tok]
        }
      } else if (typeof tok === 'number') {
        const idx = tok
        const next = tokens[i + 1]
        if (!Array.isArray(ref)) return
        if (isLast) {
          ref[idx] = value
        } else {
          if (typeof next === 'number') {
            if (!Array.isArray(ref[idx])) ref[idx] = []
          } else {
            if (ref[idx] === undefined || ref[idx] === null) ref[idx] = {}
          }
          ref = ref[idx]
        }
      }
    }
  }

  const getValueAtPath = (obj, path) => {
    if (!obj) return undefined
    const tokens = path.split('.').flatMap(seg => {
      const m = seg.match(/^([^\[]+)(?:\[(\d+)\])?$/)
      if (!m) return [seg]
      const key = m[1]
      const idx = m[2] !== undefined ? parseInt(m[2], 10) : undefined
      return idx !== undefined ? [key, idx] : [key]
    })
    let ref = obj
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i]
      if (typeof tok === 'string') {
        if (ref == null || typeof ref !== 'object') return undefined
        ref = ref[tok]
      } else if (typeof tok === 'number') {
        if (!Array.isArray(ref)) return undefined
        ref = ref[tok]
      }
    }
    return ref
  }

  const restorePathsToOriginal = (paths) => {
    if (!originalExam || !exam || !Array.isArray(paths)) return
    const updated = structuredClone(exam)
    for (const p of paths) {
      const originalVal = getValueAtPath(originalExam, p)
      if (originalVal !== undefined) setValueAtPath(updated, p, originalVal)
    }
    setExam(updated)
    toast.success('Deutscher Text wiederhergestellt')
  }

  const chunkArray = (arr, size) => {
    const out = []
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
    return out
  }

  // Translate a list of paths in small batches to avoid timeouts/large requests
  const translatePathsInChunks = async (paths, translatingKey) => {
    if (!paths || paths.length === 0) return
    setTranslating(prev => ({ ...prev, [translatingKey]: true }))
    const batches = chunkArray(paths, TRANSLATE_CHUNK_SIZE)
    let updated = structuredClone(exam)
    const allTranslations = {}
    const adminToken = typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || '') : ''
    try {
      // Apply cached translations immediately to avoid API re-calls
      const cachedMap = { ...clientTranslations }
      const cachedPaths = paths.filter(p => cachedMap[p])
      const toFetchPaths = paths.filter(p => !cachedMap[p])
      for (const cp of cachedPaths) {
        setValueAtPath(updated, cp, cachedMap[cp])
      }
      let done = cachedPaths.length
      const total = paths.length
      if (done > 0) setTranslateProgress(prev => ({ ...prev, [translatingKey]: Math.min(100, Math.round((done / total) * 100)) }))
      const fetchBatches = chunkArray(toFetchPaths, TRANSLATE_CHUNK_SIZE)
      for (let batchIdx = 0; batchIdx < fetchBatches.length; batchIdx++) {
        const batch = fetchBatches[batchIdx]
        try {
          const resp = await fetch(`${API_BASE_URL}/api/exams/${examId}/translate_parts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
            },
            body: JSON.stringify({ source_lang: 'DE', target_lang: 'FA', paths: batch })
          })
          const data = await resp.json()
          if (data && data.translations) {
            Object.entries(data.translations).forEach(([k, v]) => {
              allTranslations[k] = v
              cachedMap[k] = v
            })
          }
        } catch (e) {
          // Continue with next batch, but notify user minimally
          console.error('Batch translate failed', e)
          toast.error('Ein Teil der Übersetzung ist fehlgeschlagen')
        }
        done += batch.length
        const percent = Math.min(100, Math.round((done / total) * 100))
        setTranslateProgress(prev => ({ ...prev, [translatingKey]: percent }))
        // Small delay to avoid hammering the API and allow UI to paint
        await new Promise(r => setTimeout(r, 120))
      }
      // Apply all translations at once to avoid intermediate mixed states
      Object.entries(allTranslations).forEach(([k, v]) => setValueAtPath(updated, k, v))
      setExam(updated)
      persistClientTranslations(cachedMap)
      toast.success('Übersetzung aktualisiert')
    } finally {
      setTranslating(prev => ({ ...prev, [translatingKey]: false }))
      setTranslateProgress(prev => ({ ...prev, [translatingKey]: 0 }))
    }
  }

  useEffect(() => {
    if (examId) {
      fetchExam()
    }
  }, [examId])

  useEffect(() => {
    let interval = null
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsTimerRunning(false)
            handleSubmit()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timeRemaining])

  // Warn before unload ONLY if exam started and we are on exam route
  useEffect(() => {
    const handler = (e) => {
      const onExamRoute = window.location.pathname.startsWith('/exam/')
      const started = hasStarted && isTimerRunning
      if (onExamRoute && started) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasStarted, isTimerRunning])

  // Build localized instruction texts for each exam section (German UI)
  const renderSectionInstructions = (section) => {
    const instructions = {
      leseverstehen: {
        title: "90 Minuten Leseverstehen und Sprachbausteine",
        parts: {
          teil1: {
            title: "Leseverstehen Teil 1",
            instruction: "Lesen Sie zuerst die zehn Überschriften. Lesen Sie dann die fünf Texte und entscheiden Sie, welche Überschrift (a–j) am besten zu welchem Text (1–5) passt. Tragen Sie Ihre Lösungen in den Antwortbogen bei den Aufgaben 1–5 ein."
          },
          teil2: {
            title: "Leseverstehen Teil 2", 
            instruction: "Lesen Sie den Text aus der Presse und die Aufgaben 6–10. Entscheiden Sie, welche Lösung (a, b oder c) richtig ist. Tragen Sie Ihre Lösungen in den Antwortbogen bei den Aufgaben 6–10 ein."
          },
          teil3: {
            title: "Leseverstehen Teil 3",
            instruction: "Lesen Sie die Situationen 11–20 und die Anzeigen a–l. Finden Sie für jede Situation die passende Anzeige. Sie können jede Anzeige nur einmal verwenden. Die Anzeige aus dem Beispiel können Sie nicht mehr verwenden. Für eine Situation gibt es keine passende Anzeige. In diesem Fall schreiben Sie x. Tragen Sie Ihre Lösungen in den Antwortbogen bei den Aufgaben 11–20 ein."
          }
        }
      },
      sprachbausteine: {
        title: "Sprachbausteine",
        parts: {
          teil1: {
            title: "Sprachbausteine Teil 1",
            instruction: "Lesen Sie den folgenden Text und entscheiden Sie, welche Wörter (a, b oder c) in die Lücken 21–30 gehören. Tragen Sie Ihre Lösungen in den Antwortbogen bei den Aufgaben 21–30 ein."
          },
          teil2: {
            title: "Sprachbausteine Teil 2", 
            instruction: "Lesen Sie den folgenden Text und entscheiden Sie, welche Wörter aus dem Kasten (a–o) in die Lücken 31–40 gehören. Sie können jedes Wort im Kasten nur einmal verwenden. Nicht alle Wörter passen in den Text. Tragen Sie Ihre Lösungen in den Antwortbogen bei den Aufgaben 31–40 ein."
          }
        }
      },
      hoerverstehen: {
        title: "20 Minuten Hörverstehen",
        parts: {
          teil1: {
            title: "Hörverstehen Teil 1",
            instruction: "Sie hören fünf kurze Texte. Sie hören jeden Text zweimal. Zu jedem Text lösen Sie zwei Aufgaben. Wählen Sie bei jeder Aufgabe die richtige Lösung. Lesen Sie jetzt die Aufgaben 41–50. Dafür haben Sie 60 Sekunden Zeit."
          },
          teil2: {
            title: "Hörverstehen Teil 2",
            instruction: "Sie hören ein Gespräch. Sie hören das Gespräch einmal. Dazu lösen Sie fünf Aufgaben. Wählen Sie bei jeder Aufgabe: Sind die Aussagen Richtig oder Falsch? Lesen Sie jetzt die Aufgaben 51–55. Dafür haben Sie 60 Sekunden Zeit."
          },
          teil3: {
            title: "Hörverstehen Teil 3",
            instruction: "Sie hören fünf kurze Texte. Sie hören jeden Text einmal. Zu jedem Text gibt es eine Aufgabe. Wählen Sie bei jeder Aufgabe die richtige Lösung a, b oder c. Lesen Sie jetzt die Aufgaben 56–60. Dafür haben Sie 30 Sekunden Zeit."
          }
        }
      },
      schriftlicher_ausdruck: {
        title: "30 Minuten Schriftlicher Ausdruck",
        parts: {
          aufgabe: {
            title: "Schriftlicher Ausdruck",
            instruction: "Wählen Sie Aufgabe A oder Aufgabe B. Zeigen Sie, was Sie können. Schreiben Sie möglichst viel zu allen Punkten. Vergessen Sie nicht Anrede und Gruß. Sie haben 30 Minuten Zeit."
          }
        }
      }
    }
    
    return instructions[section] || null
  }
  const fetchExam = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}`)
      const data = await response.json()
      setExam(data)
      setOriginalExam(structuredClone(data))
      initializeAnswers(data)
      loadClientTranslations()
    } catch (error) {
      console.error('Failed to fetch exam:', error)
    }
  }

  // Removed global language dropdown and full-exam translation

  const initializeAnswers = (examData) => {
    const initialAnswers = {
      leseverstehen_teil1: Array(5).fill(''),
      leseverstehen_teil2: Array(5).fill(''),
      leseverstehen_teil3: Array(10).fill(''),
      sprachbausteine_teil1: Array(10).fill(''),
      sprachbausteine_teil2: Array(10).fill(''),
      hoerverstehen: {
        teil1: Array(5).fill(null),
        teil2: Array(10).fill(null),
        teil3: Array(5).fill(null)
      },
      schriftlicher_ausdruck: {
        selected_task: '',
        text: ''
      }
    }
    setAnswers(initialAnswers)
  }

  // Randomize typography and display order for Leseverstehen Teil 1
  useEffect(() => {
    const titles = exam?.leseverstehen_teil1?.titles || []
    const texts = exam?.leseverstehen_teil1?.texts || []
    if (!titles.length) return
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
    // Shuffle fonts and pick for each title; sizes 16-28px randomly
    const shuffled = [...fontPool].sort(() => Math.random() - 0.5)
    const styles = titles.map((_, idx) => {
      const fontFamily = shuffled[idx % shuffled.length]
      const fontSize = `${16 + Math.floor(Math.random() * 13)}px` // 16–28px
      return { fontFamily, fontSize }
    })
    setLv1TitleStyles(styles)
    // random order for display (keep original labels for mapping)
    const makeOrder = (n) => Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5)
    setLv1TitleOrder(makeOrder(titles.length))
    setLv1TextOrder(makeOrder(texts.length))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam?.leseverstehen_teil1?.titles?.length, exam?.leseverstehen_teil1?.texts?.length])

  const updateAnswer = (section, index, value) => {
    setAnswers(prev => {
      const newAnswers = { ...prev }
      if (section.includes('hoerverstehen')) {
        const [, teil] = section.split('_')
        newAnswers.hoerverstehen[teil][index] = value
      } else if (section === 'schriftlicher_ausdruck') {
        newAnswers.schriftlicher_ausdruck[index] = value
      } else {
        newAnswers[section][index] = value
      }
      return newAnswers
    })
    setShowSaved(true)
    window.clearTimeout(updateAnswer._t)
    updateAnswer._t = window.setTimeout(() => setShowSaved(false), 1200)
  }

  const handleSubmit = async () => {
    if (!studentName.trim()) {
      toast.error('Bitte geben Sie Ihren Namen ein')
      return
    }

    try {
      // Normalize LV2 answers from letters (a/b/c) to indices (0/1/2) to match backend scoring
      const normalizedAnswers = { ...answers }
      if (Array.isArray(normalizedAnswers.leseverstehen_teil2)) {
        const mapLetterToIndex = { a: 0, b: 1, c: 2 }
        normalizedAnswers.leseverstehen_teil2 = normalizedAnswers.leseverstehen_teil2.map(v => {
          if (typeof v === 'string') {
            return mapLetterToIndex[v] ?? v
          }
          return v
        })
      }

      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_name: studentName,
          answers: normalizedAnswers
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setIsSubmitted(true)
        setIsTimerRunning(false)
        onComplete(result)
      } else {
         toast.error('Fehler beim Einreichen der Prüfung')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Fehler beim Einreichen der Prüfung')
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const playAudio = (audioUrl, section) => {
    if (!audioUrl) {
      toast.error('Keine Audio-Datei verfügbar')
      return
    }
    const audio = new Audio(audioUrl)
    setAudioPlaying(prev => ({ ...prev, [section]: true }))
    audio.onended = () => {
      setAudioPlaying(prev => ({ ...prev, [section]: false }))
    }
    audio.onerror = () => {
      setAudioPlaying(prev => ({ ...prev, [section]: false }))
      toast.error('Audio konnte nicht geladen werden')
    }
    audio.play().catch(() => {
      setAudioPlaying(prev => ({ ...prev, [section]: false }))
      toast.error('Audio konnte nicht abgespielt werden')
    })
  }

  // Prevent accidental leave while timer running
  useEffect(() => {
    const handler = (e) => {
      if (isTimerRunning) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isTimerRunning])
  // Clear flag when submitted
  useEffect(() => {
    if (isSubmitted) {
      sessionStorage.removeItem('exam_in_progress')
    }
  }, [isSubmitted])

  // Keyboard shortcuts for navigation (Left/Right)
  useEffect(() => {
    const handler = (e) => {
      const tag = (e.target.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (e.key === 'ArrowRight') {
        e.preventDefault(); navigateNext()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault(); navigatePrev()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentSection, leseTab, sprachTab, hoerTab])

  const mainSections = ['leseverstehen','sprachbausteine','hoerverstehen','schriftlicher_ausdruck']
  const navigatePrev = () => {
    if (currentSection === 'leseverstehen') {
      setLeseTab(prev => prev === 'teil1' ? 'teil1' : prev === 'teil2' ? 'teil1' : 'teil2')
    } else if (currentSection === 'sprachbausteine') {
      setSprachTab(prev => prev === 'teil1' ? 'teil1' : 'teil1')
    } else if (currentSection === 'hoerverstehen') {
      setHoerTab(prev => prev === 'teil1' ? 'teil1' : prev === 'teil2' ? 'teil1' : 'teil2')
    } else {
      const idx = mainSections.indexOf(currentSection)
      if (idx > 0) setCurrentSection(mainSections[idx - 1])
    }
  }
  const navigateNext = () => {
    if (currentSection === 'leseverstehen') {
      setLeseTab(prev => prev === 'teil1' ? 'teil2' : prev === 'teil2' ? 'teil3' : 'teil3')
    } else if (currentSection === 'sprachbausteine') {
      setSprachTab(prev => prev === 'teil1' ? 'teil2' : 'teil2')
    } else if (currentSection === 'hoerverstehen') {
      setHoerTab(prev => prev === 'teil1' ? 'teil2' : prev === 'teil2' ? 'teil3' : 'teil3')
    } else {
      const idx = mainSections.indexOf(currentSection)
      if (idx < mainSections.length - 1) setCurrentSection(mainSections[idx + 1])
    }
  }

  // Progress badges for main tabs
  const getProgress = (sectionKey) => {
    if (!answers) return { answered: 0, total: 0 }
    switch(sectionKey){
      case 'leseverstehen': {
        const a = (answers.leseverstehen_teil1||[]).filter(Boolean).length
        const b = (answers.leseverstehen_teil2||[]).filter(Boolean).length
        const c = (answers.leseverstehen_teil3||[]).filter(Boolean).length
        return { answered: a+b+c, total: 20 }
      }
      case 'sprachbausteine': {
        const a = (answers.sprachbausteine_teil1||[]).filter(Boolean).length
        const b = (answers.sprachbausteine_teil2||[]).filter(Boolean).length
        return { answered: a+b, total: 20 }
      }
      case 'hoerverstehen': {
        const t1 = (answers.hoerverstehen?.teil1||[]).filter(v=>typeof v==='boolean').length
        const t2 = (answers.hoerverstehen?.teil2||[]).filter(v=>typeof v==='boolean').length
        const t3 = (answers.hoerverstehen?.teil3||[]).filter(v=>typeof v==='boolean').length
        return { answered: t1+t2+t3, total: 20 }
      }
      case 'schriftlicher_ausdruck': {
        const done = answers.schriftlicher_ausdruck?.selected_task ? 1 : 0
        return { answered: done, total: 1 }
      }
      default: return { answered: 0, total: 0 }
    }
  }

  // Focus the essay area when a task is selected
  useEffect(() => {
    if (answers?.schriftlicher_ausdruck?.selected_task && essayRef.current) {
      essayRef.current.focus()
    }
  }, [answers?.schriftlicher_ausdruck?.selected_task])

  if (!exam) {
    return <div className="flex justify-center items-center h-screen">Prüfung wird geladen...</div>
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Prüfung erfolgreich eingereicht!</h2>
        <p>Ihre Ergebnisse werden verarbeitet...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6" style={{backgroundColor: 'var(--background-color)'}}>
      {/* Compact sticky top bar with exam title and timer */}
      <div className="sticky top-0 z-50" style={{backgroundColor:'var(--secondary-color)', borderBottom:'1px solid var(--border-color)'}}>
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="truncate">
              <span className="title-chip text-sm font-semibold">
                <i className="fa-solid fa-book"></i>
                <span className="truncate" style={{maxWidth:'60vw'}}>{exam?.title || 'Prüfung'}</span>
              </span>
            </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-bold" style={{
              color: timeRemaining <= 540 ? 'var(--error-color)' : timeRemaining <= 1080 ? 'var(--warning-color)' : 'var(--text-color)'
            }}>
              {formatTime(timeRemaining)}
            </span>
            <ThemeSwitch />
          </div>
        </div>
      </div>
      {/* Answer Sheet Component */}
      <AnswerSheet
        answers={answers}
        onAnswerChange={updateAnswer}
        onSubmit={handleSubmit}
        studentName={studentName}
        onStudentNameChange={setStudentName}
        disabled={!hasStarted}
      />

      {/* Hero + Tiles + Segmented Control */}
      <section className="hero-grad rounded-2xl border mb-6" style={{borderColor:'var(--border-color)'}}>
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold" style={{color:'var(--text-color)'}}>Übungsbereich</h2>
            <p className="text-sm" style={{color:'var(--muted-text-color)'}}>Wechseln Sie schnell zwischen den Abschnitten und wählen Sie den gewünschten Modus.</p>
          </div>
          {/* Timer + Name inside hero */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6" />
          <span className="text-xl font-bold" style={{
                color: timeRemaining <= 540 ? 'var(--error-color)' : timeRemaining <= 1080 ? 'var(--warning-color)' : 'var(--text-color)'
          }}>
            {formatTime(timeRemaining)}
          </span>
              {showSaved && (<span className="text-sm text-green-700 ml-2">Saved</span>)}
        </div>
            <div className="flex-1 md:flex-none">
              <div className="flex items-stretch gap-2">
                <Input
                  id="student_name_top"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Bitte Ihren Namen eingeben"
                  className="name-input"
                  style={{ marginBottom: 0 }}
                  disabled={hasStarted}
                />
                {!hasStarted && (
          <Button 
                    onClick={() => { setHasStarted(true); setIsTimerRunning(true); sessionStorage.setItem('exam_in_progress','1') }} 
            disabled={!studentName.trim()}
                    className="btn-primary"
                    style={{ height: '44px' }}
          >
            <Play className="w-4 h-4 ml-2" />
             Prüfung starten
          </Button>
        )}
      </div>
      </div>
          </div>
          {/* Tile Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[{
              key:'leseverstehen', label:'Leseverstehen', icon: BookOpen
            },{
              key:'sprachbausteine', label:'Sprachbausteine', icon: MessageSquare
            },{
              key:'hoerverstehen', label:'Hörverstehen', icon: Headphones
            },{
              key:'schriftlicher_ausdruck', label:'Schriftlicher Ausdruck', icon: PenLine
            }].map(({key,label,icon:Icon})=> (
              <button key={key}
                className={`tile-tab ${currentSection===key?'active':''}`}
                onClick={()=> setCurrentSection(key)}
                aria-pressed={currentSection===key}
              >
                <Icon className="w-5 h-5"/>
                <span>{label}</span>
              </button>
            ))}
          </div>
          {/* Segmented Control removed as requested */}
        </div>
        {/* Insight Card removed for now */}
      </section>

      {/* Remove old sticky timer bar */}

      {/* Old exam title card removed */}

      {/* Removed old name input and start button block (moved to hero) */}

      {/* Old progress bar removed */}

      {/* Exam Content */}
      <Tabs value={currentSection} onValueChange={setCurrentSection} className="w-full relative">
        {!hasStarted && (
          <div className="absolute inset-0 z-40 flex items-center justify-center" style={{background:'rgba(255,255,255,0.7)', backdropFilter:'blur(2px)'}}>
            <div className="bg-white border rounded-lg shadow p-4 text-center max-w-md">
              <div className="font-semibold mb-2">Prüfung ist gesperrt</div>
              <div className="text-sm text-gray-600">Bitte geben Sie Ihren Namen ein und klicken Sie auf „Prüfung starten“, um zu beginnen.</div>
            </div>
          </div>
        )}
        {/* Removed old main tabs */}

        {/* Leseverstehen */}
        <TabsContent value="leseverstehen" className="space-y-6">
          <Tabs defaultValue="teil1" className="w-full">
            <TabsList className="tabs-pill-list w-full flex items-center gap-2 justify-start">
              <TabsTrigger value="teil1" className="tab-trigger tab-sub">Teil 1 (1-5)</TabsTrigger>
              <TabsTrigger value="teil2" className="tab-trigger tab-sub">Teil 2 (6-10)</TabsTrigger>
              <TabsTrigger value="teil3" className="tab-trigger tab-sub">Teil 3 (11-20)</TabsTrigger>
            </TabsList>

            <TabsContent value="teil1" className="space-y-4">
              <Card style={{backgroundColor: 'var(--secondary-color)'}}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                  <CardTitle className="test-title">Leseverstehen Teil 1 – Überschriften zuordnen</CardTitle>
                    <div className="lang-toggle" role="tablist" aria-label="Sprache umschalten">
                      <button
                        className={`lang-btn ${sectionLang.lv1==='de' ? 'active' : ''}`}
                        onClick={async () => {
                          const paths = [
                            ...exam.leseverstehen_teil1.titles.map((_, idx) => `leseverstehen_teil1.titles[${idx}]`),
                            ...exam.leseverstehen_teil1.texts.map((_, idx) => `leseverstehen_teil1.texts[${idx}]`)
                          ]
                          restorePathsToOriginal(paths)
                          setSectionLang(prev=>({...prev, lv1:'de'}))
                        }}
                        disabled={!!translating.lv1}
                        aria-label="Deutsch anzeigen"
                      >
                        <i className="fa-solid fa-globe"/> Deutsch
                      </button>
                      <button
                        className={`lang-btn ${sectionLang.lv1==='fa' ? 'active' : ''}`}
                        onClick={async () => {
                          const paths = [
                            ...exam.leseverstehen_teil1.titles.map((_, idx) => `leseverstehen_teil1.titles[${idx}]`),
                            ...exam.leseverstehen_teil1.texts.map((_, idx) => `leseverstehen_teil1.texts[${idx}]`)
                          ]
                          await translatePathsInChunks(paths, 'lv1')
                          setSectionLang(prev=>({...prev, lv1:'fa'}))
                        }}
                        disabled={!!translating.lv1}
                        aria-label="Persisch anzeigen"
                      >
                        {translating.lv1 ? (<i className="fa-solid fa-spinner fa-spin"/>) : (<i className="fa-solid fa-language"/>)} Persisch
                      </button>
                    </div>
                    <div className="hidden">
                      <Button
                      variant="default"
                      size="sm"
                      className="px-3 py-1.5 text-sm font-medium bg-primary text-white hover:opacity-90 disabled:opacity-60"
                      onClick={async () => {
                        const paths = [
                          ...exam.leseverstehen_teil1.titles.map((_, idx) => `leseverstehen_teil1.titles[${idx}]`),
                          ...exam.leseverstehen_teil1.texts.map((_, idx) => `leseverstehen_teil1.texts[${idx}]`)
                        ]
                        await translatePathsInChunks(paths, 'lv1')
                      }}
                      disabled={!!translating.lv1}
                    >
                      {translating.lv1 ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin"/>
                          {`Wird geladen… ${translateProgress.lv1||0}%`}
                        </span>
                      ) : 'Persisch anzeigen'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const paths = [
                            ...exam.leseverstehen_teil1.titles.map((_, idx) => `leseverstehen_teil1.titles[${idx}]`),
                            ...exam.leseverstehen_teil1.texts.map((_, idx) => `leseverstehen_teil1.texts[${idx}]`)
                          ]
                          restorePathsToOriginal(paths)
                        }}
                        disabled={!!translating.lv1}
                      >Deutsch anzeigen</Button>
                    </div>
                  </div>
                  <div className="muted-callout hv-hint mt-3">
                    <p className="text-sm leading-relaxed german-text"><strong>Anweisung:</strong> Lesen Sie zuerst die zehn Überschriften. Lesen Sie dann die fünf Texte und entscheiden Sie, welche Überschrift (a–j) am besten zu welchem Text (1–5) passt. Tragen Sie Ihre Lösungen in den Antwortbogen bei den Aufgaben 1–5 ein.</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="section-title">Überschriften (a-j):</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {lv1TitleOrder.map((idx, visIdx) => (
                          <div key={visIdx} className="block" style={{color: 'var(--text-color)'}}>
                            <span className="font-medium" style={{color: 'var(--primary-color)'}}>{String.fromCharCode(97 + visIdx)})</span>{' '}
                            <span style={lv1TitleStyles[visIdx] || {}}>{exam.leseverstehen_teil1.titles[idx]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="section-title">Texte (1-5):</h4>
                      {lv1TextOrder.map((idx, visIdx) => (
                        <div key={visIdx} className="mb-4 block" style={{color: 'var(--text-color)'}}>
                          <h5 className="font-medium mb-2" style={{color: 'var(--primary-color)'}}>Text {visIdx + 1}:</h5>
                          <p className="mb-3 text-sm leading-relaxed german-text">{exam.leseverstehen_teil1.texts[idx]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teil2" className="space-y-4">
              <Card style={{backgroundColor: 'var(--secondary-color)'}}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                  <CardTitle className="test-title">Leseverstehen Teil 2 – Detailverständnis</CardTitle>
                    <div className="lang-toggle" role="tablist" aria-label="Sprache umschalten">
                      <button
                        className={`lang-btn ${sectionLang.lv2==='de' ? 'active' : ''}`}
                        onClick={() => {
                          const paths = [
                            ...exam.leseverstehen_teil2.texts.map((_, idx) => `leseverstehen_teil2.texts[${idx}]`),
                            ...exam.leseverstehen_teil2.questions.flatMap((q, qIdx) => [
                              `leseverstehen_teil2.questions[${qIdx}].question`,
                              ...q.options.map((_, oIdx) => `leseverstehen_teil2.questions[${qIdx}].options[${oIdx}]`)
                            ])
                          ]
                          restorePathsToOriginal(paths)
                          setSectionLang(prev=>({...prev, lv2:'de'}))
                        }}
                        disabled={!!translating.lv2}
                        aria-label="Deutsch anzeigen"
                      >
                        <i className="fa-solid fa-globe"/> Deutsch
                      </button>
                      <button
                        className={`lang-btn ${sectionLang.lv2==='fa' ? 'active' : ''}`}
                        onClick={async () => {
                          const paths = [
                            ...exam.leseverstehen_teil2.texts.map((_, idx) => `leseverstehen_teil2.texts[${idx}]`),
                            ...exam.leseverstehen_teil2.questions.flatMap((q, qIdx) => [
                              `leseverstehen_teil2.questions[${qIdx}].question`,
                              ...q.options.map((_, oIdx) => `leseverstehen_teil2.questions[${qIdx}].options[${oIdx}]`)
                            ])
                          ]
                          await translatePathsInChunks(paths, 'lv2')
                          setSectionLang(prev=>({...prev, lv2:'fa'}))
                        }}
                        disabled={!!translating.lv2}
                        aria-label="Persisch anzeigen"
                      >
                        {translating.lv2 ? (<i className="fa-solid fa-spinner fa-spin"/>) : (<i className="fa-solid fa-language"/>)} Persisch
                      </button>
                    </div>
                    <div className="hidden">
                      <Button
                      variant="default"
                      size="sm"
                      className="px-3 py-1.5 text-sm font-medium bg-primary text-white hover:opacity-90 disabled:opacity-60"
                      onClick={async () => {
                        const paths = [
                          ...exam.leseverstehen_teil2.texts.map((_, idx) => `leseverstehen_teil2.texts[${idx}]`),
                          ...exam.leseverstehen_teil2.questions.flatMap((q, qIdx) => [
                            `leseverstehen_teil2.questions[${qIdx}].question`,
                            ...q.options.map((_, oIdx) => `leseverstehen_teil2.questions[${qIdx}].options[${oIdx}]`)
                          ])
                        ]
                        await translatePathsInChunks(paths, 'lv2')
                      }}
                      disabled={!!translating.lv2}
                    >
                      {translating.lv2 ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin"/>
                          {`Wird geladen… ${translateProgress.lv2||0}%`}
                        </span>
                      ) : 'Persisch anzeigen'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const paths = [
                            ...exam.leseverstehen_teil2.texts.map((_, idx) => `leseverstehen_teil2.texts[${idx}]`),
                            ...exam.leseverstehen_teil2.questions.flatMap((q, qIdx) => [
                              `leseverstehen_teil2.questions[${qIdx}].question`,
                              ...q.options.map((_, oIdx) => `leseverstehen_teil2.questions[${qIdx}].options[${oIdx}]`)
                            ])
                          ]
                          restorePathsToOriginal(paths)
                        }}
                        disabled={!!translating.lv2}
                      >Deutsch anzeigen</Button>
                    </div>
                  </div>
                  <div className="muted-callout hv-hint mt-3">
                    <p className="text-sm leading-relaxed german-text"><strong>Anweisung:</strong> Lesen Sie den Text aus der Presse und die Aufgaben 6–10. Entscheiden Sie, welche Lösung (a, b oder c) richtig ist. Tragen Sie Ihre Lösungen in den Antwortbogen bei den Aufgaben 6–10 ein.</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="block" style={{color: 'var(--text-color)'}}>
                      <h4>Text:</h4>
                      <div className="text-sm leading-relaxed space-y-4 german-text">
                        {exam.leseverstehen_teil2.texts.map((text, textIndex) => (
                          <p key={textIndex}>{text}</p>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="section-title">Fragen:</h4>
                      {exam.leseverstehen_teil2.questions.map((question, index) => (
                        <div key={index} className="p-4 border rounded" style={{backgroundColor: 'var(--card)', color: 'var(--text-color)'}}>
                          <h5 className="font-medium mb-3" style={{color: 'var(--primary-color)'}}>{index + 6}. <span className="german-text">{question.question}</span></h5>
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="text-sm">
                                <span className="font-medium" style={{color: 'var(--primary-color)'}}>{String.fromCharCode(97 + optIndex)})</span> <span className="german-text">{option}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teil3" className="space-y-4">
              <Card style={{backgroundColor: 'var(--secondary-color)'}}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                  <CardTitle className="test-title">Leseverstehen Teil 3 – Situationen zuordnen</CardTitle>
                    <div className="lang-toggle" role="tablist" aria-label="Sprache umschalten">
                      <button
                        className={`lang-btn ${sectionLang.lv3==='de' ? 'active' : ''}`}
                        onClick={() => {
                          const paths = [
                            ...exam.leseverstehen_teil3.situations.map((_, idx) => `leseverstehen_teil3.situations[${idx}]`),
                            ...exam.leseverstehen_teil3.ads.map((_, idx) => `leseverstehen_teil3.ads[${idx}]`)
                          ]
                          restorePathsToOriginal(paths)
                          setSectionLang(prev=>({...prev, lv3:'de'}))
                        }}
                        disabled={!!translating.lv3}
                        aria-label="Deutsch anzeigen"
                      >
                        <i className="fa-solid fa-globe"/> Deutsch
                      </button>
                      <button
                        className={`lang-btn ${sectionLang.lv3==='fa' ? 'active' : ''}`}
                        onClick={async () => {
                          const paths = [
                            ...exam.leseverstehen_teil3.situations.map((_, idx) => `leseverstehen_teil3.situations[${idx}]`),
                            ...exam.leseverstehen_teil3.ads.map((_, idx) => `leseverstehen_teil3.ads[${idx}]`)
                          ]
                          await translatePathsInChunks(paths, 'lv3')
                          setSectionLang(prev=>({...prev, lv3:'fa'}))
                        }}
                        disabled={!!translating.lv3}
                        aria-label="Persisch anzeigen"
                      >
                        {translating.lv3 ? (<i className="fa-solid fa-spinner fa-spin"/>) : (<i className="fa-solid fa-language"/>)} Persisch
                      </button>
                    </div>
                    <div className="hidden">
                      <Button
                      variant="default"
                      size="sm"
                      className="px-3 py-1.5 text-sm font-medium bg-primary text-white hover:opacity-90 disabled:opacity-60"
                      onClick={async () => {
                        const paths = [
                          ...exam.leseverstehen_teil3.situations.map((_, idx) => `leseverstehen_teil3.situations[${idx}]`),
                          ...exam.leseverstehen_teil3.ads.map((_, idx) => `leseverstehen_teil3.ads[${idx}]`)
                        ]
                        await translatePathsInChunks(paths, 'lv3')
                      }}
                      disabled={!!translating.lv3}
                    >
                      {translating.lv3 ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin"/>
                          {`Wird geladen… ${translateProgress.lv3||0}%`}
                        </span>
                      ) : 'Persisch anzeigen'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const paths = [
                            ...exam.leseverstehen_teil3.situations.map((_, idx) => `leseverstehen_teil3.situations[${idx}]`),
                            ...exam.leseverstehen_teil3.ads.map((_, idx) => `leseverstehen_teil3.ads[${idx}]`)
                          ]
                          restorePathsToOriginal(paths)
                        }}
                        disabled={!!translating.lv3}
                      >Deutsch anzeigen</Button>
                    </div>
                  </div>
                  <div className="muted-callout hv-hint mt-3">
                    <p className="text-sm leading-relaxed german-text"><strong>Anweisung:</strong> Lesen Sie die Situationen 11–20 und die Anzeigen a–l. Finden Sie für jede Situation die passende Anzeige. Sie können jede Anzeige nur einmal verwenden. Die Anzeige aus dem Beispiel können Sie nicht mehr verwenden. Für eine Situation gibt es keine passende Anzeige. In diesem Fall schreiben Sie x. Tragen Sie Ihre Lösungen in den Antwortbogen bei den Aufgaben 11–20 ein.</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3" style={{color: 'var(--primary-color)'}}>Situationen (11-20):</h4>
                      <div className="space-y-3">
                        {exam.leseverstehen_teil3.situations.map((situation, index) => (
                          <div key={index} className="p-3 border rounded" style={{backgroundColor: 'var(--card)', color: 'var(--text-color)'}}>
                            <h5 className="font-medium" style={{color: 'var(--primary-color)'}}>{index + 11}. <span className="german-text">{situation}</span></h5>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3" style={{color: 'var(--primary-color)'}}>Anzeigen (a-l):</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {exam.leseverstehen_teil3.ads.map((ad, index) => (
                          <div key={index} className="p-3 border rounded" style={{backgroundColor: 'var(--card)', color: 'var(--text-color)'}}>
                            <span className="font-medium" style={{color: 'var(--primary-color)'}}>{String.fromCharCode(97 + index)})</span>
                            <p className="text-sm mt-1 german-text">{ad}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Sprachbausteine */}
        <TabsContent value="sprachbausteine" className="space-y-6">
          <Tabs defaultValue="teil1" className="w-full">
            <TabsList className="tabs-pill-list w-full flex items-center gap-2 justify-start">
              <TabsTrigger value="teil1" className="tab-trigger tab-sub">Teil 1 (21-30)</TabsTrigger>
              <TabsTrigger value="teil2" className="tab-trigger tab-sub">Teil 2 (31-40)</TabsTrigger>
            </TabsList>

            <TabsContent value="teil1" className="space-y-4">
              <Card style={{backgroundColor: 'var(--secondary-color)'}}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                  <CardTitle className="test-title">Sprachbausteine Teil 1 – Grammatik</CardTitle>
                    <div className="lang-toggle">
                      <button
                        className={`lang-btn ${sectionLang.sb1==='de' ? 'active' : ''}`}
                        onClick={() => {
                          const paths = []
                          if (exam.sprachbausteine_teil1.text) paths.push('sprachbausteine_teil1.text')
                          if (Array.isArray(exam.sprachbausteine_teil1.options)) {
                            exam.sprachbausteine_teil1.options.forEach((opt, idx) => {
                              paths.push(`sprachbausteine_teil1.options[${idx}].a`)
                              paths.push(`sprachbausteine_teil1.options[${idx}].b`)
                              paths.push(`sprachbausteine_teil1.options[${idx}].c`)
                            })
                          }
                          restorePathsToOriginal(paths)
                          setSectionLang(prev=>({...prev, sb1:'de'}))
                        }}
                        disabled={!!translating.sb1}
                        aria-label="Deutsch anzeigen"
                      >
                        <i className="fa-solid fa-globe"/> Deutsch
                      </button>
                      <button
                        className={`lang-btn ${sectionLang.sb1==='fa' ? 'active' : ''}`}
                        onClick={async () => {
                          const paths = []
                          if (exam.sprachbausteine_teil1.text) paths.push('sprachbausteine_teil1.text')
                          if (Array.isArray(exam.sprachbausteine_teil1.options)) {
                            exam.sprachbausteine_teil1.options.forEach((opt, idx) => {
                              paths.push(`sprachbausteine_teil1.options[${idx}].a`)
                              paths.push(`sprachbausteine_teil1.options[${idx}].b`)
                              paths.push(`sprachbausteine_teil1.options[${idx}].c`)
                            })
                          }
                          await translatePathsInChunks(paths, 'sb1')
                          setSectionLang(prev=>({...prev, sb1:'fa'}))
                        }}
                        disabled={!!translating.sb1}
                        aria-label="Persisch anzeigen"
                      >
                        {translating.sb1 ? (<i className="fa-solid fa-spinner fa-spin"/>) : (<i className="fa-solid fa-language"/>)} Persisch
                      </button>
                    </div>
                    <div className="hidden">
                      <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const paths = []
                        if (exam.sprachbausteine_teil1.text) paths.push('sprachbausteine_teil1.text')
                        if (Array.isArray(exam.sprachbausteine_teil1.options)) {
                          exam.sprachbausteine_teil1.options.forEach((opt, idx) => {
                            paths.push(`sprachbausteine_teil1.options[${idx}].a`)
                            paths.push(`sprachbausteine_teil1.options[${idx}].b`)
                            paths.push(`sprachbausteine_teil1.options[${idx}].c`)
                          })
                        }
                        await translatePathsInChunks(paths, 'sb1')
                      }}
                      disabled={!!translating.sb1}
                    >
                      {translating.sb1 ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin"/>
                          {`Wird geladen… ${translateProgress.sb1||0}%`}
                        </span>
                      ) : 'Persisch anzeigen'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const paths = []
                          if (exam.sprachbausteine_teil1.text) paths.push('sprachbausteine_teil1.text')
                          if (Array.isArray(exam.sprachbausteine_teil1.options)) {
                            exam.sprachbausteine_teil1.options.forEach((opt, idx) => {
                              paths.push(`sprachbausteine_teil1.options[${idx}].a`)
                              paths.push(`sprachbausteine_teil1.options[${idx}].b`)
                              paths.push(`sprachbausteine_teil1.options[${idx}].c`)
                            })
                          }
                          restorePathsToOriginal(paths)
                        }}
                        disabled={!!translating.sb1}
                      >Deutsch anzeigen</Button>
                    </div>
                  </div>
                   <div className="muted-callout hv-hint mt-3">
                    <p className="text-sm leading-relaxed german-text"><strong>Anweisung:</strong> Lesen Sie den folgenden Text und entscheiden Sie, welche Wörter (a, b oder c) in die Lücken 21–30 gehören. Tragen Sie Ihre Lösungen in den Antwortbogen bei den Aufgaben 21–30 ein.</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="block" style={{color: 'var(--text-color)'}}>
                      <h4>Text:</h4>
                      <p className="text-sm leading-relaxed whitespace-pre-line german-text">{exam.sprachbausteine_teil1.text}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                      <h4 className="section-title">Lücken (21-30):</h4>
                    {exam.sprachbausteine_teil1.options.map((option, index) => (
                       <div key={index} className="p-4 border rounded" style={{backgroundColor: 'var(--card)', color: 'var(--text-color)'}}>
                        <h5 className="font-medium mb-3" style={{color: 'var(--primary-color)'}}>{index + 21}.</h5>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium" style={{color: 'var(--primary-color)'}}>a)</span> <span className="german-text">{option.a}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium" style={{color: 'var(--primary-color)'}}>b)</span> <span className="german-text">{option.b}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium" style={{color: 'var(--primary-color)'}}>c)</span> <span className="german-text">{option.c}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teil2" className="space-y-4">
              <Card style={{backgroundColor: 'var(--secondary-color)'}}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                  <CardTitle className="test-title">Sprachbausteine Teil 2 – Wortschatz</CardTitle>
                    <div className="lang-toggle">
                      <button
                        className={`lang-btn ${sectionLang.sb2==='de' ? 'active' : ''}`}
                        onClick={() => {
                          const paths = []
                          if (exam.sprachbausteine_teil2.text) paths.push('sprachbausteine_teil2.text')
                          if (Array.isArray(exam.sprachbausteine_teil2.words)) {
                            exam.sprachbausteine_teil2.words.forEach((_, idx) => {
                              paths.push(`sprachbausteine_teil2.words[${idx}]`)
                            })
                          }
                          restorePathsToOriginal(paths)
                          setSectionLang(prev=>({...prev, sb2:'de'}))
                        }}
                        disabled={!!translating.sb2}
                        aria-label="Deutsch anzeigen"
                      >
                        <i className="fa-solid fa-globe"/> Deutsch
                      </button>
                      <button
                        className={`lang-btn ${sectionLang.sb2==='fa' ? 'active' : ''}`}
                        onClick={async () => {
                          const paths = []
                          if (exam.sprachbausteine_teil2.text) paths.push('sprachbausteine_teil2.text')
                          if (Array.isArray(exam.sprachbausteine_teil2.words)) {
                            exam.sprachbausteine_teil2.words.forEach((_, idx) => {
                              paths.push(`sprachbausteine_teil2.words[${idx}]`)
                            })
                          }
                          await translatePathsInChunks(paths, 'sb2')
                          setSectionLang(prev=>({...prev, sb2:'fa'}))
                        }}
                        disabled={!!translating.sb2}
                        aria-label="Persisch anzeigen"
                      >
                        {translating.sb2 ? (<i className="fa-solid fa-spinner fa-spin"/>) : (<i className="fa-solid fa-language"/>)} Persisch
                      </button>
                    </div>
                    <div className="hidden">
                      <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const paths = []
                        if (exam.sprachbausteine_teil2.text) paths.push('sprachbausteine_teil2.text')
                        if (Array.isArray(exam.sprachbausteine_teil2.words)) {
                          exam.sprachbausteine_teil2.words.forEach((_, idx) => {
                            paths.push(`sprachbausteine_teil2.words[${idx}]`)
                          })
                        }
                        await translatePathsInChunks(paths, 'sb2')
                      }}
                      disabled={!!translating.sb2}
                    >
                      {translating.sb2 ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin"/>
                          {`Wird geladen… ${translateProgress.sb2||0}%`}
                        </span>
                      ) : 'Persisch anzeigen'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const paths = []
                          if (exam.sprachbausteine_teil2.text) paths.push('sprachbausteine_teil2.text')
                          if (Array.isArray(exam.sprachbausteine_teil2.words)) {
                            exam.sprachbausteine_teil2.words.forEach((_, idx) => {
                              paths.push(`sprachbausteine_teil2.words[${idx}]`)
                            })
                          }
                          restorePathsToOriginal(paths)
                        }}
                        disabled={!!translating.sb2}
                      >Deutsch anzeigen</Button>
                    </div>
                  </div>
                   <div className="muted-callout hv-hint mt-3">
                    <p className="text-sm leading-relaxed german-text"><strong>Anweisung:</strong> Lesen Sie den folgenden Text und entscheiden Sie, welche Wörter aus dem Kasten (a–o) in die Lücken 31–40 gehören. Sie können jedes Wort im Kasten nur einmal verwenden. Nicht alle Wörter passen in den Text. Tragen Sie Ihre Lösungen in den Antwortbogen bei den Aufgaben 31–40 ein.</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="block" style={{color: 'var(--text-color)'}}>
                      <h4>Text:</h4>
                      <p className="text-sm leading-relaxed whitespace-pre-line german-text">{exam.sprachbausteine_teil2.text}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="section-title">Wörter (a-o):</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {exam.sprachbausteine_teil2.words.map((word, index) => (
                        <div key={index} className="p-2 border rounded" style={{backgroundColor: 'var(--card)', color: 'var(--text-color)'}}>
                          <span className="font-medium" style={{color: 'var(--primary-color)'}}>{String.fromCharCode(97 + index)})</span> <span className="german-text">{word}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3" style={{color: 'var(--primary-color)'}}>Lücken (31-40):</h4>
                    <div className="text-sm" style={{color: 'var(--text-color)'}}>
                      <span className="german-text">Verwenden Sie die Wörter a-o, um die Lücken 31-40 im Text zu füllen.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Hörverstehen */}
        <TabsContent value="hoerverstehen" className="space-y-6">
          <Tabs defaultValue="teil1" className="w-full">
            <TabsList className="tabs-pill-list w-full flex items-center gap-2 justify-start">
              <TabsTrigger value="teil1" className="tab-trigger">Teil 1 (41-45)</TabsTrigger>
              <TabsTrigger value="teil2" className="tab-trigger">Teil 2 (46-55)</TabsTrigger>
              <TabsTrigger value="teil3" className="tab-trigger">Teil 3 (56-60)</TabsTrigger>
            </TabsList>

            {["teil1", "teil2", "teil3"].map((teil) => {
              const instructions = {
                teil1: "Sie hören fünf kurze Texte. Sie hören jeden Text zweimal. Zu jedem Text lösen Sie zwei Aufgaben. Wählen Sie bei jeder Aufgabe die richtige Lösung. Lesen Sie jetzt die Aufgaben 41–50. Dafür haben Sie 60 Sekunden Zeit.",
                teil2: "Sie hören ein Gespräch. Sie hören das Gespräch einmal. Dazu lösen Sie fünf Aufgaben. Wählen Sie bei jeder Aufgabe: Sind die Aussagen Richtig oder Falsch? Lesen Sie jetzt die Aufgaben 51–55. Dafür haben Sie 60 Sekunden Zeit.",
                teil3: "Sie hören fünf kurze Texte. Sie hören jeden Text einmal. Zu jedem Text gibt es eine Aufgabe. Wählen Sie bei jeder Aufgabe die richtige Lösung a, b oder c. Lesen Sie jetzt die Aufgaben 56–60. Dafür haben Sie 30 Sekunden Zeit."
              }
              
              return (
              <TabsContent key={teil} value={teil} className="space-y-4">
                <Card className="hv-card" style={{backgroundColor: 'var(--secondary-color)'}}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between test-title">
                      <span>Hörverstehen {teil.charAt(0).toUpperCase() + teil.slice(1)}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                      <div className="lang-toggle">
                        <button
                        className={`lang-btn ${sectionLang[`hv_${teil}`]==='de' ? 'active' : ''}`}
                          onClick={() => {
                            const paths = exam.hoerverstehen[teil].statements.map((_, idx) => `hoerverstehen.${teil}.statements[${idx}]`)
                            restorePathsToOriginal(paths)
                            setSectionLang(prev=>({...prev, [`hv_${teil}`]:'de'}))
                          }}
                          disabled={!!translating[`hv_${teil}`]}
                          aria-label="Deutsch anzeigen"
                        >
                          <i className="fa-solid fa-globe"/> Deutsch
                        </button>
                        <button
                          className={`lang-btn ${sectionLang[`hv_${teil}`]==='fa' ? 'active' : ''}`}
                          onClick={async () => {
                            const paths = exam.hoerverstehen[teil].statements.map((_, idx) => `hoerverstehen.${teil}.statements[${idx}]`)
                            await translatePathsInChunks(paths, `hv_${teil}`)
                            setSectionLang(prev=>({...prev, [`hv_${teil}`]:'fa'}))
                          }}
                          disabled={!!translating[`hv_${teil}`]}
                          aria-label="Persisch anzeigen"
                        >
                          {translating[`hv_${teil}`] ? (<i className="fa-solid fa-spinner fa-spin"/>) : (<i className="fa-solid fa-language"/>)} Persisch
                        </button>
                      </div>
                      <div className="hidden">
                        <Button
                          variant="default"
                          size="sm"
                          className="px-3 py-1.5 text-sm font-medium bg-primary text-white hover:opacity-90 disabled:opacity-60"
                          onClick={async () => {
                            const paths = exam.hoerverstehen[teil].statements.map((_, idx) => `hoerverstehen.${teil}.statements[${idx}]`)
                            await translatePathsInChunks(paths, `hv_${teil}`)
                          }}
                          disabled={!!translating[`hv_${teil}`]}
                        >
                          {translating[`hv_${teil}`] ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin"/>
                              {`Wird geladen… ${translateProgress[`hv_${teil}`]||0}%`}
                            </span>
                          ) : 'Persisch anzeigen'}
                        </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const paths = exam.hoerverstehen[teil].statements.map((_, idx) => `hoerverstehen.${teil}.statements[${idx}]`)
                              restorePathsToOriginal(paths)
                            }}
                            disabled={!!translating[`hv_${teil}`]}
                          >Deutsch anzeigen</Button>
                      </div>
                        </div>
                      {exam.hoerverstehen[teil].audio_url && (
                        <button
                          onClick={() => playAudio(exam.hoerverstehen[teil].audio_url, teil)}
                          disabled={audioPlaying[teil]}
                          className="flex items-center gap-2 btn-primary"
                        >
                          <Play className="w-4 h-4" />
                      {audioPlaying[teil] ? 'Wiedergabe läuft...' : 'Audio abspielen'}
                        </button>
                      )}
                      </div>
                    </CardTitle>
                    <div className="muted-callout hv-hint mt-3">
                      <p className="text-sm leading-relaxed german-text"><strong>Anweisung:</strong> {instructions[teil]}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {exam.hoerverstehen[teil].statements.map((statement, index) => {
                        const questionNumber = teil === 'teil1' ? index + 41 : 
                                             teil === 'teil2' ? index + 46 : index + 56
                        return (
                          <div key={index} className="hv-item" style={{backgroundColor: 'var(--card)', color: 'var(--text-color)'}}>
                            <h5 className="hv-statement" style={{color: 'var(--primary-color)'}}>{questionNumber}. <span className="german-text">{statement}</span></h5>
                            <RadioGroup
                              value={answers.hoerverstehen[teil][index]?.toString()}
                              onValueChange={(value) => updateAnswer(`hoerverstehen_${teil}`, index, value === 'true')}
                              className="hv-options"
                            >
                              <div className="radio-pill">
                                <RadioGroupItem value="true" id={`hv-${teil}-${index}-true`} disabled={!hasStarted} />
                                <Label htmlFor={`hv-${teil}-${index}-true`}>Richtig</Label>
                              </div>
                              <div className="radio-pill">
                                <RadioGroupItem value="false" id={`hv-${teil}-${index}-false`} disabled={!hasStarted} />
                                <Label htmlFor={`hv-${teil}-${index}-false`}>Falsch</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              )
            })}
          </Tabs>
        </TabsContent>

        {/* Schriftlicher Ausdruck */}
        <TabsContent value="schriftlicher_ausdruck" className="space-y-6">
          <Card style={{backgroundColor: 'var(--secondary-color)'}}>
            <CardHeader>
              <CardTitle className="test-title flex items-center justify-between">
                <span>Schriftlicher Ausdruck</span>
                <div className="lang-toggle" role="tablist" aria-label="Sprache umschalten">
                  <button
                    className={`lang-btn ${sectionLang.sa==='de' ? 'active' : ''}`}
                    onClick={() => {
                      const paths = []
                      if (exam.schriftlicher_ausdruck?.task_a) paths.push('schriftlicher_ausdruck.task_a')
                      if (exam.schriftlicher_ausdruck?.task_b) paths.push('schriftlicher_ausdruck.task_b')
                      restorePathsToOriginal(paths)
                      setSectionLang(prev=>({...prev, sa:'de'}))
                    }}
                    disabled={!!translating.sa}
                    aria-label="Deutsch anzeigen"
                  >
                    <i className="fa-solid fa-globe"/> Deutsch
                  </button>
                  <button
                    className={`lang-btn ${sectionLang.sa==='fa' ? 'active' : ''}`}
                    onClick={async () => {
                      const paths = []
                      if (exam.schriftlicher_ausdruck?.task_a) paths.push('schriftlicher_ausdruck.task_a')
                      if (exam.schriftlicher_ausdruck?.task_b) paths.push('schriftlicher_ausdruck.task_b')
                      await translatePathsInChunks(paths, 'sa')
                      setSectionLang(prev=>({...prev, sa:'fa'}))
                    }}
                    disabled={!!translating.sa}
                    aria-label="Persisch anzeigen"
                  >
                    {translating.sa ? (<i className="fa-solid fa-spinner fa-spin"/>) : (<i className="fa-solid fa-language"/>)} Persisch
                  </button>
                </div>
              </CardTitle>
              <div className="muted-callout hv-hint mt-3">
                <p className="text-sm leading-relaxed german-text"><strong>Anweisung:</strong> Wählen Sie Aufgabe A oder Aufgabe B. Zeigen Sie, was Sie können. Schreiben Sie möglichst viel zu allen Punkten. Vergessen Sie nicht Anrede und Gruß. Sie haben 30 Minuten Zeit.</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                   <Label className="section-title" style={{color: 'var(--primary-color)'}}>Aufgabe wählen:</Label>
                  <RadioGroup
                    value={answers.schriftlicher_ausdruck.selected_task}
                    onValueChange={(value) => updateAnswer("schriftlicher_ausdruck", "selected_task", value)}
                    className="mt-2"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="A" id="task-a" className="mt-1" />
                        <div className="flex-1">
                           <Label htmlFor="task-a" className="subsection-title" style={{color: 'var(--primary-color)'}}>Aufgabe A:</Label>
                          <div className="mt-2 block" style={{color: 'var(--text-color)'}}>
                            <p className="text-sm whitespace-pre-line german-text">{exam.schriftlicher_ausdruck.task_a}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="B" id="task-b" className="mt-1" />
                        <div className="flex-1">
                           <Label htmlFor="task-b" className="subsection-title" style={{color: 'var(--primary-color)'}}>Aufgabe B:</Label>
                          <div className="mt-2 block" style={{color: 'var(--text-color)'}}>
                            <p className="text-sm whitespace-pre-line german-text">{exam.schriftlicher_ausdruck.task_b}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {answers.schriftlicher_ausdruck.selected_task && (
                  <div>
                    <Label htmlFor="essay" style={{color: 'var(--primary-color)'}}>Ihr Text (mindestens 150 Wörter):</Label>
                    <div className="mt-2 p-2 bg-white border rounded-lg shadow-sm">
                    <Textarea
                      id="essay"
                        ref={essayRef}
                      value={answers.schriftlicher_ausdruck.text}
                      onChange={(e) => updateAnswer("schriftlicher_ausdruck", "text", e.target.value)}
                      placeholder="Schreiben Sie Ihren Text hier..."
                        rows={20}
                        className="w-full"
                        style={{backgroundColor: 'var(--card)', color: 'var(--text-color)', minHeight: '40vh', fontSize: '1rem', lineHeight: 1.6}}
                      />
                    </div>
                    <div className="mt-2 text-sm" style={{color: 'var(--text-color)'}}>
                      Wortanzahl: {answers.schriftlicher_ausdruck.text.split(/\s+/).filter(word => word.length > 0).length}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Answer Map quick navigation */}
      <div className="fixed right-4 bottom-4 bg-white border rounded-lg shadow p-3 hidden md:block">
        <div className="text-xs font-semibold mb-2">Antwortübersicht</div>
        <div className="grid grid-cols-5 gap-1">
          {Array.from({length:60}, (_,i)=>i+1).map((num)=>{
            const answered = (() => {
              if (num<=5) return !!answers.leseverstehen_teil1?.[num-1]
              if (num<=10) return !!answers.leseverstehen_teil2?.[num-6]
              if (num<=20) return !!answers.leseverstehen_teil3?.[num-11]
              if (num<=30) return !!answers.sprachbausteine_teil1?.[num-21]
              if (num<=40) return !!answers.sprachbausteine_teil2?.[num-31]
              if (num<=45) return typeof answers.hoerverstehen?.teil1?.[num-41] === 'boolean'
              if (num<=55) return typeof answers.hoerverstehen?.teil2?.[num-46] === 'boolean'
              return typeof answers.hoerverstehen?.teil3?.[num-56] === 'boolean'
            })()
            return (
              <button
                key={num}
                className={`w-7 h-7 text-[10px] rounded ${answered? 'bg-green-600 text-white':'bg-gray-200 text-gray-700'}`}
                onClick={()=>{
                  if (num<=20) setCurrentSection('leseverstehen')
                  else if (num<=40) setCurrentSection('sprachbausteine')
                  else setCurrentSection('hoerverstehen')
                }}
                aria-label={`Frage ${num} öffnen`}
              >{num}</button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ExamInterface


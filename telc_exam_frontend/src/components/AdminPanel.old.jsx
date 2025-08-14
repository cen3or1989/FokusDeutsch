import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Save, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/lib/api'

const AdminPanel = () => {
  const [exams, setExams] = useState([])
  const [currentExam, setCurrentExam] = useState({
    title: '',
    leseverstehen_teil1: {
      titles: Array(10).fill(''),
      texts: Array(5).fill(''),
      answers: Array(5).fill('')
    },
    leseverstehen_teil2: {
      texts: Array(2).fill(''),
      questions: Array(5).fill({ question: '', options: ['', '', ''], correct: 0 }),
      answers: Array(5).fill(0)
    },
    leseverstehen_teil3: {
      situations: Array(10).fill(''),
      ads: Array(12).fill(''),
      answers: Array(10).fill('')
    },
    sprachbausteine_teil1: {
      text: '',
      options: Array(10).fill({ a: '', b: '', c: '' }),
      answers: Array(10).fill('')
    },
    sprachbausteine_teil2: {
      text: '',
      words: Array(15).fill(''),
      answers: Array(10).fill('')
    },
    hoerverstehen: {
      teil1: {
        audio_url: '',
        statements: Array(5).fill(''),
        answers: Array(5).fill(true)
      },
      teil2: {
        audio_url: '',
        statements: Array(10).fill(''),
        answers: Array(10).fill(true)
      },
      teil3: {
        audio_url: '',
        statements: Array(5).fill(''),
        answers: Array(5).fill(true)
      }
    },
    schriftlicher_ausdruck: {
      task_a: '',
      task_b: ''
    }
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exams`)
      const data = await response.json()
      setExams(data)
    } catch (error) {
      console.error('Failed to fetch exams:', error)
    }
  }

  const saveExam = async () => {
    try {
      const url = isEditing ? `${API_BASE_URL}/api/exams/${editingId}` : `${API_BASE_URL}/api/exams`
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentExam)
      })
      
      if (response.ok) {
        toast.success('Prüfung erfolgreich gespeichert')
        fetchExams()
        resetForm()
      } else {
        toast.error('Fehler beim Speichern der Prüfung')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Fehler beim Speichern der Prüfung')
    }
  }

  const editExam = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exams/${id}`)
      const data = await response.json()
      setCurrentExam(data)
      setIsEditing(true)
      setEditingId(id)
    } catch (error) {
      console.error('Failed to load exam:', error)
    }
  }

  const deleteExam = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exams/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchExams()
        toast.success('Prüfung wurde gelöscht')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Löschen fehlgeschlagen')
    }
  }

  const resetForm = () => {
    setCurrentExam({
      title: '',
      leseverstehen_teil1: {
        titles: Array(10).fill(''),
        texts: Array(5).fill(''),
        answers: Array(5).fill('')
      },
      leseverstehen_teil2: {
        texts: Array(2).fill(''),
        questions: Array(5).fill({ question: '', options: ['', '', ''], correct: 0 }),
        answers: Array(5).fill(0)
      },
      leseverstehen_teil3: {
        situations: Array(10).fill(''),
        ads: Array(12).fill(''),
        answers: Array(10).fill('')
      },
      sprachbausteine_teil1: {
        text: '',
        options: Array(10).fill({ a: '', b: '', c: '' }),
        answers: Array(10).fill('')
      },
      sprachbausteine_teil2: {
        text: '',
        words: Array(15).fill(''),
        answers: Array(10).fill('')
      },
      hoerverstehen: {
        teil1: {
          audio_url: '',
          statements: Array(5).fill(''),
          answers: Array(5).fill(true)
        },
        teil2: {
          audio_url: '',
          statements: Array(10).fill(''),
          answers: Array(10).fill(true)
        },
        teil3: {
          audio_url: '',
          statements: Array(5).fill(''),
          answers: Array(5).fill(true)
        }
      },
      schriftlicher_ausdruck: {
        task_a: '',
        task_b: ''
      }
    })
    setIsEditing(false)
    setEditingId(null)
  }

  const updateField = (section, field, index, value) => {
    setCurrentExam(prev => {
      const newExam = { ...prev }
      if (index !== undefined) {
        newExam[section][field][index] = value
      } else {
        newExam[section][field] = value
      }
      return newExam
    })
  }

  return (
    <div className="container mx-auto p-6" style={{direction: 'ltr', textAlign: 'left'}}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Adminbereich – telc B2 Prüfungen</h1>
        <Button onClick={resetForm} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Neue Prüfung
        </Button>
      </div>

      {/* Existing exams list */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Verfügbare Prüfungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {exams.map(exam => (
              <div key={exam.id} className="flex justify-between items-center p-4 border rounded">
                <div>
                  <h3 className="font-semibold">{exam.title}</h3>
                  <p className="text-sm text-gray-500">
                    Erstellt am: {new Date(exam.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => editExam(exam.id)}>
                    Bearbeiten
                  </Button>
                   <Dialog>
                     <DialogTrigger asChild>
                       <Button variant="destructive">
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </DialogTrigger>
                     <DialogContent>
                       <DialogHeader>
                         <DialogTitle>Löschen bestätigen</DialogTitle>
                         <DialogDescription>Diese Prüfung wird dauerhaft gelöscht. Möchten Sie fortfahren?</DialogDescription>
                       </DialogHeader>
                       <DialogFooter>
                         <Button variant="destructive" onClick={() => deleteExam(exam.id)}>Löschen</Button>
                       </DialogFooter>
                     </DialogContent>
                   </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit exam form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {isEditing ? 'Prüfung bearbeiten' : 'Neue Prüfung erstellen'}
            <Button onClick={saveExam} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Prüfung speichern
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="title">Prüfungstitel</Label>
            <Input
              id="title"
              value={currentExam.title}
              onChange={(e) => setCurrentExam(prev => ({ ...prev, title: e.target.value }))}
              placeholder="z. B.: Übungsprüfung Nr. 1"
            />
          </div>

          <Tabs defaultValue="lv1" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="lv1">LV Teil 1</TabsTrigger>
              <TabsTrigger value="lv2">LV Teil 2</TabsTrigger>
              <TabsTrigger value="lv3">LV Teil 3</TabsTrigger>
              <TabsTrigger value="sb1">SB Teil 1</TabsTrigger>
              <TabsTrigger value="sb2">SB Teil 2</TabsTrigger>
              <TabsTrigger value="hv">HV</TabsTrigger>
              <TabsTrigger value="sa">SA</TabsTrigger>
            </TabsList>

            {/* Leseverstehen Teil 1 */}
            <TabsContent value="lv1" className="space-y-4">
              <h3 className="text-lg font-semibold">Leseverstehen Teil 1 – Überschriften zuordnen</h3>
              
              <div>
                 <Label>Überschriften (a–j)</Label>
                {currentExam.leseverstehen_teil1.titles.map((title, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <span className="w-8 text-center">{String.fromCharCode(97 + index)})</span>
                    <Input
                      value={title}
                      onChange={(e) => updateField('leseverstehen_teil1', 'titles', index, e.target.value)}
                       placeholder={`Überschrift ${String.fromCharCode(97 + index)}`}
                    />
                  </div>
                ))}
              </div>

              <div>
                 <Label>Texte (1–5)</Label>
                {currentExam.leseverstehen_teil1.texts.map((text, index) => (
                  <div key={index} className="mb-4">
                       <Label>Text {index + 1}</Label>
                    <Textarea
                      value={text}
                      onChange={(e) => updateField('leseverstehen_teil1', 'texts', index, e.target.value)}
                      placeholder={`Text Nr. ${index + 1}`}
                      rows={3}
                    />
                    <div className="mt-2">
                       <Label>Richtige Antwort:</Label>
                      <Select
                        value={currentExam.leseverstehen_teil1.answers[index]}
                        onValueChange={(value) => updateField('leseverstehen_teil1', 'answers', index, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Überschrift wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i} value={String.fromCharCode(97 + i)}>
                              {String.fromCharCode(97 + i)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Leseverstehen Teil 2 */}
            <TabsContent value="lv2" className="space-y-4">
              <h3 className="text-lg font-semibold">Leseverstehen Teil 2 – Detailverständnis</h3>
              
              <div>
                 <Label>Haupttexte</Label>
                {currentExam.leseverstehen_teil2.texts.map((text, index) => (
                  <div key={index} className="mb-4">
                     <Label>Text {index + 1}</Label>
                    <Textarea
                      value={text}
                      onChange={(e) => updateField('leseverstehen_teil2', 'texts', index, e.target.value)}
                      placeholder={`Langer Text Nr. ${index + 1}`}
                      rows={5}
                    />
                  </div>
                ))}
              </div>

              <div>
                 <Label>Fragen (6–10)</Label>
                {currentExam.leseverstehen_teil2.questions.map((question, index) => (
                  <div key={index} className="mb-4 p-4 border rounded">
                     <Label>Frage {index + 6}</Label>
                    <Input
                      value={question.question}
                      onChange={(e) => {
                        const newQuestions = [...currentExam.leseverstehen_teil2.questions]
                        newQuestions[index] = { ...question, question: e.target.value }
                        setCurrentExam(prev => ({
                          ...prev,
                          leseverstehen_teil2: {
                            ...prev.leseverstehen_teil2,
                            questions: newQuestions
                          }
                        }))
                      }}
                           placeholder={`Fragetext ${index + 6}`}
                      className="mb-2"
                    />
                    
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2 mb-2">
                        <span className="w-8 text-center">{String.fromCharCode(97 + optIndex)})</span>
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newQuestions = [...currentExam.leseverstehen_teil2.questions]
                            newQuestions[index].options[optIndex] = e.target.value
                            setCurrentExam(prev => ({
                              ...prev,
                              leseverstehen_teil2: {
                                ...prev.leseverstehen_teil2,
                                questions: newQuestions
                              }
                            }))
                          }}
                           placeholder={`Option ${String.fromCharCode(97 + optIndex)}`}
                        />
                      </div>
                    ))}
                    
                    <div className="mt-2">
                      <Label>Richtige Antwort:</Label>
                      <Select
                        value={currentExam.leseverstehen_teil2.answers[index].toString()}
                        onValueChange={(value) => updateField('leseverstehen_teil2', 'answers', index, parseInt(value))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Option wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">a</SelectItem>
                          <SelectItem value="1">b</SelectItem>
                          <SelectItem value="2">c</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Leseverstehen Teil 3 */}
            <TabsContent value="lv3" className="space-y-4">
              <h3 className="text-lg font-semibold">Leseverstehen Teil 3 – Situationen zuordnen</h3>
              
              <div>
                 <Label>Situationen (11–20)</Label>
                {currentExam.leseverstehen_teil3.situations.map((situation, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-center">{index + 11}.</span>
                       <Input
                        value={situation}
                        onChange={(e) => updateField('leseverstehen_teil3', 'situations', index, e.target.value)}
                         placeholder={`Situation ${index + 11}`}
                      />
                    </div>
                    <div className="mt-2 mr-10">
                       <Label>Richtige Antwort:</Label>
                      <Select
                        value={currentExam.leseverstehen_teil3.answers[index]}
                        onValueChange={(value) => updateField('leseverstehen_teil3', 'answers', index, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Anzeige wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i} value={String.fromCharCode(97 + i)}>
                              {String.fromCharCode(97 + i)}
                            </SelectItem>
                          ))}
                          <SelectItem value="x">x (keine)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                 <Label>Anzeigen (a–l)</Label>
                {currentExam.leseverstehen_teil3.ads.map((ad, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <span className="w-8 text-center">{String.fromCharCode(97 + index)})</span>
                       <Textarea
                      value={ad}
                      onChange={(e) => updateField('leseverstehen_teil3', 'ads', index, e.target.value)}
                         placeholder={`Anzeige ${String.fromCharCode(97 + index)}`}
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Sprachbausteine Teil 1 */}
            <TabsContent value="sb1" className="space-y-4">
              <h3 className="text-lg font-semibold">Sprachbausteine Teil 1 – Grammatik</h3>
              
              <div>
                 <Label htmlFor="sb1_text">Haupttext (verwenden Sie (21) bis (30), um Lücken zu markieren)</Label>
                <Textarea
                  id="sb1_text"
                  value={currentExam.sprachbausteine_teil1.text}
                  onChange={(e) => updateField('sprachbausteine_teil1', 'text', undefined, e.target.value)}
                  placeholder="Text mit Lücken (21) … (30) eingeben"
                  rows={8}
                />
              </div>

              <div>
                 <Label>Antwortoptionen (21–30)</Label>
                {currentExam.sprachbausteine_teil1.options.map((option, index) => (
                  <div key={index} className="mb-4 p-4 border rounded">
                     <Label>Frage {index + 21}</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div>
                         <Label>Option a</Label>
                        <Input
                          value={option.a}
                          onChange={(e) => {
                            const newOptions = [...currentExam.sprachbausteine_teil1.options]
                            newOptions[index] = { ...option, a: e.target.value }
                            setCurrentExam(prev => ({
                              ...prev,
                              sprachbausteine_teil1: {
                                ...prev.sprachbausteine_teil1,
                                options: newOptions
                              }
                            }))
                          }}
                          placeholder="Option a"
                        />
                      </div>
                      <div>
                         <Label>Option b</Label>
                        <Input
                          value={option.b}
                          onChange={(e) => {
                            const newOptions = [...currentExam.sprachbausteine_teil1.options]
                            newOptions[index] = { ...option, b: e.target.value }
                            setCurrentExam(prev => ({
                              ...prev,
                              sprachbausteine_teil1: {
                                ...prev.sprachbausteine_teil1,
                                options: newOptions
                              }
                            }))
                          }}
                          placeholder="Option b"
                        />
                      </div>
                      <div>
                         <Label>Option c</Label>
                        <Input
                          value={option.c}
                          onChange={(e) => {
                            const newOptions = [...currentExam.sprachbausteine_teil1.options]
                            newOptions[index] = { ...option, c: e.target.value }
                            setCurrentExam(prev => ({
                              ...prev,
                              sprachbausteine_teil1: {
                                ...prev.sprachbausteine_teil1,
                                options: newOptions
                              }
                            }))
                          }}
                          placeholder="Option c"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                       <Label>Richtige Antwort:</Label>
                      <Select
                        value={currentExam.sprachbausteine_teil1.answers[index]}
                        onValueChange={(value) => updateField('sprachbausteine_teil1', 'answers', index, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Option wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a">a</SelectItem>
                          <SelectItem value="b">b</SelectItem>
                          <SelectItem value="c">c</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Sprachbausteine Teil 2 */}
            <TabsContent value="sb2" className="space-y-4">
              <h3 className="text-lg font-semibold">Sprachbausteine Teil 2 – Wortschatz</h3>
              
              <div>
                 <Label htmlFor="sb2_text">Haupttext (verwenden Sie (31) bis (40), um Lücken zu markieren)</Label>
                <Textarea
                  id="sb2_text"
                  value={currentExam.sprachbausteine_teil2.text}
                  onChange={(e) => updateField('sprachbausteine_teil2', 'text', undefined, e.target.value)}
                  placeholder="Text mit Lücken (31) … (40) eingeben"
                  rows={8}
                />
              </div>

              <div>
                 <Label>Wortliste (a–o)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {currentExam.sprachbausteine_teil2.words.map((word, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-8 text-center">{String.fromCharCode(97 + index)})</span>
                         <Input
                        value={word}
                        onChange={(e) => updateField('sprachbausteine_teil2', 'words', index, e.target.value)}
                           placeholder={`Wort ${String.fromCharCode(97 + index)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                 <Label>Richtige Antworten (31–40)</Label>
                <div className="grid grid-cols-5 gap-2">
                  {currentExam.sprachbausteine_teil2.answers.map((answer, index) => (
                    <div key={index}>
                       <Label>Frage {index + 31}</Label>
                      <Select
                        value={answer}
                        onValueChange={(value) => updateField('sprachbausteine_teil2', 'answers', index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wort wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 15 }, (_, i) => (
                            <SelectItem key={i} value={String.fromCharCode(97 + i)}>
                              {String.fromCharCode(97 + i)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Hörverstehen */}
            <TabsContent value="hv" className="space-y-4">
              <h3 className="text-lg font-semibold">Hörverstehen</h3>
              
              <Tabs defaultValue="hv1" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="hv1">Teil 1 (41-45)</TabsTrigger>
                  <TabsTrigger value="hv2">Teil 2 (46-55)</TabsTrigger>
                  <TabsTrigger value="hv3">Teil 3 (56-60)</TabsTrigger>
                </TabsList>

                <TabsContent value="hv1" className="space-y-4">
                  <div>
                     <Label htmlFor="hv1_audio">Audio-Datei Teil 1</Label>
                    <Input
                      id="hv1_audio"
                      type="url"
                      value={currentExam.hoerverstehen.teil1.audio_url}
                      onChange={(e) => {
                        setCurrentExam(prev => ({
                          ...prev,
                          hoerverstehen: {
                            ...prev.hoerverstehen,
                            teil1: {
                              ...prev.hoerverstehen.teil1,
                              audio_url: e.target.value
                            }
                          }
                        }))
                      }}
                      placeholder="Audio-URL"
                    />
                  </div>

                  <div>
                     <Label>Aussagen (41–45)</Label>
                    {currentExam.hoerverstehen.teil1.statements.map((statement, index) => (
                      <div key={index} className="mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-center">{index + 41}.</span>
                          <Input
                            value={statement}
                            onChange={(e) => {
                              const newStatements = [...currentExam.hoerverstehen.teil1.statements]
                              newStatements[index] = e.target.value
                              setCurrentExam(prev => ({
                                ...prev,
                                hoerverstehen: {
                                  ...prev.hoerverstehen,
                                  teil1: {
                                    ...prev.hoerverstehen.teil1,
                                    statements: newStatements
                                  }
                                }
                              }))
                            }}
                            placeholder={`Aussage ${index + 41}`}
                          />
                        </div>
                        <div className="mt-2 mr-10">
                           <Label>Richtige Antwort:</Label>
                          <Select
                            value={currentExam.hoerverstehen.teil1.answers[index] ? 'true' : 'false'}
                            onValueChange={(value) => {
                              const newAnswers = [...currentExam.hoerverstehen.teil1.answers]
                              newAnswers[index] = value === 'true'
                              setCurrentExam(prev => ({
                                ...prev,
                                hoerverstehen: {
                                  ...prev.hoerverstehen,
                                  teil1: {
                                    ...prev.hoerverstehen.teil1,
                                    answers: newAnswers
                                  }
                                }
                              }))
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Antwort wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Richtig (+)</SelectItem>
                              <SelectItem value="false">Falsch (-)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="hv2" className="space-y-4">
                  <div>
                     <Label htmlFor="hv2_audio">Audio-Datei Teil 2</Label>
                    <Input
                      id="hv2_audio"
                      type="url"
                      value={currentExam.hoerverstehen.teil2.audio_url}
                      onChange={(e) => {
                        setCurrentExam(prev => ({
                          ...prev,
                          hoerverstehen: {
                            ...prev.hoerverstehen,
                            teil2: {
                              ...prev.hoerverstehen.teil2,
                              audio_url: e.target.value
                            }
                          }
                        }))
                      }}
                      placeholder="Audio-URL"
                    />
                  </div>

                  <div>
                     <Label>Aussagen (46–55)</Label>
                    {currentExam.hoerverstehen.teil2.statements.map((statement, index) => (
                      <div key={index} className="mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-center">{index + 46}.</span>
                          <Input
                            value={statement}
                            onChange={(e) => {
                              const newStatements = [...currentExam.hoerverstehen.teil2.statements]
                              newStatements[index] = e.target.value
                              setCurrentExam(prev => ({
                                ...prev,
                                hoerverstehen: {
                                  ...prev.hoerverstehen,
                                  teil2: {
                                    ...prev.hoerverstehen.teil2,
                                    statements: newStatements
                                  }
                                }
                              }))
                            }}
                            placeholder={`Aussage ${index + 46}`}
                          />
                        </div>
                        <div className="mt-2 mr-10">
                           <Label>Richtige Antwort:</Label>
                          <Select
                            value={currentExam.hoerverstehen.teil2.answers[index] ? 'true' : 'false'}
                            onValueChange={(value) => {
                              const newAnswers = [...currentExam.hoerverstehen.teil2.answers]
                              newAnswers[index] = value === 'true'
                              setCurrentExam(prev => ({
                                ...prev,
                                hoerverstehen: {
                                  ...prev.hoerverstehen,
                                  teil2: {
                                    ...prev.hoerverstehen.teil2,
                                    answers: newAnswers
                                  }
                                }
                              }))
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Antwort wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Richtig (+)</SelectItem>
                              <SelectItem value="false">Falsch (-)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="hv3" className="space-y-4">
                  <div>
                     <Label htmlFor="hv3_audio">Audio-Datei Teil 3</Label>
                    <Input
                      id="hv3_audio"
                      type="url"
                      value={currentExam.hoerverstehen.teil3.audio_url}
                      onChange={(e) => {
                        setCurrentExam(prev => ({
                          ...prev,
                          hoerverstehen: {
                            ...prev.hoerverstehen,
                            teil3: {
                              ...prev.hoerverstehen.teil3,
                              audio_url: e.target.value
                            }
                          }
                        }))
                      }}
                      placeholder="Audio-URL"
                    />
                  </div>

                  <div>
                     <Label>Aussagen (56–60)</Label>
                    {currentExam.hoerverstehen.teil3.statements.map((statement, index) => (
                      <div key={index} className="mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-center">{index + 56}.</span>
                          <Input
                            value={statement}
                            onChange={(e) => {
                              const newStatements = [...currentExam.hoerverstehen.teil3.statements]
                              newStatements[index] = e.target.value
                              setCurrentExam(prev => ({
                                ...prev,
                                hoerverstehen: {
                                  ...prev.hoerverstehen,
                                  teil3: {
                                    ...prev.hoerverstehen.teil3,
                                    statements: newStatements
                                  }
                                }
                              }))
                            }}
                            placeholder={`Aussage ${index + 56}`}
                          />
                        </div>
                        <div className="mt-2 mr-10">
                           <Label>Richtige Antwort:</Label>
                          <Select
                            value={currentExam.hoerverstehen.teil3.answers[index] ? 'true' : 'false'}
                            onValueChange={(value) => {
                              const newAnswers = [...currentExam.hoerverstehen.teil3.answers]
                              newAnswers[index] = value === 'true'
                              setCurrentExam(prev => ({
                                ...prev,
                                hoerverstehen: {
                                  ...prev.hoerverstehen,
                                  teil3: {
                                    ...prev.hoerverstehen.teil3,
                                    answers: newAnswers
                                  }
                                }
                              }))
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Antwort wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Richtig (+)</SelectItem>
                              <SelectItem value="false">Falsch (-)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
            
            {/* Schriftlicher Ausdruck */}
            <TabsContent value="sa" className="space-y-4">
              <h3 className="text-lg font-semibold">Schriftlicher Ausdruck</h3>
              
              <div>
                 <Label htmlFor="task_a">Aufgabe A</Label>
                <Textarea
                  id="task_a"
                  value={currentExam.schriftlicher_ausdruck.task_a}
                  onChange={(e) => updateField('schriftlicher_ausdruck', 'task_a', undefined, e.target.value)}
                   placeholder="Aufgabenbeschreibung A (Informationsanfrage)"
                  rows={5}
                />
              </div>

              <div>
                 <Label htmlFor="task_b">Aufgabe B</Label>
                <Textarea
                  id="task_b"
                  value={currentExam.schriftlicher_ausdruck.task_b}
                  onChange={(e) => updateField('schriftlicher_ausdruck', 'task_b', undefined, e.target.value)}
                   placeholder="Aufgabenbeschreibung B (Beschwerde)"
                  rows={5}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminPanel


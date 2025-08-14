import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, Save, Trash2, Edit3, Eye, Users, FileText, BarChart3, 
  Settings, Shield, Key, Download, Upload, AlertTriangle,
  CheckCircle, XCircle, Clock, Activity
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/lib/api'

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState({
    totalExams: 0,
    totalResults: 0,
    avgScore: 0,
    todayResults: 0
  })
  const [exams, setExams] = useState([])
  const [examResults, setExamResults] = useState([])
  const [currentExam, setCurrentExam] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      setAdminToken(token)
      setIsAuthenticated(true)
      fetchDashboardData()
    }
  }, [])

  // Auto-load first exam when entering editor if none selected
  useEffect(() => {
    if (activeTab === 'exam-editor' && !currentExam && exams && exams.length > 0) {
      editExam(exams[0].id)
    }
  }, [activeTab, currentExam, exams])

  const authenticate = async () => {
    try {
      setLoading(true)
      // Test auth with a simple GET request
      const response = await fetch(`${API_BASE_URL}/api/exams`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      
      if (response.ok) {
        setIsAuthenticated(true)
        localStorage.setItem('admin_token', adminToken)
        fetchDashboardData()
        toast.success('Erfolgreich angemeldet')
      } else {
        toast.error('Ungültiger Admin-Token')
      }
    } catch (error) {
      toast.error('Verbindungsfehler')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setAdminToken('')
    localStorage.removeItem('admin_token')
    toast.success('Abgemeldet')
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchExams(),
        fetchExamResults(),
        fetchStats()
      ])
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exams`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      const data = await response.json()
      setExams(data)
    } catch (error) {
      console.error('Failed to fetch exams:', error)
    }
  }

  const fetchExamResults = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exam-results`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setExamResults(data)
      }
    } catch (error) {
      console.error('Failed to fetch exam results:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setDashboardStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const createNewExam = () => {
    setCurrentExam({
      title: '',
      // Leseverstehen fields (matching database schema)
      lv1_titles: ["Titel a", "Titel b", "Titel c", "Titel d", "Titel e", "Titel f", "Titel g", "Titel h", "Titel i", "Titel j"],
      lv1_texts: ["Text 1", "Text 2", "Text 3", "Text 4", "Text 5"],
      lv1_answers: [0, 1, 2, 3, 4],
      lv2_questions: [
        {
          text: "Text für Frage 6",
          question: "Frage 6",
          options: ["Option a", "Option b", "Option c"],
          answer: 0
        }
      ],
      lv3_situations: [
        {
          situation: "Situation 11",
          ads: ["Anzeige a", "Anzeige b", "Anzeige c"],
          answer: "a"
        }
      ],
      // Sprachbausteine fields
      sb1_text: "Text mit [LÜCKE_1], [LÜCKE_2] usw.",
      sb1_words: ["Wort a", "Wort b", "Wort c", "Wort d", "Wort e", "Wort f", "Wort g", "Wort h", "Wort i", "Wort j", "Wort k", "Wort l", "Wort m", "Wort n", "Wort o"],
      sb1_answers: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
      sb2_text: "Text mit [LÜCKE_1], [LÜCKE_2] usw.",
      sb2_options: [
        ["Option 1a", "Option 1b", "Option 1c"],
        ["Option 2a", "Option 2b", "Option 2c"]
      ],
      sb2_answers: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0],
      // Hörverstehen fields
      hoerverstehen: {
        teil1: {
          audio_url: '',
          statements: ["Aussage 41", "Aussage 42", "Aussage 43", "Aussage 44", "Aussage 45"],
          answers: [true, false, true, false, true]
        },
        teil2: {
          audio_url: '',
          statements: ["Aussage 46", "Aussage 47", "Aussage 48", "Aussage 49", "Aussage 50", "Aussage 51", "Aussage 52", "Aussage 53", "Aussage 54", "Aussage 55"],
          answers: [true, false, true, false, true, false, true, false, true, false]
        },
        teil3: {
          audio_url: '',
          statements: ["Aussage 56", "Aussage 57", "Aussage 58", "Aussage 59", "Aussage 60"],
          answers: [true, false, true, false, true]
        }
      },
      // Schriftlicher Ausdruck fields
      schriftlicher_ausdruck: {
        task_a: 'Aufgabe A: Beschreiben Sie...',
        task_b: 'Aufgabe B: Erörtern Sie...'
      }
    })
    setIsEditing(false)
    setEditingId(null)
    setActiveTab('exam-editor')
  }

  const editExam = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exams/${id}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      const data = await response.json()
      setCurrentExam(data)
      setIsEditing(true)
      setEditingId(id)
      setActiveTab('exam-editor')
    } catch (error) {
      console.error('Failed to load exam:', error)
      toast.error('Fehler beim Laden der Prüfung')
    }
  }

  const saveExam = async () => {
    try {
      setLoading(true)
      const url = isEditing ? `${API_BASE_URL}/api/exams/${editingId}` : `${API_BASE_URL}/api/exams`
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(currentExam)
      })
      
      if (response.ok) {
        toast.success('Prüfung erfolgreich gespeichert')
        fetchExams()
        setActiveTab('exams')
        setCurrentExam(null)
      } else {
        toast.error('Fehler beim Speichern der Prüfung')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Fehler beim Speichern der Prüfung')
    } finally {
      setLoading(false)
    }
  }

  const deleteExam = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exams/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      if (response.ok) {
        fetchExams()
        toast.success('Prüfung wurde gelöscht')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Löschen fehlgeschlagen')
    }
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <p className="text-gray-600 dark:text-gray-400">telc B2 Prüfungsverwaltung</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="token">Admin Token</Label>
              <Input
                id="token"
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="Admin-Token eingeben"
                onKeyPress={(e) => e.key === 'Enter' && authenticate()}
              />
            </div>
            <Button 
              onClick={authenticate} 
              disabled={!adminToken.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Key className="w-4 h-4 mr-2" />
              )}
              Anmelden
            </Button>
            <div className="text-xs text-gray-500 text-center">
              Nur für autorisierte Administratoren
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main Admin Panel
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  telc B2 Admin Panel
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Prüfungsverwaltung & Auswertung
                </p>
              </div>
            </div>
            <Button onClick={logout} variant="outline" size="sm">
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Prüfungen
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Ergebnisse
            </TabsTrigger>
            <TabsTrigger value="exam-editor" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Einstellungen
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Prüfungen gesamt</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {dashboardStats.totalExams}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ergebnisse gesamt</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {dashboardStats.totalResults}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Durchschnitt</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {dashboardStats.avgScore}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Heute</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {dashboardStats.todayResults}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Schnellaktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={createNewExam} className="h-20 flex flex-col gap-2">
                    <Plus className="w-6 h-6" />
                    Neue Prüfung erstellen
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Download className="w-6 h-6" />
                    Ergebnisse exportieren
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Upload className="w-6 h-6" />
                    Prüfung importieren
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Prüfungsverwaltung</h2>
              <Button onClick={createNewExam}>
                <Plus className="w-4 h-4 mr-2" />
                Neue Prüfung
              </Button>
            </div>

            <div className="grid gap-4">
              {exams.map(exam => (
                <Card key={exam.id} className="cursor-pointer" onClick={() => editExam(exam.id)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {exam.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(exam.created_at).toLocaleDateString('de-DE')}
                          </span>
                          <Badge variant="secondary">
                            ID: {exam.id}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" onClick={() => editExam(exam.id)}>
                          <Edit3 className="w-4 h-4 mr-1" />
                          Bearbeiten
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Prüfung löschen</DialogTitle>
                              <DialogDescription>
                                Diese Aktion kann nicht rückgängig gemacht werden. Die Prüfung "{exam.title}" wird dauerhaft gelöscht.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="destructive" onClick={() => deleteExam(exam.id)}>
                                Endgültig löschen
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Prüfungsergebnisse</h2>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Prüfung
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Ergebnis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Datum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {examResults.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {result.student_name || 'Unbekannt'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {result.exam_title || `Prüfung ${result.exam_id}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {result.total_score}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {new Date(result.submitted_at).toLocaleDateString('de-DE')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={result.total_score >= 60 ? 'success' : 'destructive'}>
                              {result.total_score >= 60 ? (
                                <><CheckCircle className="w-3 h-3 mr-1" /> Bestanden</>
                              ) : (
                                <><XCircle className="w-3 h-3 mr-1" /> Nicht bestanden</>
                              )}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exam Editor Tab */}
          <TabsContent value="exam-editor" className="space-y-6">
            {currentExam ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center gap-3 flex-wrap">
                    <CardTitle>
                      {isEditing ? 'Prüfung bearbeiten' : 'Neue Prüfung erstellen'}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Select value={editingId ? String(editingId) : ''} onValueChange={(val) => editExam(Number(val))}>
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Prüfung wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {exams.map(ex => (
                            <SelectItem key={ex.id} value={String(ex.id)}>
                              {ex.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" onClick={createNewExam}>
                        <Plus className="w-4 h-4 mr-1" /> Neu
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab('exams')}>
                        Abbrechen
                      </Button>
                      <Button onClick={saveExam} disabled={loading}>
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Speichern
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Label htmlFor="title">Prüfungstitel</Label>
                    <Input
                      id="title"
                      value={currentExam.title}
                      onChange={(e) => setCurrentExam(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="z. B.: Übungsprüfung Nr. 1"
                      className="mt-1"
                    />
                  </div>
                  {/* Helper Info */}
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      💡 JSON-Editor Hilfe
                    </h4>
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      Bearbeiten Sie die Daten im JSON-Format. Achten Sie auf korrekte Syntax: Anführungszeichen um Strings, eckige Klammern für Arrays, geschweifte Klammern für Objekte.
                    </p>
                  </div>

                  {/* Exam Sections Editor */}
                  <Tabs defaultValue="leseverstehen" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="leseverstehen">Leseverstehen</TabsTrigger>
                      <TabsTrigger value="sprachbausteine">Sprachbausteine</TabsTrigger>
                      <TabsTrigger value="hoerverstehen">Hörverstehen</TabsTrigger>
                      <TabsTrigger value="schriftlicher">Schriftlicher Ausdruck</TabsTrigger>
                    </TabsList>

                    {/* Leseverstehen Editor */}
                    <TabsContent value="leseverstehen" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Leseverstehen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Teil 1 */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold">Teil 1 - Überschriften zuordnen</h4>
                            
                            {/* Titles */}
                            <div className="space-y-2">
                              <Label>Überschriften (a-j)</Label>
                              <Textarea
                                value={currentExam.lv1_titles ? JSON.stringify(currentExam.lv1_titles, null, 2) : '[]'}
                                onChange={(e) => {
                                  try {
                                    const titles = JSON.parse(e.target.value)
                                    setCurrentExam(prev => ({ ...prev, lv1_titles: titles }))
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                placeholder='["Überschrift a", "Überschrift b", ...]'
                                className="min-h-[100px] font-mono text-sm"
                              />
                            </div>

                            {/* Texts */}
                            <div className="space-y-2">
                              <Label>Texte (1-5)</Label>
                              <Textarea
                                value={currentExam.lv1_texts ? JSON.stringify(currentExam.lv1_texts, null, 2) : '[]'}
                                onChange={(e) => {
                                  try {
                                    const texts = JSON.parse(e.target.value)
                                    setCurrentExam(prev => ({ ...prev, lv1_texts: texts }))
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                placeholder='["Text 1", "Text 2", ...]'
                                className="min-h-[100px] font-mono text-sm"
                              />
                            </div>

                            {/* Answers */}
                            <div className="space-y-2">
                              <Label>Richtige Antworten (Indizes der Überschriften)</Label>
                              <Textarea
                                value={currentExam.lv1_answers ? JSON.stringify(currentExam.lv1_answers, null, 2) : '[]'}
                                onChange={(e) => {
                                  try {
                                    const answers = JSON.parse(e.target.value)
                                    setCurrentExam(prev => ({ ...prev, lv1_answers: answers }))
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                placeholder='[0, 1, 2, 3, 4]'
                                className="min-h-[60px] font-mono text-sm"
                              />
                            </div>
                          </div>

                          {/* Teil 2 */}
                          <div className="space-y-4 border-t pt-6">
                            <h4 className="text-lg font-semibold">Teil 2 - Multiple Choice</h4>
                            <div className="space-y-2">
                              <Label>Texte und Fragen</Label>
                              <Textarea
                                value={currentExam.lv2_questions ? JSON.stringify(currentExam.lv2_questions, null, 2) : '[]'}
                                onChange={(e) => {
                                  try {
                                    const questions = JSON.parse(e.target.value)
                                    setCurrentExam(prev => ({ ...prev, lv2_questions: questions }))
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                placeholder='[{"text": "Text", "question": "Frage", "options": ["a", "b", "c"], "answer": 0}]'
                                className="min-h-[150px] font-mono text-sm"
                              />
                            </div>
                          </div>

                          {/* Teil 3 */}
                          <div className="space-y-4 border-t pt-6">
                            <h4 className="text-lg font-semibold">Teil 3 - Anzeigen</h4>
                            <div className="space-y-2">
                              <Label>Situationen und Anzeigen</Label>
                              <Textarea
                                value={currentExam.lv3_situations ? JSON.stringify(currentExam.lv3_situations, null, 2) : '[]'}
                                onChange={(e) => {
                                  try {
                                    const situations = JSON.parse(e.target.value)
                                    setCurrentExam(prev => ({ ...prev, lv3_situations: situations }))
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                placeholder='[{"situation": "Situation", "ads": ["Anzeige a", "Anzeige b"], "answer": "a"}]'
                                className="min-h-[150px] font-mono text-sm"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Sprachbausteine Editor */}
                    <TabsContent value="sprachbausteine" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Sprachbausteine</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Teil 1 */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold">Teil 1 - Lückentext (21-30)</h4>
                            <div className="space-y-2">
                              <Label>Text mit Lücken und Optionen</Label>
                              <Textarea
                                value={currentExam.sb1_text || ''}
                                onChange={(e) => setCurrentExam(prev => ({ ...prev, sb1_text: e.target.value }))}
                                placeholder="Text mit [LÜCKE_1], [LÜCKE_2] usw."
                                className="min-h-[100px]"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Wörter (a-o)</Label>
                              <Textarea
                                value={currentExam.sb1_words ? JSON.stringify(currentExam.sb1_words, null, 2) : '[]'}
                                onChange={(e) => {
                                  try {
                                    const words = JSON.parse(e.target.value)
                                    setCurrentExam(prev => ({ ...prev, sb1_words: words }))
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                placeholder='["Wort a", "Wort b", "Wort c", ...]'
                                className="min-h-[100px] font-mono text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Richtige Antworten (Buchstaben)</Label>
                              <Textarea
                                value={currentExam.sb1_answers ? JSON.stringify(currentExam.sb1_answers, null, 2) : '[]'}
                                onChange={(e) => {
                                  try {
                                    const answers = JSON.parse(e.target.value)
                                    setCurrentExam(prev => ({ ...prev, sb1_answers: answers }))
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                placeholder='["a", "b", "c", ...]'
                                className="min-h-[60px] font-mono text-sm"
                              />
                            </div>
                          </div>

                          {/* Teil 2 */}
                          <div className="space-y-4 border-t pt-6">
                            <h4 className="text-lg font-semibold">Teil 2 - Lückentext (31-40)</h4>
                            <div className="space-y-2">
                              <Label>Text mit Lücken</Label>
                              <Textarea
                                value={currentExam.sb2_text || ''}
                                onChange={(e) => setCurrentExam(prev => ({ ...prev, sb2_text: e.target.value }))}
                                placeholder="Text mit [LÜCKE_1], [LÜCKE_2] usw."
                                className="min-h-[100px]"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Optionen für jede Lücke</Label>
                              <Textarea
                                value={currentExam.sb2_options ? JSON.stringify(currentExam.sb2_options, null, 2) : '[]'}
                                onChange={(e) => {
                                  try {
                                    const options = JSON.parse(e.target.value)
                                    setCurrentExam(prev => ({ ...prev, sb2_options: options }))
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                placeholder='[["Option 1a", "Option 1b", "Option 1c"], ["Option 2a", "Option 2b", "Option 2c"]]'
                                className="min-h-[100px] font-mono text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Richtige Antworten (Indizes)</Label>
                              <Textarea
                                value={currentExam.sb2_answers ? JSON.stringify(currentExam.sb2_answers, null, 2) : '[]'}
                                onChange={(e) => {
                                  try {
                                    const answers = JSON.parse(e.target.value)
                                    setCurrentExam(prev => ({ ...prev, sb2_answers: answers }))
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                placeholder='[0, 1, 2, ...]'
                                className="min-h-[60px] font-mono text-sm"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Hörverstehen Editor */}
                    <TabsContent value="hoerverstehen" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Hörverstehen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Teil 1 */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold">Teil 1 - Richtig/Falsch (41-45)</h4>
                            <div className="space-y-2">
                              <Label>Audio URL</Label>
                              <Input
                                value={currentExam.hoerverstehen?.teil1?.audio_url || ''}
                                onChange={(e) => setCurrentExam(prev => ({
                                  ...prev,
                                  hoerverstehen: {
                                    ...prev.hoerverstehen,
                                    teil1: { ...prev.hoerverstehen?.teil1, audio_url: e.target.value }
                                  }
                                }))}
                                placeholder="https://example.com/audio1.mp3"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Aussagen</Label>
                              <Textarea
                                value={currentExam.hoerverstehen?.teil1?.statements ? JSON.stringify(currentExam.hoerverstehen.teil1.statements, null, 2) : '[]'}
                                onChange={(e) => {
                                  try {
                                    const statements = JSON.parse(e.target.value)
                                    setCurrentExam(prev => ({
                                      ...prev,
                                      hoerverstehen: {
                                        ...prev.hoerverstehen,
                                        teil1: { ...prev.hoerverstehen?.teil1, statements }
                                      }
                                    }))
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                placeholder='["Aussage 1", "Aussage 2", ...]'
                                className="min-h-[100px] font-mono text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Richtige Antworten (true/false)</Label>
                              <Textarea
                                value={currentExam.hoerverstehen?.teil1?.answers ? JSON.stringify(currentExam.hoerverstehen.teil1.answers, null, 2) : '[]'}
                                onChange={(e) => {
                                  try {
                                    const answers = JSON.parse(e.target.value)
                                    setCurrentExam(prev => ({
                                      ...prev,
                                      hoerverstehen: {
                                        ...prev.hoerverstehen,
                                        teil1: { ...prev.hoerverstehen?.teil1, answers }
                                      }
                                    }))
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                placeholder='[true, false, true, ...]'
                                className="min-h-[60px] font-mono text-sm"
                              />
                            </div>
                          </div>

                          {/* Teil 2 */}
                          <div className="space-y-4 border-t pt-6">
                            <h4 className="text-lg font-semibold">Teil 2 - Richtig/Falsch (46-55)</h4>
                            <div className="space-y-2">
                              <Label>Audio URL</Label>
                              <Input
                                value={currentExam.hoerverstehen?.teil2?.audio_url || ''}
                                onChange={(e) => setCurrentExam(prev => ({
                                  ...prev,
                                  hoerverstehen: {
                                    ...prev.hoerverstehen,
                                    teil2: { ...prev.hoerverstehen?.teil2, audio_url: e.target.value }
                                  }
                                }))}
                                placeholder="https://example.com/audio2.mp3"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Aussagen</Label>
                              <Textarea
                                value={currentExam.hoerverstehen?.teil2?.statements ? JSON.stringify(currentExam.hoerverstehen.teil2.statements, null, 2) : '[]'}
                                onChange={(e) => {
                                  try {
                                    const statements = JSON.parse(e.target.value)
                                    setCurrentExam(prev => ({
                                      ...prev,
                                      hoerverstehen: {
                                        ...prev.hoerverstehen,
                                        teil2: { ...prev.hoerverstehen?.teil2, statements }
                                      }
                                    }))
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                placeholder='["Aussage 1", "Aussage 2", ...]'
                                className="min-h-[100px] font-mono text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Richtige Antworten (true/false)</Label>
                              <Textarea
                                value={currentExam.hoerverstehen?.teil2?.answers ? JSON.stringify(currentExam.hoerverstehen.teil2.answers, null, 2) : '[]'}
                                onChange={(e) => {
                                  try {
                                    const answers = JSON.parse(e.target.value)
                                    setCurrentExam(prev => ({
                                      ...prev,
                                      hoerverstehen: {
                                        ...prev.hoerverstehen,
                                        teil2: { ...prev.hoerverstehen?.teil2, answers }
                                      }
                                    }))
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                placeholder='[true, false, true, ...]'
                                className="min-h-[60px] font-mono text-sm"
                              />
                            </div>
                          </div>

                          {/* Teil 3 */}
                          <div className="space-y-4 border-t pt-6">
                            <h4 className="text-lg font-semibold">Teil 3 - Richtig/Falsch (56-60)</h4>
                            <div className="space-y-2">
                              <Label>Audio URL</Label>
                              <Input
                                value={currentExam.hoerverstehen?.teil3?.audio_url || ''}
                                onChange={(e) => setCurrentExam(prev => ({
                                  ...prev,
                                  hoerverstehen: {
                                    ...prev.hoerverstehen,
                                    teil3: { ...prev.hoerverstehen?.teil3, audio_url: e.target.value }
                                  }
                                }))}
                                placeholder="https://example.com/audio3.mp3"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Aussagen</Label>
                              <Textarea
                                value={currentExam.hoerverstehen?.teil3?.statements ? JSON.stringify(currentExam.hoerverstehen.teil3.statements, null, 2) : '[]'}
                                onChange={(e) => {
                                  try {
                                    const statements = JSON.parse(e.target.value)
                                    setCurrentExam(prev => ({
                                      ...prev,
                                      hoerverstehen: {
                                        ...prev.hoerverstehen,
                                        teil3: { ...prev.hoerverstehen?.teil3, statements }
                                      }
                                    }))
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                placeholder='["Aussage 1", "Aussage 2", ...]'
                                className="min-h-[100px] font-mono text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Richtige Antworten (true/false)</Label>
                              <Textarea
                                value={currentExam.hoerverstehen?.teil3?.answers ? JSON.stringify(currentExam.hoerverstehen.teil3.answers, null, 2) : '[]'}
                                onChange={(e) => {
                                  try {
                                    const answers = JSON.parse(e.target.value)
                                    setCurrentExam(prev => ({
                                      ...prev,
                                      hoerverstehen: {
                                        ...prev.hoerverstehen,
                                        teil3: { ...prev.hoerverstehen?.teil3, answers }
                                      }
                                    }))
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                placeholder='[true, false, true, ...]'
                                className="min-h-[60px] font-mono text-sm"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Schriftlicher Ausdruck Editor */}
                    <TabsContent value="schriftlicher" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Schriftlicher Ausdruck</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold">Aufgabe A</h4>
                            <div className="space-y-2">
                              <Label>Aufgabenstellung A</Label>
                              <Textarea
                                value={currentExam.schriftlicher_ausdruck?.task_a || ''}
                                onChange={(e) => setCurrentExam(prev => ({
                                  ...prev,
                                  schriftlicher_ausdruck: {
                                    ...prev.schriftlicher_ausdruck,
                                    task_a: e.target.value
                                  }
                                }))}
                                placeholder="Beschreibung der Aufgabe A..."
                                className="min-h-[100px]"
                              />
                            </div>
                          </div>

                          <div className="space-y-4 border-t pt-6">
                            <h4 className="text-lg font-semibold">Aufgabe B</h4>
                            <div className="space-y-2">
                              <Label>Aufgabenstellung B</Label>
                              <Textarea
                                value={currentExam.schriftlicher_ausdruck?.task_b || ''}
                                onChange={(e) => setCurrentExam(prev => ({
                                  ...prev,
                                  schriftlicher_ausdruck: {
                                    ...prev.schriftlicher_ausdruck,
                                    task_b: e.target.value
                                  }
                                }))}
                                placeholder="Beschreibung der Aufgabe B..."
                                className="min-h-[100px]"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Edit3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Keine Prüfung ausgewählt
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Wählen Sie eine Prüfung zum Bearbeiten aus oder erstellen Sie eine neue.
                  </p>
                  <Button onClick={createNewExam}>
                    <Plus className="w-4 h-4 mr-2" />
                    Neue Prüfung erstellen
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Systemeinstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Sicherheit</h4>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Admin Token</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Aktuell aktiv
                        </p>
                      </div>
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Aktiv
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">System</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Rate Limiting</span>
                        <Badge variant="secondary">Aktiv</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>CORS</span>
                        <Badge variant="secondary">Konfiguriert</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Datenbank</span>
                        <Badge variant="success">Verbunden</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminPanel

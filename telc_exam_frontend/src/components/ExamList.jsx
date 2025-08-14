import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { BookOpen, Clock, Users, Star, CheckCircle, ArrowRight, Zap } from 'lucide-react'
import { API_BASE_URL } from '@/lib/api'
import ThemeSwitch from './ThemeSwitch'

const ExamList = ({ onSelectExam }) => {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Prüfungen werden geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>
      {/* Hero Section */}
      <div className="py-16 px-6 border-b" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
        <div className="container mx-auto text-center max-w-4xl">
          {/* Theme Switch */}
          <div className="flex justify-end mb-6">
            <ThemeSwitch />
          </div>
          
          <div className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium mb-6" style={{backgroundColor: 'var(--accent)', color: 'var(--primary)'}}>
            <BookOpen className="w-4 h-4 mr-2" />
            TELC B2 PRÜFUNGSVORBEREITUNG
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6" style={{color: 'var(--foreground)'}}>
            Verfügbare Prüfungen
          </h1>
          
          <p className="text-lg leading-relaxed mb-8 max-w-2xl mx-auto" style={{color: 'var(--muted-foreground)'}}>
            Wählen Sie eine Übungsprüfung aus der untenstehenden Liste. 
            Jede Prüfung entspricht dem offiziellen TELC-B2-Format.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="rounded-lg p-6 border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 mx-auto" style={{backgroundColor: 'var(--muted)'}}>
                <Clock className="w-5 h-5" style={{color: 'var(--primary)'}} />
              </div>
              <h3 className="font-semibold mb-2" style={{color: 'var(--foreground)'}}>120 Minuten</h3>
              <p className="text-sm" style={{color: 'var(--muted-foreground)'}}>90 Min. (Lesen, Sprachbausteine, Hören) + 30 Min. (Schriftlicher Ausdruck)</p>
            </div>
            
            <div className="rounded-lg p-6 border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 mx-auto" style={{backgroundColor: 'var(--muted)'}}>
                <CheckCircle className="w-5 h-5" style={{color: 'var(--primary)'}} />
              </div>
              <h3 className="font-semibold mb-2" style={{color: 'var(--foreground)'}}>4 Teile</h3>
              <p className="text-sm" style={{color: 'var(--muted-foreground)'}}>Vollständig strukturiert</p>
            </div>
            
            <div className="rounded-lg p-6 border" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 mx-auto" style={{backgroundColor: 'var(--muted)'}}>
                <Zap className="w-5 h-5" style={{color: 'var(--primary)'}} />
              </div>
              <h3 className="font-semibold mb-2" style={{color: 'var(--foreground)'}}>Unmittelbare Auswertung</h3>
              <p className="text-sm" style={{color: 'var(--muted-foreground)'}}>Sofortiges Feedback</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exams Section */}
      <div className="container mx-auto px-6 pb-20">
        {exams.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Keine Prüfungen verfügbar</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Derzeit sind keine Prüfungen verfügbar. Bitte versuchen Sie es später erneut.
            </p>
            <Link to="/">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Zur Startseite
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Verfügbare Prüfungen
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Wählen Sie eine Prüfung aus der Liste unten. Jede Prüfung ist vollständig und folgt dem offiziellen TELC B2 Format.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-6xl mx-auto">
              {exams.map((exam, index) => (
                <ExamCard 
                  key={exam.id} 
                  exam={exam} 
                  index={index} 
                  onSelectExam={onSelectExam} 
                />
              ))}
            </div>

            {/* Information Section */}
            <div className="mt-16 rounded-lg border p-8" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-3" style={{color: 'var(--foreground)'}}>
                    So funktioniert's
                  </h2>
                  <p style={{color: 'var(--muted-foreground)'}}>
                    Ihre TELC B2 Prüfung in 4 einfachen Schritten
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StepCard 
                    number="1"
                    title="Prüfung auswählen"
                    description="Wählen Sie eine Übungsprüfung aus der Liste"
                    icon={<BookOpen className="w-5 h-5" />}
                  />
                  <StepCard 
                    number="2"
                    title="Timer startet"
                    description="90 Min. für Lesen, Sprachbausteine und Hören (Hören: 20 Min.)"
                    icon={<Clock className="w-5 h-5" />}
                  />
                  <StepCard 
                    number="3"
                    title="Prüfung absolvieren"
                    description="Bearbeiten Sie alle Teile gemäß den Zeitvorgaben"
                    icon={<CheckCircle className="w-5 h-5" />}
                  />
                  <StepCard 
                    number="4"
                    title="Ergebnisse erhalten"
                    description="Unmittelbare Auswertung und detailliertes Feedback"
                    icon={<Star className="w-5 h-5" />}
                  />
                </div>

                <div className="rounded-lg p-6 border" style={{backgroundColor: 'var(--muted)', borderColor: 'var(--border)'}}>
                  <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--foreground)'}}>Prüfungsinformationen</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3" style={{color: 'var(--foreground)'}}>Prüfungsteile:</h4>
                      <ul className="space-y-2 text-sm" style={{color: 'var(--muted-foreground)'}}>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: 'var(--primary)'}}></div>
                          Leseverstehen (3 Teile)
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: 'var(--primary)'}}></div>
                          Sprachbausteine (2 Teile)
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: 'var(--primary)'}}></div>
                          Hörverstehen (3 Teile)
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: 'var(--primary)'}}></div>
                          Schriftlicher Ausdruck (1 Aufgabe – A oder B)
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3" style={{color: 'var(--foreground)'}}>Funktionen:</h4>
                      <ul className="space-y-2 text-sm" style={{color: 'var(--muted-foreground)'}}>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" style={{color: 'var(--primary)'}} />
                          Automatische Speicherung
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" style={{color: 'var(--primary)'}} />
                          Navigation zwischen Teilen
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" style={{color: 'var(--primary)'}} />
                          Realistische Prüfungssimulation
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" style={{color: 'var(--primary)'}} />
                          Detaillierte Ergebnisse
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ExamCard({ exam, index, onSelectExam }) {
  return (
    <div className="rounded-lg border transition-all duration-200 hover:shadow-md" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 line-clamp-2" style={{color: 'var(--foreground)'}}>
              {exam.title}
            </h3>
            <div className="flex items-center gap-4 text-sm" style={{color: 'var(--muted-foreground)'}}>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>120 Min.</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{new Date(exam.created_at).toLocaleDateString("de-DE")}</span>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: 'var(--muted)'}}>
            <BookOpen className="w-5 h-5" style={{color: 'var(--primary)'}} />
          </div>
        </div>

        <div className="space-y-2 mb-6 rounded-lg p-4" style={{backgroundColor: 'var(--muted)'}}>
          <div className="flex items-center justify-between text-sm">
            <span style={{color: 'var(--muted-foreground)'}}>Leseverstehen</span>
            <span className="font-medium" style={{color: 'var(--foreground)'}}>3 Aufgaben</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{color: 'var(--muted-foreground)'}}>Sprachbausteine</span>
            <span className="font-medium" style={{color: 'var(--foreground)'}}>2 Aufgaben</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{color: 'var(--muted-foreground)'}}>Hörverstehen</span>
            <span className="font-medium" style={{color: 'var(--foreground)'}}>3 Aufgaben (20 Min. innerhalb der 90 Min.)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{color: 'var(--muted-foreground)'}}>Schriftlicher Ausdruck</span>
            <span className="font-medium" style={{color: 'var(--foreground)'}}>1 Aufgabe (A oder B) – 30 Min.</span>
          </div>
        </div>

        <Button 
          onClick={() => onSelectExam(exam.id)}
          className="w-full transition-all duration-200 btn-primary"
        >
          Prüfung starten
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

function StepCard({ number, title, description, icon }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 relative" style={{backgroundColor: 'var(--muted)'}}>
        <div style={{color: 'var(--primary)'}}>{icon}</div>
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}>
          {number}
        </div>
      </div>
      <h3 className="font-semibold mb-2 text-sm" style={{color: 'var(--foreground)'}}>{title}</h3>
      <p className="text-xs" style={{color: 'var(--muted-foreground)'}}>{description}</p>
    </div>
  )
}

export default ExamList
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2, Target, Timer, Play, BarChart3, RefreshCw, BookOpen } from 'lucide-react'
import ThemeSwitch from './ThemeSwitch'

function Feature({ children }) {
  return (
    <li className="flex items-start gap-3">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="mt-1 h-5 w-5 flex-none"
        style={{color: 'var(--primary)'}}
      >
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{color: 'var(--foreground)'}}>{children}</span>
    </li>
  )
}

function SkillCard({ title, progress }) {
  return (
    <div className="rounded-2xl border p-4" style={{borderColor: 'var(--border)', backgroundColor: 'var(--card)'}}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" style={{color: 'var(--foreground)'}}>{title}</p>
        <span className="text-sm tabular-nums" style={{color: 'var(--muted-foreground)'}}>{progress}%</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{backgroundColor: 'var(--muted)'}}>
        <div
          className="h-full transition-all duration-300"
          style={{ 
            width: `${progress}%`,
            backgroundColor: 'var(--primary)'
          }}
          aria-label={`${title} Fortschritt ${progress}%`}
        />
      </div>
    </div>
  )
}

function StepCard({ step, title, description, icon }) {
  return (
    <div className="relative rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
      {/* Step number */}
      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}>
        {step}
      </div>
      
      {/* Icon */}
      <div className="mb-4 w-12 h-12 rounded-xl flex items-center justify-center" style={{backgroundColor: 'var(--accent)', color: 'var(--primary)'}}>
        {icon}
      </div>
      
      {/* Content */}
      <h3 className="text-lg font-semibold mb-3" style={{color: 'var(--foreground)'}}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{color: 'var(--muted-foreground)'}}>
        {description}
      </p>
    </div>
  )
}

export default function Landing({ onStart }) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const handleStart = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      onStart()
    }, 800)
  }

  const handleScrollToFunction = () => {
    const element = document.getElementById('so-funktioniert')
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <div className="relative min-h-screen" style={{background: 'linear-gradient(to bottom right, var(--background), var(--muted))'}}>
      {/* Theme Switch */}
      <div className="absolute top-6 right-6 z-40">
        <ThemeSwitch />
      </div>
      {/* Loading Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300" style={{backgroundColor: 'rgba(var(--primary-rgb, 60, 74, 117), 0.1)'}}>
          <div className="rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in duration-500" style={{backgroundColor: 'var(--card)', border: '1px solid var(--border)'}}>
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin" style={{color: 'var(--primary)'}} />
              <div className="absolute inset-0 w-12 h-12 border-2 rounded-full animate-pulse" style={{borderColor: 'var(--muted)'}}></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1" style={{color: 'var(--foreground)'}}>
                Prüfung wird geladen...
              </h3>
              <p className="text-sm" style={{color: 'var(--muted-foreground)'}}>
                Bereiten Sie sich vor für den Test
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className={`transition-all duration-700 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        <section className="relative isolate overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
            <div className="grid items-center gap-12 md:grid-cols-2">
              {/* Left: Copy & CTAs */}
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm shadow-sm" style={{borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--primary)'}}>
                  Weltklasse Prüfungsvorbereitung
                </div>

                <h1 className="mt-2 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl md:text-6xl" style={{color: 'var(--foreground)'}}>
                  Erfolg bei der <span style={{color: 'var(--primary)'}}>telc B1/B2</span> –
                  <span className="block">Schritt für Schritt</span>
                </h1>

                <p className="mt-5 max-w-xl text-[18px] leading-7" style={{color: 'var(--muted-foreground)'}}>
                  Adaptiver Lernpfad, realistische Prüfungssimulationen und sofortiges Feedback – alles an einem Ort.
                </p>

                <ul className="mt-6 space-y-3 text-[16px]">
                  <Feature>Rund <strong>100 Übungsprüfungen</strong> im Prüfungsformat</Feature>
                  <Feature><strong>Echte Simulation</strong> mit Zeitlimit, Abschnitten und Audio</Feature>
                  <Feature><strong>Sofortige Auswertung</strong> mit Musterlösungen & Hinweisen</Feature>
                  <Feature><strong>Übersetzung & Glossar</strong> zum Lernen*</Feature>
                </ul>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={handleStart}
                    disabled={isTransitioning}
                    className={`inline-flex h-12 items-center justify-center rounded-2xl px-6 text-base font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${isTransitioning ? 'scale-110 shadow-2xl' : ''}`}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      focusVisibleRingColor: 'var(--primary)'
                    }}
                  >
                    {isTransitioning ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Lädt...</span>
                      </div>
                    ) : (
                      <span>Kostenlos starten</span>
                    )}
                  </Button>
                  <Button
                    onClick={handleScrollToFunction}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border px-6 text-base font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--card)',
                      color: 'var(--primary)',
                      focusVisibleRingColor: 'var(--primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--accent)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--card)'
                    }}
                  >
                    So funktioniert's
                  </Button>
                </div>

                <p className="mt-4 text-sm" style={{color: 'var(--muted-foreground)'}}>
                  Unabhängig von <span className="lowercase">telc</span>. „<span className="lowercase">telc</span>" ist eine eingetragene Marke der telc gGmbH.
                </p>
              </div>

              {/* Right: Dashboard mockup */}
              <div className="relative">
                <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[32px] shadow-xl" style={{backgroundColor: 'var(--card)'}} />
                <div className="rounded-[32px] border p-6 md:p-8" style={{borderColor: 'var(--border)', backgroundColor: 'var(--card)'}}>
                  {/* Skills grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <SkillCard title="Lesen" progress={82} />
                    <SkillCard title="Hören" progress={74} />
                    <SkillCard title="Schreiben" progress={68} />
                    <SkillCard title="Sprechen" progress={71} />
                  </div>

                  {/* Exam simulation card */}
                  <div className="mt-8 rounded-2xl border p-4" style={{borderColor: 'var(--border)', backgroundColor: 'var(--background)'}}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm" style={{color: 'var(--muted-foreground)'}}>Zertifikats-Simulation</p>
                        <p className="text-lg font-semibold" style={{color: 'var(--foreground)'}}>TELC B1/B2 – Vollprüfung</p>
                      </div>
                      <span className="rounded-full px-3 py-1 text-sm font-semibold" style={{backgroundColor: 'var(--accent)', color: 'var(--primary)'}}>
                        Startklar
                      </span>
                    </div>
                    <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{backgroundColor: 'var(--muted)'}}>
                      <div
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: '66%',
                          backgroundColor: 'var(--primary)'
                        }}
                        aria-label="Fortschritt 66%"
                      />
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="mt-6 flex items-center gap-3" style={{color: 'var(--muted-foreground)'}}>
                    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
                      <circle cx="12" cy="12" r="10" fill="var(--accent)" />
                      <path
                        d="M7 13l3 3 7-7"
                        stroke="var(--primary)"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-sm">Praxisnahes, neutrales Design – keine Markenlogos.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* So funktioniert's Section */}
        <section id="so-funktioniert" className="py-20 px-6">
          <div className="mx-auto max-w-6xl">
            {/* Section header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{color: 'var(--foreground)'}}>
                So funktioniert's
              </h2>
              <p className="text-lg max-w-3xl mx-auto leading-relaxed" style={{color: 'var(--muted-foreground)'}}>
                Trainiere für <strong>telc B1/B2</strong> im echten Prüfungsmodus – ohne Ablenkung und mit klarer Struktur. 
                FokusDeutsch passt sich deinem Niveau an und zeigt dir genau, woran du als Nächstes arbeiten solltest.
              </p>
            </div>

            {/* Steps grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <StepCard 
                step="1"
                title="Einstufung in 8–10 Minuten"
                description="Ein kurzer Starttest ermittelt dein aktuelles Niveau und deine Stärken/Schwächen – damit du ohne Umwege lernst."
                icon={<Target className="w-6 h-6" />}
              />
              <StepCard 
                step="2"
                title="Prüfungsmodus wählen"
                description="B1 oder B2, komplette Prüfung oder einzelne Module. Alles mit originalgetreuen Zeitlimits und Abschnittslogik."
                icon={<Timer className="w-6 h-6" />}
              />
              <StepCard 
                step="3"
                title="Simulation starten"
                description="Rund 100 Übungsprüfungen: Hörtexte, Lesepassagen, Schreibaufgaben und Sprechkarten – mit Timer, Markierungen, Notizen und Pause-Regeln wie am Prüfungstag."
                icon={<Play className="w-6 h-6" />}
              />
              <StepCard 
                step="4"
                title="Sofortige Auswertung"
                description="Punktzahl, Musterlösungen, Erklärungen zu Grammatik/Wortschatz und konkrete Hinweise, wie du dich verbesserst."
                icon={<BarChart3 className="w-6 h-6" />}
              />
              <StepCard 
                step="5"
                title="Wiederholen & Lernpfad"
                description="Automatische Wiederholungen schließen Lücken. Dein adaptiver Plan passt Umfang und Schwierigkeit an deinen Fortschritt an."
                icon={<RefreshCw className="w-6 h-6" />}
              />
              <StepCard 
                step="6"
                title="Übersetzung & Glossar*"
                description="Unklare Wörter oder Sätze zum Lernen übersetzen und für später speichern – direkt aus der Aufgabe heraus."
                icon={<BookOpen className="w-6 h-6" />}
              />
            </div>

            {/* CTA section */}
            <div className="text-center">
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <Button
                  onClick={handleStart}
                  className="px-6 py-3 text-base font-semibold rounded-2xl"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)'
                  }}
                >
                  Jetzt starten
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="px-6 py-3 text-base font-semibold rounded-2xl border"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--primary)'
                  }}
                >
                  Beispielprüfung ansehen
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <p className="text-sm" style={{color: 'var(--muted-foreground)'}}>
                *Übersetzungshilfen sind ausschließlich fürs Lernen gedacht und in echten Prüfungen nicht erlaubt.
              </p>
            </div>
          </div>
        </section>

        {/* Legal section */}
        <section className="py-16 px-6 border-t" style={{backgroundColor: 'var(--muted)', borderColor: 'var(--border)'}}>
          <div className="mx-auto max-w-4xl">
            <h3 className="text-lg font-semibold mb-6 text-center" style={{color: 'var(--foreground)'}}>
              Rechtliche Hinweise
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm" style={{color: 'var(--muted-foreground)'}}>
              <div className="rounded-lg p-4" style={{backgroundColor: 'var(--card)', border: '1px solid var(--border)'}}>
                <h4 className="font-medium mb-2" style={{color: 'var(--foreground)'}}>Unabhängigkeit</h4>
                <p>FokusDeutsch steht in <strong>keiner Verbindung</strong> zur telc gGmbH. Es besteht <strong>keine Partnerschaft</strong> oder offizielle Anerkennung.</p>
              </div>
              <div className="rounded-lg p-4" style={{backgroundColor: 'var(--card)', border: '1px solid var(--border)'}}>
                <h4 className="font-medium mb-2" style={{color: 'var(--foreground)'}}>Markenhinweis</h4>
                <p>„telc" ist eine <strong>eingetragene Marke</strong> der telc gGmbH. Die Verwendung des Wortes dient ausschließlich zur <strong>Beschreibung</strong> des Prüfungsformats.</p>
              </div>
              <div className="rounded-lg p-4" style={{backgroundColor: 'var(--card)', border: '1px solid var(--border)'}}>
                <h4 className="font-medium mb-2" style={{color: 'var(--foreground)'}}>Urheberrecht/Content</h4>
                <p>Alle Aufgaben, Audios und Materialien sind <strong>eigene Erstellung</strong> oder rechtmäßig lizenziert. Es handelt sich <strong>nicht</strong> um Originalprüfungen der telc gGmbH.</p>
              </div>
              <div className="rounded-lg p-4" style={{backgroundColor: 'var(--card)', border: '1px solid var(--border)'}}>
                <h4 className="font-medium mb-2" style={{color: 'var(--foreground)'}}>Kein Erfolgsversprechen</h4>
                <p>Wir geben <strong>keine Bestehensgarantie</strong>. Ergebnisse hängen von individueller Vorbereitung ab.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
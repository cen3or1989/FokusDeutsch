import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Award, RotateCcw } from 'lucide-react'

const ExamResults = ({ result, onBackToList }) => {
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (percentage) => {
    if (percentage >= 60) {
      return <CheckCircle className="w-8 h-8 text-green-600" />
    }
    return <XCircle className="w-8 h-8 text-red-600" />
  }

  const getGrade = (percentage) => {
    if (percentage >= 90) return 'Ausgezeichnet'
    if (percentage >= 80) return 'Gut'
    if (percentage >= 70) return 'Befriedigend'
    if (percentage >= 60) return 'Ausreichend'
    return 'Verbesserungsbedürftig'
  }

  return (
    <div className="container mx-auto p-6" style={{direction: 'ltr', textAlign: 'left'}}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {getScoreIcon(result.score_percentage)}
          </div>
          <h1 className="text-3xl font-bold mb-2">Ihre Prüfungsergebnisse</h1>
          <p className="text-gray-600">Die Prüfung wurde erfolgreich abgeschlossen</p>
        </div>

        {/* Overall Score */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Gesamtpunktzahl
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(result.score_percentage)}`}>
                {result.score_percentage.toFixed(1)}%
              </div>
              <div className="text-lg text-gray-600 mb-4">
                {result.total_score} von {result.max_score} Fragen richtig
              </div>
              <Progress value={result.score_percentage} className="h-3 mb-4" />
              <div className="text-lg font-semibold">
                Status: <span className={getScoreColor(result.score_percentage)}>{getGrade(result.score_percentage)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Scores */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detailpunkte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">Leseverstehen Teil 1</span>
                  <span className="font-semibold">{result.detailed_scores.leseverstehen_teil1}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">Leseverstehen Teil 2</span>
                  <span className="font-semibold">{result.detailed_scores.leseverstehen_teil2}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">Leseverstehen Teil 3</span>
                  <span className="font-semibold">{result.detailed_scores.leseverstehen_teil3}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">Sprachbausteine Teil 1</span>
                  <span className="font-semibold">{result.detailed_scores.sprachbausteine_teil1}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">Sprachbausteine Teil 2</span>
                  <span className="font-semibold">{result.detailed_scores.sprachbausteine_teil2}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">Hörverstehen</span>
                  <span className="font-semibold">{result.detailed_scores.hoerverstehen}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Leistungsanalyse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.score_percentage >= 80 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <h4 className="font-semibold text-green-800 mb-2">Ausgezeichnete Leistung!</h4>
                  <p className="text-green-700">Sie haben sehr gut abgeschnitten. Ihre Deutschkenntnisse liegen auf Niveau B2.</p>
                </div>
              )}
              
              {result.score_percentage >= 60 && result.score_percentage < 80 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <h4 className="font-semibold text-yellow-800 mb-2">Solide Leistung</h4>
                  <p className="text-yellow-700">Gute Leistung, aber es gibt noch Luft nach oben. Mit mehr Übung können Sie noch bessere Ergebnisse erzielen.</p>
                </div>
              )}
              
              {result.score_percentage < 60 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <h4 className="font-semibold text-red-800 mb-2">Verbesserung erforderlich</h4>
                  <p className="text-red-700">Ihr Ergebnis zeigt, dass mehr Übung nötig ist. Konzentrieren Sie sich auf Schwachstellen und versuchen Sie es erneut.</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3 mt-6">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {((parseInt(result.detailed_scores.leseverstehen_teil1.split('/')[0]) + 
                       parseInt(result.detailed_scores.leseverstehen_teil2.split('/')[0]) + 
                       parseInt(result.detailed_scores.leseverstehen_teil3.split('/')[0])) / 20 * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Leseverstehen</div>
                </div>
                
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {((parseInt(result.detailed_scores.sprachbausteine_teil1.split('/')[0]) + 
                       parseInt(result.detailed_scores.sprachbausteine_teil2.split('/')[0])) / 20 * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Sprachbausteine</div>
                </div>
                
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {(parseInt(result.detailed_scores.hoerverstehen.split('/')[0]) / 20 * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Hörverstehen</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="text-center">
            <Button onClick={onBackToList} className="flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" />
              Zurück zur Prüfungsübersicht
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ExamResults


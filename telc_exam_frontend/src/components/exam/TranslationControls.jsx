import { Loader2, Globe } from 'lucide-react'
import { useExam } from '@/context/ExamContext'

const TranslationControls = ({ sectionKey, paths }) => {
  const { translation, sectionLang, setSectionLang, exam, setExam, originalExam } = useExam()

  const isTranslating = !!translation.translating[sectionKey]

  const handleGerman = () => {
    if (isTranslating) return
    translation.restorePathsToOriginal(paths, originalExam, setExam)
    setSectionLang(prev => ({ ...prev, [sectionKey]: 'de' }))
  }

  const handlePersian = async () => {
    if (isTranslating) return
    await translation.translatePathsInChunks(paths, sectionKey, exam, setExam)
    setSectionLang(prev => ({ ...prev, [sectionKey]: 'fa' }))
  }

  return (
    <div className={`translation-toggle ${isTranslating ? 'loading' : ''}`}>
      <button
        className={`translation-btn ${sectionLang[sectionKey] === 'de' ? 'active' : ''}`}
        onClick={handleGerman}
        disabled={isTranslating}
        title="Deutsch anzeigen"
      >
        <Globe className="w-4 h-4" />
        <span className="btn-text">DE</span>
      </button>
      <button
        className={`translation-btn ${sectionLang[sectionKey] === 'fa' ? 'active' : ''}`}
        onClick={handlePersian}
        disabled={isTranslating}
        title="نمایش فارسی"
      >
        {isTranslating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <i className="fas fa-language" style={{ fontSize: '16px' }}></i>
        )}
        <span className="btn-text">FA</span>
      </button>
    </div>
  )
}

export default TranslationControls

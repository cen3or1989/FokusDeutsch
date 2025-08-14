import { useState, useCallback } from 'react'

export const useExamAnswers = (exam) => {
  const [answers, setAnswers] = useState({
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
  })

  const [showSaved, setShowSaved] = useState(false)

  const updateAnswer = useCallback((section, index, value) => {
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
    
    // Show saved indicator
    setShowSaved(true)
    window.clearTimeout(updateAnswer._t)
    updateAnswer._t = window.setTimeout(() => setShowSaved(false), 1200)
  }, [])

  const getProgress = useCallback((sectionKey) => {
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
  }, [answers])

  const getAnswerStatus = useCallback((questionNum) => {
    if (questionNum<=5) return !!answers.leseverstehen_teil1?.[questionNum-1]
    if (questionNum<=10) return !!answers.leseverstehen_teil2?.[questionNum-6]
    if (questionNum<=20) return !!answers.leseverstehen_teil3?.[questionNum-11]
    if (questionNum<=30) return !!answers.sprachbausteine_teil1?.[questionNum-21]
    if (questionNum<=40) return !!answers.sprachbausteine_teil2?.[questionNum-31]
    if (questionNum<=45) return typeof answers.hoerverstehen?.teil1?.[questionNum-41] === 'boolean'
    if (questionNum<=55) return typeof answers.hoerverstehen?.teil2?.[questionNum-46] === 'boolean'
    return typeof answers.hoerverstehen?.teil3?.[questionNum-56] === 'boolean'
  }, [answers])

  const normalizeAnswersForSubmit = useCallback(() => {
    const normalized = { ...answers }
    
    // Normalize LV2 answers from letters (a/b/c) to indices (0/1/2)
    if (Array.isArray(normalized.leseverstehen_teil2)) {
      const mapLetterToIndex = { a: 0, b: 1, c: 2 }
      normalized.leseverstehen_teil2 = normalized.leseverstehen_teil2.map(v => {
        if (typeof v === 'string') {
          return mapLetterToIndex[v] ?? v
        }
        return v
      })
    }
    
    return normalized
  }, [answers])

  return {
    answers,
    showSaved,
    updateAnswer,
    getProgress,
    getAnswerStatus,
    normalizeAnswersForSubmit
  }
}

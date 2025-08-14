import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/lib/api'

const TRANSLATE_CHUNK_SIZE = 8

export const useTranslation = (examId) => {
  const [clientTranslations, setClientTranslations] = useState({})
  const [translating, setTranslating] = useState({})
  const [translateProgress, setTranslateProgress] = useState({})

  const getClientTransKey = useCallback(() => `translations_${examId}_FA`, [examId])

  const loadClientTranslations = useCallback(() => {
    try {
      const raw = localStorage.getItem(getClientTransKey())
      if (raw) setClientTranslations(JSON.parse(raw))
    } catch (_) {}
  }, [getClientTransKey])

  const persistClientTranslations = useCallback((map) => {
    setClientTranslations(map)
    try { 
      localStorage.setItem(getClientTransKey(), JSON.stringify(map)) 
    } catch(_) {}
  }, [getClientTransKey])

  // Generic robust setter for deep paths like a.b[0].c or x[1].y[2]
  const setValueAtPath = useCallback((obj, path, value) => {
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
          i++
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
  }, [])

  const getValueAtPath = useCallback((obj, path) => {
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
  }, [])

  const chunkArray = useCallback((arr, size) => {
    const out = []
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
    return out
  }, [])

  const restorePathsToOriginal = useCallback((paths, originalExam, setExam) => {
    if (!originalExam || !Array.isArray(paths)) return
    const updated = structuredClone(originalExam)
    for (const p of paths) {
      const originalVal = getValueAtPath(originalExam, p)
      if (originalVal !== undefined) setValueAtPath(updated, p, originalVal)
    }
    setExam(updated)
    toast.success('Deutscher Text wiederhergestellt')
  }, [])

  const translatePathsInChunks = useCallback(async (paths, translatingKey, exam, setExam) => {
    if (!paths || paths.length === 0) return
    setTranslating(prev => ({ ...prev, [translatingKey]: true }))
    const batches = chunkArray(paths, TRANSLATE_CHUNK_SIZE)
    let updated = structuredClone(exam)
    const allTranslations = {}
    const adminToken = typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || '') : ''
    
    try {
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
          
          // Handle quality statistics from enhanced API
          const batch_translations = data.translations || data
          const quality_stats = data.quality_stats
          
          // Log quality information for monitoring
          if (quality_stats) {
            console.log(`🔍 Translation Quality Report:`, quality_stats)
            console.log(`📊 Average Score: ${quality_stats.average_score}/100`)
            console.log(`✅ High Quality: ${quality_stats.high_quality}/${quality_stats.total_translations}`)
            console.log(`💾 Cached: ${quality_stats.cached_translations}/${quality_stats.total_translations}`)
            
            // Show quality notification
            if (quality_stats.average_score >= 90) {
              console.log('🎉 Excellent translation quality achieved!')
            } else if (quality_stats.average_score >= 70) {
              console.log('✅ Good translation quality achieved')
            } else if (quality_stats.poor_quality > 0) {
              console.warn(`⚠️ Warning: ${quality_stats.poor_quality} low-quality translations detected`)
            }
          }
          if (batch_translations) {
            Object.entries(batch_translations).forEach(([k, v]) => {
              allTranslations[k] = v
              cachedMap[k] = v
            })
          }
        } catch (e) {
          console.error('Batch translate failed', e)
          toast.error('Ein Teil der Übersetzung ist fehlgeschlagen')
        }
        done += batch.length
        const percent = Math.min(100, Math.round((done / total) * 100))
        setTranslateProgress(prev => ({ ...prev, [translatingKey]: percent }))
        await new Promise(r => setTimeout(r, 120))
      }
      
      Object.entries(allTranslations).forEach(([k, v]) => setValueAtPath(updated, k, v))
      setExam(updated)
      persistClientTranslations(cachedMap)
      toast.success('Übersetzung aktualisiert')
    } finally {
      setTranslating(prev => ({ ...prev, [translatingKey]: false }))
      setTranslateProgress(prev => ({ ...prev, [translatingKey]: 0 }))
    }
  }, [examId, clientTranslations])

  return {
    clientTranslations,
    translating,
    translateProgress,
    loadClientTranslations,
    translatePathsInChunks,
    restorePathsToOriginal
  }
}

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export const useAudio = () => {
  const [audioPlaying, setAudioPlaying] = useState({})

  const playAudio = useCallback((audioUrl, section) => {
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
  }, [])

  return {
    audioPlaying,
    playAudio
  }
}

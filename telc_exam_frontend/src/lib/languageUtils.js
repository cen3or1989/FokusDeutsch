// Language utilities for RTL/LTR content styling

/**
 * Decode HTML entities and format text for display
 */
export const decodeAndFormatText = (text, isRTL = false) => {
  if (!text) return text
  
  // Create a temporary element to decode HTML entities
  const tempElement = document.createElement('div')
  tempElement.innerHTML = text
  let decodedText = tempElement.textContent || tempElement.innerText || text
  
  // Handle specific problematic entities that might still be present
  const entityMap = {
    '&#10;': '\n',
    '&#13;': '\r',
    '&#32;': ' ',
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
  }
  
  for (const [entity, replacement] of Object.entries(entityMap)) {
    decodedText = decodedText.replace(new RegExp(entity, 'g'), replacement)
  }
  
  return decodedText
}

/**
 * Format text for display with proper line breaks and RTL support
 */
export const formatTextForDisplay = (text, isRTL = false) => {
  if (!text) return text
  
  // Decode HTML entities first
  let formattedText = decodeAndFormatText(text, isRTL)
  
  // Convert newlines to <br> tags for HTML display
  formattedText = formattedText.replace(/\n/g, '<br>')
  
  return formattedText
}

export const getContentTextClass = (sectionKey, sectionLang) => {
  const currentLang = sectionLang[sectionKey] || 'de'
  
  if (currentLang === 'fa') {
    return 'content-text rtl persian-text'
  }
  
  return 'content-text ltr german-text'
}

// For static content that should never change (like instructions)
export const getStaticGermanClass = () => {
  return 'content-text ltr german-text anweisung-text'
}

// For title text that should change language and direction
export const getTitleTextClass = (sectionKey, sectionLang) => {
  const currentLang = sectionLang[sectionKey] || 'de'
  
  if (currentLang === 'fa') {
    return 'title-text rtl'
  }
  
  return 'title-text ltr'
}

// For static German titles that should only change direction (not font)
export const getStaticTitleDirectionClass = (sectionKey, sectionLang) => {
  const currentLang = sectionLang[sectionKey] || 'de'
  
  if (currentLang === 'fa') {
    return 'static-title rtl'
  }
  
  return 'static-title ltr'
}

export const getTextDirection = (sectionKey, sectionLang) => {
  const currentLang = sectionLang[sectionKey] || 'de'
  return currentLang === 'fa' ? 'rtl' : 'ltr'
}

export const getFontFamily = (sectionKey, sectionLang) => {
  const currentLang = sectionLang[sectionKey] || 'de'
  
  if (currentLang === 'fa') {
    return "'Sanf', 'Vazirmatn', 'Noto Sans Arabic', 'Shabnam', 'IranSans', 'Tahoma', 'Arial Unicode MS', sans-serif"
  }
  
  return "var(--font-sans)"
}

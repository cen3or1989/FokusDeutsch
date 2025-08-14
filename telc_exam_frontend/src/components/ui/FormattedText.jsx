import React from 'react'
import { formatTextForDisplay, decodeAndFormatText } from '@/lib/languageUtils'

/**
 * FormattedText component that properly renders translated text with:
 * - HTML entity decoding
 * - Line break preservation  
 * - RTL support for Persian text
 * - Proper direction and alignment
 */
const FormattedText = ({ 
  text, 
  className = '', 
  isRTL = false, 
  preserveLineBreaks = true,
  as: Component = 'span',
  ...props 
}) => {
  if (!text) return null
  
  // Decode HTML entities and format text
  const processedText = preserveLineBreaks 
    ? formatTextForDisplay(text, isRTL)
    : decodeAndFormatText(text, isRTL)
  
  // Determine direction and styling
  const direction = isRTL ? 'rtl' : 'ltr'
  const textAlign = isRTL ? 'right' : 'left'
  
  const style = {
    direction,
    textAlign,
    ...props.style
  }
  
  const combinedClassName = `${className} ${isRTL ? 'rtl-text' : 'ltr-text'}`.trim()
  
  if (preserveLineBreaks && processedText.includes('<br>')) {
    // Render with dangerouslySetInnerHTML for line breaks
    return (
      <Component
        {...props}
        className={combinedClassName}
        style={style}
        dangerouslySetInnerHTML={{ __html: processedText }}
      />
    )
  }
  
  // Render as plain text
  return (
    <Component
      {...props}
      className={combinedClassName}
      style={style}
    >
      {processedText}
    </Component>
  )
}

export default FormattedText

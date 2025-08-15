// Debug utilities for exam submission tracking

export const logError = (error, context = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    context,
    userAgent: navigator.userAgent,
    url: window.location.href
  }
  
  console.error('🔴 Error logged:', errorLog)
  
  // Store in localStorage for debugging
  try {
    const existingLogs = JSON.parse(localStorage.getItem('exam_error_logs') || '[]')
    existingLogs.push(errorLog)
    
    // Keep only last 50 errors
    if (existingLogs.length > 50) {
      existingLogs.splice(0, existingLogs.length - 50)
    }
    
    localStorage.setItem('exam_error_logs', JSON.stringify(existingLogs))
  } catch (e) {
    console.error('Failed to store error log:', e)
  }
}

export const logApiCall = (url, method, status, duration, context = {}) => {
  const apiLog = {
    timestamp: new Date().toISOString(),
    url,
    method,
    status,
    duration,
    context
  }
  
  console.log('🌐 API call logged:', apiLog)
  
  // Store in localStorage for debugging
  try {
    const existingLogs = JSON.parse(localStorage.getItem('exam_api_logs') || '[]')
    existingLogs.push(apiLog)
    
    // Keep only last 100 API calls
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100)
    }
    
    localStorage.setItem('exam_api_logs', JSON.stringify(existingLogs))
  } catch (e) {
    console.error('Failed to store API log:', e)
  }
}

export const logComponentRender = (componentName, props = {}) => {
  const renderLog = {
    timestamp: new Date().toISOString(),
    component: componentName,
    props: Object.keys(props).reduce((acc, key) => {
      // Don't log large objects or functions
      const value = props[key]
      if (typeof value === 'function' || (typeof value === 'object' && value !== null && Object.keys(value).length > 10)) {
        acc[key] = typeof value === 'function' ? '[Function]' : '[Large Object]'
      } else {
        acc[key] = value
      }
      return acc
    }, {})
  }
  
  console.log('🎨 Component render logged:', renderLog)
}

export const logSubmissionAttempt = (examId, answers, timerPhase, studentName) => {
  const submissionLog = {
    timestamp: new Date().toISOString(),
    examId,
    timerPhase,
    studentName,
    answersSummary: {
      leseverstehen_teil1: answers.leseverstehen_teil1?.filter(Boolean).length || 0,
      leseverstehen_teil2: answers.leseverstehen_teil2?.filter(Boolean).length || 0,
      leseverstehen_teil3: answers.leseverstehen_teil3?.filter(Boolean).length || 0,
      sprachbausteine_teil1: answers.sprachbausteine_teil1?.filter(Boolean).length || 0,
      sprachbausteine_teil2: answers.sprachbausteine_teil2?.filter(Boolean).length || 0,
      hoerverstehen_teil1: answers.hoerverstehen?.teil1?.filter(v => typeof v === 'boolean').length || 0,
      hoerverstehen_teil2: answers.hoerverstehen?.teil2?.filter(v => typeof v === 'boolean').length || 0,
      hoerverstehen_teil3: answers.hoerverstehen?.teil3?.filter(v => typeof v === 'boolean').length || 0,
      hasSchriftlicherAusdruck: !!answers.schriftlicher_ausdruck?.selected_task
    },
    totalAnswered: Object.values(answers).reduce((total, section) => {
      if (section === 'hoerverstehen') {
        return total + Object.values(section).reduce((hvTotal, teil) => {
          return hvTotal + (Array.isArray(teil) ? teil.filter(v => typeof v === 'boolean').length : 0)
        }, 0)
      } else if (Array.isArray(section)) {
        return total + section.filter(v => v !== '' && v !== undefined && v !== null).length
      }
      return total
    }, 0)
  }
  
  console.log('📝 Submission attempt logged:', submissionLog)
  
  // Store in localStorage for debugging
  try {
    const existingLogs = JSON.parse(localStorage.getItem('exam_submission_logs') || '[]')
    existingLogs.push(submissionLog)
    
    // Keep only last 20 submissions
    if (existingLogs.length > 20) {
      existingLogs.splice(0, existingLogs.length - 20)
    }
    
    localStorage.setItem('exam_submission_logs', JSON.stringify(existingLogs))
  } catch (e) {
    console.error('Failed to store submission log:', e)
  }
}

export const getDebugInfo = () => {
  try {
    const errorLogs = JSON.parse(localStorage.getItem('exam_error_logs') || '[]')
    const apiLogs = JSON.parse(localStorage.getItem('exam_api_logs') || '[]')
    const submissionLogs = JSON.parse(localStorage.getItem('exam_submission_logs') || '[]')
    
    return {
      errorLogs: errorLogs.slice(-10), // Last 10 errors
      apiLogs: apiLogs.slice(-20), // Last 20 API calls
      submissionLogs: submissionLogs.slice(-5), // Last 5 submissions
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }
  } catch (e) {
    console.error('Failed to get debug info:', e)
    return { error: 'Failed to retrieve debug info' }
  }
}

export const clearDebugLogs = () => {
  try {
    localStorage.removeItem('exam_error_logs')
    localStorage.removeItem('exam_api_logs')
    localStorage.removeItem('exam_submission_logs')
    console.log('🧹 Debug logs cleared')
  } catch (e) {
    console.error('Failed to clear debug logs:', e)
  }
}

export const validateAnswers = (answers) => {
  const issues = []
  
  // Check for required sections
  const requiredSections = ['leseverstehen_teil1', 'leseverstehen_teil2', 'leseverstehen_teil3', 
                           'sprachbausteine_teil1', 'sprachbausteine_teil2', 'hoerverstehen']
  
  requiredSections.forEach(section => {
    if (!answers[section]) {
      issues.push(`Missing section: ${section}`)
    }
  })
  
  // Check array lengths
  if (answers.leseverstehen_teil1 && answers.leseverstehen_teil1.length !== 5) {
    issues.push('leseverstehen_teil1 should have 5 answers')
  }
  
  if (answers.leseverstehen_teil2 && answers.leseverstehen_teil2.length !== 5) {
    issues.push('leseverstehen_teil2 should have 5 answers')
  }
  
  if (answers.leseverstehen_teil3 && answers.leseverstehen_teil3.length !== 10) {
    issues.push('leseverstehen_teil3 should have 10 answers')
  }
  
  if (answers.sprachbausteine_teil1 && answers.sprachbausteine_teil1.length !== 10) {
    issues.push('sprachbausteine_teil1 should have 10 answers')
  }
  
  if (answers.sprachbausteine_teil2 && answers.sprachbausteine_teil2.length !== 10) {
    issues.push('sprachbausteine_teil2 should have 10 answers')
  }
  
  // Check Hörverstehen structure
  if (answers.hoerverstehen) {
    const hvSections = ['teil1', 'teil2', 'teil3']
    hvSections.forEach(teil => {
      if (!answers.hoerverstehen[teil]) {
        issues.push(`Missing hoerverstehen.${teil}`)
      } else if (answers.hoerverstehen[teil].length !== (teil === 'teil2' ? 10 : 5)) {
        issues.push(`hoerverstehen.${teil} should have ${teil === 'teil2' ? 10 : 5} answers`)
      }
    })
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

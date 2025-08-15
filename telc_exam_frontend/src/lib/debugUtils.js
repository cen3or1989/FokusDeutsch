// Debug utilities for tracking and preventing white screen issues

// Global error tracking
window.examDebugInfo = {
  errors: [],
  warnings: [],
  apiCalls: [],
  componentRenders: [],
  lastError: null
}

// Enhanced error logging
export const logError = (error, context = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    name: error.name,
    context,
    url: window.location.href,
    userAgent: navigator.userAgent
  }
  
  console.error('Exam Error:', errorInfo)
  
  // Store in global debug info
  window.examDebugInfo.errors.push(errorInfo)
  window.examDebugInfo.lastError = errorInfo
  
  // Store in session storage for debugging
  try {
    sessionStorage.setItem('exam_errors', JSON.stringify(window.examDebugInfo.errors))
  } catch (e) {
    console.error('Failed to store error in session storage:', e)
  }
  
  return errorInfo
}

// API call tracking
export const logApiCall = (url, method, status, duration, error = null) => {
  const apiCall = {
    timestamp: new Date().toISOString(),
    url,
    method,
    status,
    duration,
    error: error ? error.message : null
  }
  
  console.log('API Call:', apiCall)
  window.examDebugInfo.apiCalls.push(apiCall)
}

// Component render tracking
export const logComponentRender = (componentName, props = {}) => {
  const renderInfo = {
    timestamp: new Date().toISOString(),
    component: componentName,
    props: Object.keys(props),
    url: window.location.href
  }
  
  window.examDebugInfo.componentRenders.push(renderInfo)
  
  // Keep only last 50 renders to prevent memory issues
  if (window.examDebugInfo.componentRenders.length > 50) {
    window.examDebugInfo.componentRenders = window.examDebugInfo.componentRenders.slice(-50)
  }
}

// Performance monitoring
export const measurePerformance = (name, fn) => {
  const start = performance.now()
  try {
    const result = fn()
    const duration = performance.now() - start
    console.log(`Performance [${name}]: ${duration.toFixed(2)}ms`)
    return result
  } catch (error) {
    const duration = performance.now() - start
    console.error(`Performance [${name}] failed after ${duration.toFixed(2)}ms:`, error)
    throw error
  }
}

// White screen detection
export const detectWhiteScreen = () => {
  // Check if page is mostly white/empty
  const body = document.body
  const html = document.documentElement
  
  // Check if body has content
  if (!body.children.length) {
    logError(new Error('White screen detected: No body children'), { type: 'white_screen' })
    return true
  }
  
  // Check if main content area is empty
  const mainContent = body.querySelector('main') || body.querySelector('.container') || body
  if (mainContent && mainContent.children.length === 0) {
    logError(new Error('White screen detected: Empty main content'), { type: 'white_screen' })
    return true
  }
  
  return false
}

// Auto-recovery from white screen
export const setupWhiteScreenRecovery = () => {
  let whiteScreenTimeout
  
  const checkForWhiteScreen = () => {
    if (detectWhiteScreen()) {
      console.warn('White screen detected, attempting recovery...')
      
      // Try to reload the page after a short delay
      setTimeout(() => {
        if (detectWhiteScreen()) {
          console.error('White screen persists, reloading page...')
          window.location.reload()
        }
      }, 2000)
    }
  }
  
  // Check for white screen after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(checkForWhiteScreen, 1000)
    })
  } else {
    setTimeout(checkForWhiteScreen, 1000)
  }
  
  // Set up periodic checks
  whiteScreenTimeout = setInterval(checkForWhiteScreen, 5000)
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    if (whiteScreenTimeout) {
      clearInterval(whiteScreenTimeout)
    }
  })
}

// Debug info export
export const getDebugInfo = () => {
  return {
    ...window.examDebugInfo,
    sessionStorage: {
      exam_errors: sessionStorage.getItem('exam_errors'),
      exam_fetch_error: sessionStorage.getItem('exam_fetch_error'),
      last_error: sessionStorage.getItem('last_error'),
      exam_in_progress: sessionStorage.getItem('exam_in_progress')
    }
  }
}

// Initialize debug utilities
export const initDebugUtils = () => {
  // Set up global error handler
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message), {
      type: 'global_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })
  
  // Set up unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    logError(new Error(event.reason), {
      type: 'unhandled_promise_rejection'
    })
  })
  
  // Set up white screen recovery
  setupWhiteScreenRecovery()
  
  console.log('Debug utilities initialized')
}

// Export debug info to console
window.getExamDebugInfo = getDebugInfo

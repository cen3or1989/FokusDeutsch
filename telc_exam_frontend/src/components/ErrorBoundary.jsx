import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for debugging
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.setState({
      error,
      errorInfo,
      errorId
    })

    // Log error to console for debugging
    console.error('Error Boundary caught an error:', {
      error,
      errorInfo,
      errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    })

    // Store error in session storage for debugging
    try {
      const errorLog = {
        errorId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        }
      }
      sessionStorage.setItem('last_error', JSON.stringify(errorLog))
    } catch (e) {
      console.error('Failed to store error log:', e)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null })
    window.location.reload()
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{backgroundColor: 'var(--background)'}}>
          <div className="max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold mb-2" style={{color: 'var(--foreground)'}}>
                Etwas ist schiefgelaufen
              </h1>
              
              <p className="text-sm mb-6" style={{color: 'var(--muted-foreground)'}}>
                Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
              </p>

              {this.state.errorId && (
                <div className="mb-4 p-3 rounded-lg text-xs" style={{backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)'}}>
                  <strong>Fehler-ID:</strong> {this.state.errorId}
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Seite neu laden
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Zur Startseite
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                    Fehlerdetails (Entwicklung)
                  </summary>
                  <div className="p-3 rounded-lg text-xs font-mono overflow-auto max-h-40" style={{backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)'}}>
                    <div><strong>Error:</strong> {this.state.error.toString()}</div>
                    <div className="mt-2"><strong>Stack:</strong></div>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    {this.state.errorInfo && (
                      <>
                        <div className="mt-2"><strong>Component Stack:</strong></div>
                        <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

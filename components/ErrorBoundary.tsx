import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log error for debugging (in production, you might want to send to error tracking service)
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Store error locally for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('prompt_optimizer_errors') || '[]');
      existingErrors.push(errorData);
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('prompt_optimizer_errors', JSON.stringify(recentErrors));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReportError = () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      componentStack: errorInfo?.componentStack || 'No component stack',
      timestamp: new Date().toISOString()
    };
    
    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2)).then(() => {
      alert('Error report copied to clipboard. Please paste it when reporting the issue.');
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Something went wrong</h2>
            <p className="error-message">
              We're sorry, but something unexpected happened. The error has been logged for debugging.
            </p>
            
            {this.state.error && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre className="error-stack">
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>
                      <br />
                      <br />
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}
            
            <div className="error-actions">
              <button 
                onClick={this.handleRetry}
                className="retry-button"
              >
                Try Again
              </button>
              <button 
                onClick={this.handleReportError}
                className="report-button"
              >
                Copy Error Report
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="reload-button"
              >
                Reload Extension
              </button>
            </div>
            
            <div className="error-help">
              <p>If this problem persists:</p>
              <ul>
                <li>Try refreshing the page</li>
                <li>Check your internet connection</li>
                <li>Verify your API key is valid</li>
                <li>Report the issue on GitHub</li>
              </ul>
            </div>
          </div>
          
          <style jsx>{`
            .error-boundary {
              padding: 20px;
              background: #fff;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              max-width: 500px;
              margin: 20px auto;
            }
            
            .error-container {
              text-align: center;
            }
            
            .error-icon {
              font-size: 48px;
              margin-bottom: 16px;
            }
            
            .error-title {
              color: #dc3545;
              margin-bottom: 12px;
              font-size: 24px;
              font-weight: 600;
            }
            
            .error-message {
              color: #6c757d;
              margin-bottom: 20px;
              line-height: 1.5;
            }
            
            .error-details {
              text-align: left;
              margin: 20px 0;
              padding: 12px;
              background: #f8f9fa;
              border-radius: 4px;
              border: 1px solid #dee2e6;
            }
            
            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              color: #495057;
            }
            
            .error-stack {
              margin-top: 12px;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              color: #dc3545;
              white-space: pre-wrap;
              word-break: break-word;
              max-height: 200px;
              overflow-y: auto;
            }
            
            .error-actions {
              display: flex;
              gap: 12px;
              justify-content: center;
              margin: 20px 0;
              flex-wrap: wrap;
            }
            
            .error-actions button {
              padding: 8px 16px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 500;
              transition: all 0.2s;
            }
            
            .retry-button {
              background: #007bff;
              color: white;
            }
            
            .retry-button:hover {
              background: #0056b3;
            }
            
            .report-button {
              background: #6c757d;
              color: white;
            }
            
            .report-button:hover {
              background: #545b62;
            }
            
            .reload-button {
              background: #28a745;
              color: white;
            }
            
            .reload-button:hover {
              background: #1e7e34;
            }
            
            .error-help {
              text-align: left;
              margin-top: 20px;
              padding: 16px;
              background: #e9ecef;
              border-radius: 4px;
            }
            
            .error-help p {
              margin: 0 0 8px 0;
              font-weight: 600;
              color: #495057;
            }
            
            .error-help ul {
              margin: 0;
              padding-left: 20px;
            }
            
            .error-help li {
              color: #6c757d;
              margin-bottom: 4px;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

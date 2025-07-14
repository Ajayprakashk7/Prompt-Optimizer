// Centralized Error Handling System
// Production-ready error handling with user-friendly messages

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: Date;
  additionalData?: Record<string, any>;
}

export interface UserFriendlyError {
  title: string;
  message: string;
  actionable: boolean;
  actions?: ErrorAction[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorAction {
  label: string;
  action: () => void;
  primary?: boolean;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorLogEntry[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Main error handling method
  handleError(error: Error | string, context?: ErrorContext): UserFriendlyError {
    const errorEntry = this.createErrorEntry(error, context);
    this.logError(errorEntry);
    
    return this.createUserFriendlyError(errorEntry);
  }

  // Handle API-specific errors
  handleApiError(error: any, context?: ErrorContext): UserFriendlyError {
    const errorEntry = this.createErrorEntry(error, { ...context, type: 'api' });
    this.logError(errorEntry);

    // Check for specific API error types
    if (error.message?.includes('API key')) {
      return {
        title: 'API Key Issue',
        message: 'There seems to be an issue with your API key. Please check that it\'s valid and has the necessary permissions.',
        actionable: true,
        actions: [
          {
            label: 'Check API Key',
            action: () => this.openApiKeySettings(),
            primary: true
          },
          {
            label: 'Get New API Key',
            action: () => this.openApiKeyHelp()
          }
        ],
        severity: 'high'
      };
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return {
        title: 'Rate Limit Reached',
        message: 'You\'ve reached your API usage limit. Please wait a moment before trying again or check your quota.',
        actionable: true,
        actions: [
          {
            label: 'Try Again Later',
            action: () => window.location.reload(),
            primary: true
          },
          {
            label: 'Check Quota',
            action: () => this.openQuotaInfo()
          }
        ],
        severity: 'medium'
      };
    }

    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return {
        title: 'Connection Issue',
        message: 'Unable to connect to the AI service. Please check your internet connection and try again.',
        actionable: true,
        actions: [
          {
            label: 'Retry',
            action: () => window.location.reload(),
            primary: true
          }
        ],
        severity: 'medium'
      };
    }

    // Generic API error
    return {
      title: 'Service Unavailable',
      message: 'The AI service is temporarily unavailable. Please try again in a few moments.',
      actionable: true,
      actions: [
        {
          label: 'Retry',
          action: () => window.location.reload(),
          primary: true
        }
      ],
      severity: 'medium'
    };
  }

  // Handle validation errors
  handleValidationError(field: string, message: string): UserFriendlyError {
    return {
      title: 'Input Validation Error',
      message: `${field}: ${message}`,
      actionable: true,
      actions: [
        {
          label: 'Fix Input',
          action: () => this.focusField(field),
          primary: true
        }
      ],
      severity: 'low'
    };
  }

  // Handle storage errors
  handleStorageError(error: any): UserFriendlyError {
    return {
      title: 'Storage Issue',
      message: 'Unable to save your data. Your browser storage might be full or restricted.',
      actionable: true,
      actions: [
        {
          label: 'Clear Old Data',
          action: () => this.clearOldData(),
          primary: true
        },
        {
          label: 'Download Backup',
          action: () => this.downloadBackup()
        }
      ],
      severity: 'medium'
    };
  }

  // Create error entry for logging
  private createErrorEntry(error: Error | string, context?: ErrorContext): ErrorLogEntry {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    return {
      id: this.generateErrorId(),
      message: errorMessage,
      stack: errorStack,
      context: {
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context
      },
      severity: this.determineSeverity(errorMessage),
      resolved: false
    };
  }

  // Create user-friendly error message
  private createUserFriendlyError(errorEntry: ErrorLogEntry): UserFriendlyError {
    const message = errorEntry.message.toLowerCase();

    // Check for common error patterns
    if (message.includes('network') || message.includes('fetch failed')) {
      return {
        title: 'Connection Problem',
        message: 'Unable to connect to the service. Please check your internet connection.',
        actionable: true,
        actions: [
          {
            label: 'Retry',
            action: () => window.location.reload(),
            primary: true
          }
        ],
        severity: 'medium'
      };
    }

    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return {
        title: 'Access Denied',
        message: 'You don\'t have permission to perform this action. Please check your API key.',
        actionable: true,
        actions: [
          {
            label: 'Check Settings',
            action: () => this.openApiKeySettings(),
            primary: true
          }
        ],
        severity: 'high'
      };
    }

    if (message.includes('timeout')) {
      return {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        actionable: true,
        actions: [
          {
            label: 'Try Again',
            action: () => window.location.reload(),
            primary: true
          }
        ],
        severity: 'medium'
      };
    }

    // Generic error
    return {
      title: 'Unexpected Error',
      message: 'Something unexpected happened. The error has been logged for investigation.',
      actionable: true,
      actions: [
        {
          label: 'Retry',
          action: () => window.location.reload(),
          primary: true
        },
        {
          label: 'Report Issue',
          action: () => this.reportError(errorEntry)
        }
      ],
      severity: errorEntry.severity
    };
  }

  // Log error for debugging
  private logError(errorEntry: ErrorLogEntry): void {
    console.error('Error logged:', errorEntry);
    
    this.errorLog.push(errorEntry);
    
    // Keep only last 50 errors
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(-50);
    }

    // Store in local storage for debugging
    try {
      localStorage.setItem('prompt_optimizer_error_log', JSON.stringify(this.errorLog));
    } catch (e) {
      console.warn('Failed to store error log:', e);
    }
  }

  // Determine error severity
  private determineSeverity(message: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('critical') || lowerMessage.includes('fatal')) {
      return 'critical';
    }
    
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('api key')) {
      return 'high';
    }
    
    if (lowerMessage.includes('network') || lowerMessage.includes('timeout')) {
      return 'medium';
    }
    
    return 'low';
  }

  // Action handlers
  private openApiKeySettings(): void {
    // Implementation would open API key settings
    console.log('Opening API key settings...');
  }

  private openApiKeyHelp(): void {
    window.open('https://makersuite.google.com/app/apikey', '_blank');
  }

  private openQuotaInfo(): void {
    window.open('https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas', '_blank');
  }

  private focusField(field: string): void {
    const element = document.querySelector(`[data-field="${field}"]`) as HTMLElement;
    if (element) {
      element.focus();
    }
  }

  private clearOldData(): void {
    // Implementation would clear old data
    console.log('Clearing old data...');
  }

  private downloadBackup(): void {
    // Implementation would download backup
    console.log('Downloading backup...');
  }

  private reportError(errorEntry: ErrorLogEntry): void {
    const errorReport = {
      id: errorEntry.id,
      message: errorEntry.message,
      timestamp: errorEntry.context.timestamp,
      userAgent: errorEntry.context.userAgent
    };
    
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2)).then(() => {
      alert('Error report copied to clipboard. Please paste it when reporting the issue on GitHub.');
    });
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  // Public API methods
  getErrorLog(): ErrorLogEntry[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
    localStorage.removeItem('prompt_optimizer_error_log');
  }

  markErrorResolved(errorId: string): void {
    const error = this.errorLog.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }
}

// Supporting interfaces
interface ErrorLogEntry {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext & {
    timestamp: Date;
    userAgent: string;
    url: string;
    type?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Global error handler setup
window.addEventListener('error', (event) => {
  errorHandler.handleError(event.error || event.message, {
    component: 'global',
    action: 'unhandled_error'
  });
});

window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handleError(event.reason, {
    component: 'global',
    action: 'unhandled_promise_rejection'
  });
});

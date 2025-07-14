import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#007bff',
  message 
}) => {
  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '32px'
  };

  return (
    <div className="loading-container">
      <div className="spinner" />
      {message && <p className="loading-message">{message}</p>}
      
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .spinner {
          width: ${sizeMap[size]};
          height: ${sizeMap[size]};
          border: 2px solid #f3f3f3;
          border-top: 2px solid ${color};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .loading-message {
          margin: 0;
          font-size: 14px;
          color: #666;
          text-align: center;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

interface ProgressBarProps {
  progress: number; // 0-100
  message?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  message,
  showPercentage = true 
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className="progress-container">
      {message && <p className="progress-message">{message}</p>}
      <div className="progress-bar">
        <div className="progress-fill" />
      </div>
      {showPercentage && (
        <span className="progress-percentage">{Math.round(clampedProgress)}%</span>
      )}
      
      <style jsx>{`
        .progress-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .progress-message {
          margin: 0;
          font-size: 14px;
          color: #666;
          text-align: center;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #007bff, #0056b3);
          border-radius: 4px;
          width: ${clampedProgress}%;
          transition: width 0.3s ease;
          position: relative;
        }
        
        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 2s infinite;
        }
        
        .progress-percentage {
          font-size: 12px;
          color: #666;
          text-align: center;
          font-weight: 500;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px',
  borderRadius = '4px',
  count = 1 
}) => {
  return (
    <div className="skeleton-container">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton" />
      ))}
      
      <style jsx>{`
        .skeleton-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .skeleton {
          width: ${width};
          height: ${height};
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          border-radius: ${borderRadius};
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  onCancel?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = 'Processing...',
  progress,
  onCancel 
}) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <LoadingSpinner size="large" message={message} />
        
        {typeof progress === 'number' && (
          <div className="progress-section">
            <ProgressBar progress={progress} showPercentage />
          </div>
        )}
        
        {onCancel && (
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
      
      <style jsx>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(2px);
        }
        
        .loading-content {
          background: white;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          min-width: 300px;
          text-align: center;
        }
        
        .progress-section {
          margin-top: 20px;
          width: 100%;
        }
        
        .cancel-button {
          margin-top: 20px;
          padding: 8px 16px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }
        
        .cancel-button:hover {
          background: #545b62;
        }
      `}</style>
    </div>
  );
};

// Utility hook for managing loading states
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [progress, setProgress] = React.useState(0);
  const [message, setMessage] = React.useState('');

  const startLoading = (loadingMessage = 'Loading...') => {
    setIsLoading(true);
    setProgress(0);
    setMessage(loadingMessage);
  };

  const updateProgress = (newProgress: number, newMessage?: string) => {
    setProgress(newProgress);
    if (newMessage) setMessage(newMessage);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setProgress(0);
    setMessage('');
  };

  return {
    isLoading,
    progress,
    message,
    startLoading,
    updateProgress,
    stopLoading
  };
};

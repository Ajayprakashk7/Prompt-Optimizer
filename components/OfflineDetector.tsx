import React, { useState, useEffect } from 'react';

interface OfflineDetectorProps {
  children: React.ReactNode;
}

export const OfflineDetector: React.FC<OfflineDetectorProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    if (!navigator.onLine) {
      setShowOfflineMessage(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {showOfflineMessage && (
        <div className="offline-banner">
          <div className="offline-content">
            <span className="offline-icon">📡</span>
            <div className="offline-text">
              <strong>You're offline</strong>
              <p>Some features may not work without an internet connection. Your data is saved locally.</p>
            </div>
            <button 
              className="offline-dismiss"
              onClick={() => setShowOfflineMessage(false)}
              aria-label="Dismiss offline notification"
            >
              ✕
            </button>
          </div>
          
          <style jsx>{`
            .offline-banner {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: linear-gradient(135deg, #ff6b6b, #ee5a24);
              color: white;
              padding: 12px 16px;
              z-index: 1000;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
              animation: slideDown 0.3s ease-out;
            }
            
            .offline-content {
              display: flex;
              align-items: center;
              gap: 12px;
              max-width: 500px;
              margin: 0 auto;
            }
            
            .offline-icon {
              font-size: 20px;
              flex-shrink: 0;
            }
            
            .offline-text {
              flex: 1;
            }
            
            .offline-text strong {
              display: block;
              font-size: 14px;
              margin-bottom: 2px;
            }
            
            .offline-text p {
              font-size: 12px;
              margin: 0;
              opacity: 0.9;
            }
            
            .offline-dismiss {
              background: rgba(255, 255, 255, 0.2);
              border: none;
              color: white;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              transition: background 0.2s;
              flex-shrink: 0;
            }
            
            .offline-dismiss:hover {
              background: rgba(255, 255, 255, 0.3);
            }
            
            @keyframes slideDown {
              from {
                transform: translateY(-100%);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
      
      <div className={showOfflineMessage ? 'content-with-offline-banner' : ''}>
        {children}
      </div>
      
      <style jsx>{`
        .content-with-offline-banner {
          margin-top: 60px;
          transition: margin-top 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default OfflineDetector;

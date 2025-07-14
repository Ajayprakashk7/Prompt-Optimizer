
import React from 'react';
// @ts-ignore
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Performance optimization: Start rendering immediately
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Use concurrent features for better performance
const root = ReactDOM.createRoot(rootElement);

// Render immediately without StrictMode in production for better performance
if (process.env.NODE_ENV === 'development') {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Production: Skip StrictMode for faster startup
  root.render(<App />);
}

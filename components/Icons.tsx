import { memo } from 'react';

// Optimized icon components with memo for performance
export const LogoIcon = memo(() => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA"/>
        <stop offset="1" stopColor="#4F46E5"/>
      </linearGradient>
    </defs>
    <path fillRule="evenodd" clipRule="evenodd" d="M24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6ZM24 8.25C15.3041 8.25 8.25 15.3041 8.25 24C8.25 32.6959 15.3041 39.75 24 39.75C32.6959 39.75 39.75 32.6959 39.75 24C39.75 15.3041 32.6959 8.25 24 8.25Z" fill="url(#logoGradient)" fillOpacity="0.3"/>
    <path d="M24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0ZM24 44C13.0096 44 4 34.9904 4 24C4 13.0096 13.0096 4 24 4C34.9904 4 44 13.0096 44 24C44 34.9904 34.9904 44 24 44Z" fill="url(#logoGradient)"/>
    <path d="M29.5 21L27 18.5L24 15.5L21.5 18.5L18.5 21.5L24 27L29.5 21Z" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 27V33" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));

export const MagicWandIcon = memo(() => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-3.53-3.53l-1.5 1.5a3 3 0 003.53 3.53l1.5-1.5zM20.47 4.53a3 3 0 00-3.53-3.53l-1.5 1.5a3 3 0 003.53 3.53l1.5-1.5zM12 12l6-6m-6 6l-6 6" />
  </svg>
));

export const UserCircleIcon = memo(() => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
));

export const PaintBrushIcon = memo(() => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
  </svg>
));

export const CopyIcon = memo(() => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
));

export const CheckIcon = memo(() => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
));

export const SettingsIcon = memo(() => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 1-1.087-1.087L2.25 12l2.846-.813a4.5 4.5 0 0 1 1.087-1.087L9 6.25l.813 2.846a4.5 4.5 0 0 1 1.087 1.087L15 12l-2.846.813a4.5 4.5 0 0 1-1.087 1.087L9.813 15.904Z" />
  </svg>
));

export const DownloadIcon = memo(() => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
));

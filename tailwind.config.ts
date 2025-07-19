import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      colors: {
        // Role-specific colors
        admin: {
          primary: '#dc2626',
        },
        therapist: {
          primary: '#059669',
        },
        client: {
          primary: '#2563eb',
        },
        assistant: {
          primary: '#7c3aed',
        },
        bookkeeper: {
          primary: '#ea580c',
        },
        // Status colors
        status: {
          active: '#10b981',
          inactive: '#6b7280',
          pending: '#f59e0b',
          suspended: '#ef4444',
          vacation: '#8b5cf6',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'notification-enter': 'notificationEnter 0.3s ease-out',
        'notification-exit': 'notificationExit 0.3s ease-in',
        'notification-bounce': 'notificationBounce 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideIn: {
          from: { transform: 'translateX(-100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        notificationEnter: {
          from: { 
            transform: 'translateX(100%) scale(0.9)', 
            opacity: '0' 
          },
          to: { 
            transform: 'translateX(0) scale(1)', 
            opacity: '1' 
          },
        },
        notificationExit: {
          from: { 
            transform: 'translateX(0) scale(1)', 
            opacity: '1' 
          },
          to: { 
            transform: 'translateX(100%) scale(0.9)', 
            opacity: '0' 
          },
        },
        notificationBounce: {
          '0%': { 
            transform: 'translateX(100%) scale(0.9)', 
            opacity: '0' 
          },
          '60%': { 
            transform: 'translateX(-10px) scale(1.02)', 
            opacity: '1' 
          },
          '100%': { 
            transform: 'translateX(0) scale(1)', 
            opacity: '1' 
          },
        },
      },
    },
  },
  plugins: [forms],
} satisfies Config
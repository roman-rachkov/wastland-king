import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './utils/configCheck' // Check image upload configuration on startup

// Глобальный обработчик ошибок для диагностики
window.addEventListener('error', (event) => {
  console.error('Global error caught:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    stack: event.error?.stack
  });
});

// Обработчик необработанных промисов
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', {
    reason: event.reason,
    promise: event.promise
  });
});

// Обработчик ошибок React
const originalConsoleError = console.error;
console.error = (...args) => {
  // Логируем все ошибки консоли
  originalConsoleError.apply(console, args);
  
  // Дополнительно логируем ошибки DOM
  if (args[0] && typeof args[0] === 'string' && args[0].includes('removeChild')) {
    console.error('DOM removeChild error detected:', {
      args,
      stack: new Error().stack
    });
  }
  
  // Логируем ошибки React
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Warning:')) {
    console.error('React warning detected:', {
      args,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    });
  }
  
  // Логируем ошибки рендеринга
  if (args[0] && typeof args[0] === 'string' && (args[0].includes('render') || args[0].includes('component'))) {
    console.error('React render error detected:', {
      args,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    });
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)

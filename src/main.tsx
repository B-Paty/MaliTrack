import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { DateRangeProvider } from '@/contexts/DateRangeContext'

createRoot(document.getElementById("root")!).render(
  <DateRangeProvider>
    <App />
  </DateRangeProvider>
);

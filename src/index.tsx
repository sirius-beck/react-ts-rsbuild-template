import App from '@/app'
import { createRoot } from 'react-dom/client'
import './global.css'

const rootEl = document.getElementById('root')

if (!rootEl) {
  throw new Error('Root element not found')
}

createRoot(rootEl).render(<App />)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import SignUp from './pages/sign-up';
import Implement from './pages/implement';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/implement" element={<Implement />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import SignUp from './pages/sign-up';
import Implement from './pages/implement';
import About from './pages/about';
import Login from './pages/login';
import Payments from './pages/payments';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/implement" element={<Implement />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payments" element={<Payments />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
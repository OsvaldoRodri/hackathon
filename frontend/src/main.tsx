import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import SignUp from './pages/sign-up';
import Implement from './pages/implement';
import About from './pages/about';
import Login from './pages/login';
import Payments from './pages/payments';
import ProcesPayments from './pages/procespayments';
import Admin from './pages/admin';
import Treasurer from './pages/treasurer';
import AdminViviendas from './pages/admin-viviendas';
import AdminUsuarios from './pages/admin-usuarios';
import AdminWallets from './pages/admin-wallets';
import Help from './pages/help';

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
        <Route path="/procespayments" element={<ProcesPayments />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/viviendas" element={<AdminViviendas />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/admin/wallets" element={<AdminWallets />} />
        <Route path="/treasurer" element={<Treasurer />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
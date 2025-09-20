import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';
import '../styles/admin.css';
import Header from '../components/header';
import Footer from '../components/footer';

function Admin(): React.JSX.Element {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Verificar si el usuario está logueado y es administrador
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    
    if (!token || role !== 'admin') {
      window.location.href = '/login';
      return;
    }
    
    setUserEmail(email || 'admin@quickpay.com');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  return (
    <>
      <Header />
      <main>
        <div className="main-content">
          <div className="admin-container">
            
            {/* Header del dashboard */}
            <div className="admin-header">
              <div className="user-info">
                <h1>Panel de Administración</h1>
                <p>Bienvenido, {userEmail}</p>
              </div>
              <button onClick={handleLogout} className="logout-button">
                Cerrar Sesión
              </button>
            </div>

            {/* Grid de opciones administrativas */}
            <div className="admin-grid">
              
              {/* Gestión de Viviendas */}
              <div className="admin-card">
                <div className="card-icon">🏠</div>
                <div className="card-content">
                  <h3>Gestión de Viviendas</h3>
                  <p>Registrar, editar y eliminar viviendas del sistema</p>
                  <div className="card-actions">
                    <button 
                      className="action-btn primary"
                      onClick={() => navigate('/admin/viviendas')}
                    >
                      Gestionar Viviendas
                    </button>
                  </div>
                </div>
              </div>

              {/* Gestión de Usuarios */}
              <div className="admin-card">
                <div className="card-icon">👥</div>
                <div className="card-content">
                  <h3>Gestión de Usuarios</h3>
                  <p>Registrar, editar y eliminar usuarios del sistema</p>
                  <div className="card-actions">
                    <button 
                      className="action-btn primary"
                      onClick={() => navigate('/admin/usuarios')}
                    >
                      Gestionar Usuarios
                    </button>
                  </div>
                </div>
              </div>

              {/* Acceso a Vista de Tesorero */}
              <div className="admin-card">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <h3>Vista de Tesorero</h3>
                  <p>Acceder a la vista de tesorero para revisar recibos</p>
                  <div className="card-actions">
                    <button 
                      className="action-btn secondary"
                      onClick={() => navigate('/treasurer')}
                    >
                      Vista Tesorero
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Admin;